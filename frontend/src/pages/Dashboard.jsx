import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarProcessos, deletarProcesso } from '../services/api';

export default function Dashboard() {
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');

  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  // Carrega processos do backend via services/api.js (sem fetch direto!)
  const carregarDados = async () => {
    try {
      const dados = await listarProcessos();
      setProcessos(Array.isArray(dados) ? dados : []);
    } catch (err) {
      setErro(err.message || 'Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  // Excluir processo
  const handleExcluir = async (id) => {
    if (!window.confirm('Deseja remover este processo?')) return;
    try {
      await deletarProcesso(id);
      await carregarDados();
    } catch (err) {
      alert(err.message || 'Erro ao excluir processo.');
    }
  };

  // Busca por empresa, tipo ou requerente
  const processosFiltrados = processos.filter(p =>
    (p.razao_social || p.empresa || '').toLowerCase().includes(busca.toLowerCase()) ||
    (p.numero_processo || p.numero || '').toLowerCase().includes(busca.toLowerCase()) ||
    (p.requerente || p.nome_requerente || '').toLowerCase().includes(busca.toLowerCase())
  );

  // Métricas calculadas a partir dos processos carregados
  const metricas = {
    total: processos.length,
    emAnalise: processos.filter(p => (p.status || '').toLowerCase().includes('andamento') || (p.status || '').toLowerCase().includes('análise')).length,
    aprovados: processos.filter(p => (p.status || '').toLowerCase().includes('concluído') || (p.status || '').toLowerCase().includes('aprovado')).length
  };

  const cardsKpi = [
    { label: 'Total de Processos', value: metricas.total, border: '#0284c7', color: '#38bdf8' },
    { label: 'Em Análise', value: metricas.emAnalise, border: '#2563eb', color: '#60a5fa' },
    { label: 'Concluídos', value: metricas.aprovados, border: '#16a34a', color: '#4ade80' }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#fff', fontFamily: 'Inter, sans-serif' }}>

      {/* NAVBAR */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Intranet JUCEPE</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>Olá, <strong>{usuario.nome || 'Usuário'}</strong></span>
          <button onClick={handleLogout} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
            Sair
          </button>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main style={{ maxWidth: '1100px', margin: '32px auto', padding: '0 20px' }}>

        {/* CARDS ESTATÍSTICOS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {cardsKpi.map((card, idx) => (
            <div key={idx} style={{
              backgroundColor: '#0f172a',
              borderLeft: `4px solid ${card.border}`,
              borderTop: '1px solid #1e293b',
              borderRight: '1px solid #1e293b',
              borderBottom: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '16px 20px'
            }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>
                {card.label}
              </p>
              <h3 style={{ margin: 0, fontSize: '28px', color: card.color, fontWeight: '800' }}>
                {loading ? '...' : card.value}
              </h3>
            </div>
          ))}
        </div>

        {/* BARRA DE BUSCA */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Buscar por processo, empresa ou requerente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ flex: 1, padding: '12px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#fff', outline: 'none' }}
          />
          <button
            onClick={() => navigate('/processos')}
            style={{ backgroundColor: '#0070f3', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
          >
            + Novo Processo
          </button>
        </div>

        {/* TABELA DE PROCESSOS */}
        {loading ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>Carregando dados...</p>
        ) : erro ? (
          <p style={{ color: '#f87171' }}>{erro}</p>
        ) : (
          <div style={{ backgroundColor: '#0f172a', borderRadius: '8px', overflow: 'hidden', border: '1px solid #1e293b' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#1e293b', color: '#94a3b8', fontSize: '13px' }}>
                  <th style={{ padding: '14px' }}>EMPRESA</th>
                  <th style={{ padding: '14px' }}>TIPO DE ATO</th>
                  <th style={{ padding: '14px' }}>REQUERENTE</th>
                  <th style={{ padding: '14px' }}>STATUS</th>
                  <th style={{ padding: '14px' }}>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {processosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                      Nenhum processo encontrado.
                    </td>
                  </tr>
                ) : (
                  processosFiltrados.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #1e293b', fontSize: '14px' }}>
                      <td style={{ padding: '14px' }}>{item.razao_social || item.empresa || '-'}</td>
                      <td style={{ padding: '14px' }}>{item.tipo || item.tipo_ato || '-'}</td>
                      <td style={{ padding: '14px', color: '#cbd5e1' }}>{item.requerente || item.nome_requerente || '—'}</td>
                      <td style={{ padding: '14px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor:
                            (item.status === 'Concluído' || item.status === 'Aprovado') ? '#065f46' :
                            (item.status === 'Indeferido') ? '#7f1d1d' : '#1e3a8a',
                          color:
                            (item.status === 'Concluído' || item.status === 'Aprovado') ? '#34d399' :
                            (item.status === 'Indeferido') ? '#fca5a5' : '#93c5fd'
                        }}>
                          {item.status || 'Em Análise'}
                        </span>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <button
                          onClick={() => handleExcluir(item.id)}
                          style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                        >
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
