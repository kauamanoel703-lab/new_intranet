import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { listarProcessos, cadastrarProcesso, deletarProcesso } from '../services/api';
import { ETAPAS_FLUXO } from '../data/dashboardData.jsx';

import WelcomeHeader from '../components/dashboard/WelcomeHeader';
import EtapasGrid from '../components/dashboard/EtapasGrid';
import AtalhosRapidos from '../components/dashboard/AtalhosRapidos';
import ComunicadosCard from '../components/dashboard/ComunicadosCard';

import '../styles/dashboard.css';

export default function Dashboard() {
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novoProcesso, setNovoProcesso] = useState({ empresa: '', tipo: '', requerente: '' });
  const [etapaSelecionada, setEtapaSelecionada] = useState(null);

  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const STATUS_MAP = useMemo(() => ({
    protocolo: ['Protocolado', 'Recebido'],
    analise: ['Em Análise', 'Com Exigência'],
    assinatura: ['Aprovado', 'Deferido'],
    arquivo: ['Concluído', 'Indeferido'],
  }), []);

  const carregarDados = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    try {
      const data = await listarProcessos();
      setProcessos(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.message === 'Sessão expirada.' || err.message === 'Acesso negado. Token não informado.') {
        localStorage.clear();
        navigate('/login');
        return;
      }
      setErro('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const metricas = useMemo(() => ({
    total: processos.length,
    emAnalise: processos.filter((p) => p.status === 'Em Análise').length,
    aprovados: processos.filter((p) => p.status === 'Aprovado' || p.status === 'Deferido' || p.status === 'Concluído').length,
    exigencia: processos.filter((p) => p.status === 'Com Exigência').length,
    indeferidos: processos.filter((p) => p.status === 'Indeferido').length,
  }), [processos]);

  const etapas = useMemo(() =>
    ETAPAS_FLUXO.map((etapa) => ({
      ...etapa,
      contador: etapa.id === 'protocolo'
        ? processos.filter((p) => STATUS_MAP.protocolo.includes(p.status)).length
        : etapa.id === 'analise'
          ? processos.filter((p) => STATUS_MAP.analise.includes(p.status)).length
          : etapa.id === 'assinatura'
            ? processos.filter((p) => STATUS_MAP.assinatura.includes(p.status)).length
            : processos.filter((p) => STATUS_MAP.arquivo.includes(p.status)).length,
    })),
  [processos, STATUS_MAP]);

  const cardsKpi = [
    { label: 'Total de Processos', value: metricas.total, cor: '#38bdf8' },
    { label: 'Em Análise', value: metricas.emAnalise, cor: '#60a5fa' },
    { label: 'Concluídos / Deferidos', value: metricas.aprovados, cor: '#4ade80' },
    { label: 'Com Exigência', value: metricas.exigencia, cor: '#facc15' },
    { label: 'Indeferidos', value: metricas.indeferidos, cor: '#f87171' },
  ];

  const handleCriarProcesso = async (e) => {
    e.preventDefault();
    try {
      await cadastrarProcesso(novoProcesso);
      setNovoProcesso({ empresa: '', tipo: '', requerente: '' });
      setMostrarForm(false);
      carregarDados();
    } catch (err) {
      alert(err.message || 'Erro de conexão ao salvar processo.');
    }
  };

  const handleExcluir = async (id) => {
    if (!window.confirm('Deseja remover este processo?')) return;
    try {
      await deletarProcesso(id);
      carregarDados();
    } catch (err) {
      alert(err.message || 'Erro ao excluir processo.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  const handleSelecionarEtapa = (etapa) => {
    setEtapaSelecionada((prev) => (prev?.id === etapa.id ? null : etapa));
    setBusca('');
  };

  const processosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase();
    return processos.filter((p) =>
      p.empresa?.toLowerCase().includes(termo) ||
      p.numero?.toLowerCase().includes(termo) ||
      p.requerente?.toLowerCase().includes(termo)
    );
  }, [processos, busca]);

  const processosFiltradosPorEtapa = useMemo(() => {
    if (!etapaSelecionada) return processosFiltrados;
    const statuses = STATUS_MAP[etapaSelecionada.id] || [];
    return processosFiltrados.filter((p) => statuses.includes(p.status));
  }, [processosFiltrados, etapaSelecionada, STATUS_MAP]);

  const statusChip = (status) => {
    const mapa = {
      'Concluído': { bg: '#065f46', cor: '#34d399' },
      'Aprovado': { bg: '#065f46', cor: '#34d399' },
      'Deferido': { bg: '#065f46', cor: '#34d399' },
      'Com Exigência': { bg: '#78350f', cor: '#fde68a' },
      'Indeferido': { bg: '#7f1d1d', cor: '#fca5a5' },
      'Em Análise': { bg: '#1e3a8a', cor: '#93c5fd' },
      'Protocolado': { bg: '#164e63', cor: '#67e8f9' },
      'Recebido': { bg: '#164e63', cor: '#67e8f9' },
    };
    const st = mapa[status];
    return (
      <span className="status-chip" style={{ backgroundColor: st?.bg || '#1e293b', color: st?.cor || '#94a3b8' }}>
        {status}
      </span>
    );
  };

  return (
    <div className="dashboard-shell">
      {/* NAVBAR */}
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <div className="dashboard-logo-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-6 9 6v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
              <path d="M9 21V12h6v9" />
            </svg>
          </div>
          <h1>Intranet JUCEPE</h1>
        </div>
        <div className="dashboard-user">
          <div>
            <span className="dashboard-user-info">Autenticado como</span>
            <strong>{usuario.nome || 'Usuário'}</strong>
          </div>
          <button className="dashboard-btn-sair" onClick={handleLogout}>Sair</button>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="dashboard-main">
        <WelcomeHeader usuarioNome={usuario.nome} />

        {/* KPI + COMUNICADOS */}
        <section className="dashboard-secao-duplas">
          <div className="dashboard-secao">
            <h2 className="secao-titulo">Visão Geral</h2>
            <div className="kpi-grid">
              {cardsKpi.map((card, idx) => (
                <div key={idx} className="kpi-card" style={{ '--kpi-cor': card.cor }}>
                  <p className="kpi-label">{card.label}</p>
                  <h3 className="kpi-value">{loading ? '…' : card.value}</h3>
                </div>
              ))}
            </div>
          </div>

          <ComunicadosCard />
        </section>

        {/* FLUXOS */}
        <section className="dashboard-secao">
          <h2 className="secao-titulo">Fluxos da Intranet</h2>
          <EtapasGrid
            etapas={etapas}
            onSelecionarEtapa={handleSelecionarEtapa}
            etapaSelecionada={etapaSelecionada}
          />
        </section>

        {/* ATALHOS RÁPIDOS */}
        <AtalhosRapidos />

        {/* AÇÕES */}
        <div className="acoes-barra">
          {etapaSelecionada && (
            <button className="acoes-filtro" onClick={() => setEtapaSelecionada(null)}>
              ✕ Limpar filtro: {etapaSelecionada.titulo}
            </button>
          )}
          <input
            type="text"
            className="acoes-busca"
            placeholder="Buscar por protocolo, empresa ou funcionário..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <button className="btn-primario" onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? 'Fechar Form' : '+ Novo Processo'}
          </button>
        </div>

        {/* FORMULÁRIO */}
        {mostrarForm && (
          <form className="form-card" onSubmit={handleCriarProcesso}>
            <h3>Cadastrar Novo Processo</h3>
            <input
              type="text"
              className="form-input"
              placeholder="Nome da Empresa *"
              required
              value={novoProcesso.empresa}
              onChange={(e) => setNovoProcesso({ ...novoProcesso, empresa: e.target.value })}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Tipo de Ato (Ex: Abertura, Alteração) *"
              required
              value={novoProcesso.tipo}
              onChange={(e) => setNovoProcesso({ ...novoProcesso, tipo: e.target.value })}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Funcionário / Requerente"
              value={novoProcesso.requerente}
              onChange={(e) => setNovoProcesso({ ...novoProcesso, requerente: e.target.value })}
            />
            <button type="submit" className="btn-suave">Salvar Processo</button>
          </form>
        )}

        {/* TABELA */}
        {loading ? (
          <p className="estado-mensagem">Carregando dados...</p>
        ) : erro ? (
          <p className="estado-mensagem" style={{ color: '#f87171' }}>{erro}</p>
        ) : (
          <div className="tabela-wrapper">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Protocolo</th>
                  <th>Empresa</th>
                  <th>Tipo de Ato</th>
                  <th>Requerente</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {processosFiltradosPorEtapa.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="tabela-vazio">
                      {etapaSelecionada
                        ? `Nenhum processo na etapa "${etapaSelecionada.titulo}".`
                        : 'Nenhum processo encontrado.'}
                    </td>
                  </tr>
                ) : (
                  processosFiltradosPorEtapa.map((item) => (
                    <tr key={item.id}>
                      <td className="protocolo-cell">{item.numero}</td>
                      <td>{item.empresa}</td>
                      <td>{item.tipo}</td>
                      <td>{item.requerente || '—'}</td>
                      <td>{item.data}</td>
                      <td>{statusChip(item.status)}</td>
                      <td>
                        <button className="btn-excluir" onClick={() => handleExcluir(item.id)}>
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}