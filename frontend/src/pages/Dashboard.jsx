import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [processos, setProcessos] = useState([]);
  const [metricas, setMetricas] = useState({ total: 0, emAnalise: 0, aprovados: 0, exigencia: 0, indeferidos: 0 });
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');

  // Estados do Formulário
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novoProcesso, setNovoProcesso] = useState({ empresa: '', tipo: '', requerente: '' });

  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  // 1. CARREGAR DADOS DO BACKEND
  const carregarDados = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const [resProcessos, resMetricas] = await Promise.all([
        fetch('http://localhost:3000/processos', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:3000/dashboard/metricas', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (resProcessos.status === 401 || resProcessos.status === 403) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      if (resProcessos.ok) setProcessos(await resProcessos.json());
      if (resMetricas.ok) setMetricas(await resMetricas.json());

    } catch (err) {
      setErro('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // 2. CADASTRAR PROCESSO
  const handleCriarProcesso = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:3000/processos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(novoProcesso)
      });

      const data = await response.json();

      if (response.ok) {
        setNovoProcesso({ empresa: '', tipo: '', requerente: '' });
        setMostrarForm(false);
        carregarDados();
      } else {
        alert(data.mensagem || 'Erro ao cadastrar processo.');
      }
    } catch (err) {
      alert('Erro de conexão ao salvar processo.');
    }
  };

  // 3. EXCLUIR PROCESSO
  const handleExcluir = async (id) => {
    if (!window.confirm('Deseja remover este processo?')) return;
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:3000/processos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) carregarDados();
    } catch (err) {
      alert('Erro ao excluir processo.');
    }
  };

  // 4. LOGOUT
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Busca abrangendo Empresa, Protocolo e Requerente/Funcionário
  const processosFiltrados = processos.filter(p => 
    p.empresa?.toLowerCase().includes(busca.toLowerCase()) ||
    p.numero?.toLowerCase().includes(busca.toLowerCase()) ||
    p.requerente?.toLowerCase().includes(busca.toLowerCase())
  );

  const cardsKpi = [
    { label: 'Total de Processos', value: metricas.total, border: '#0284c7', color: '#38bdf8' },
    { label: 'Em Análise', value: metricas.emAnalise, border: '#2563eb', color: '#60a5fa' },
    { label: 'Concluídos / Deferidos', value: metricas.aprovados, border: '#16a34a', color: '#4ade80' },
    { label: 'Com Exigência', value: metricas.exigencia, border: '#ca8a04', color: '#facc15' },
    { label: 'Indeferidos', value: metricas.indeferidos, border: '#dc2626', color: '#f87171' }
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

        {/* BARRA DE AÇÕES */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Buscar por protocolo, empresa ou funcionário..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ flex: 1, padding: '12px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#fff', outline: 'none' }}
          />
          <button 
            onClick={() => setMostrarForm(!mostrarForm)} 
            style={{ backgroundColor: '#0070f3', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
          >
            {mostrarForm ? 'Fechar Form' : '+ Novo Processo'}
          </button>
        </div>

        {/* FORMULÁRIO */}
        {mostrarForm && (
          <form onSubmit={handleCriarProcesso} style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px', marginBottom: '24px', display: 'grid', gap: '12px' }}>
            <h3 style={{ fontSize: '16px', margin: '0 0 8px 0' }}>Cadastrar Novo Processo</h3>
            <input
              type="text"
              placeholder="Nome da Empresa *"
              required
              value={novoProcesso.empresa}
              onChange={(e) => setNovoProcesso({...novoProcesso, empresa: e.target.value})}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', outline: 'none' }}
            />
            <input
              type="text"
              placeholder="Tipo de Ato (Ex: Abertura, Alteração) *"
              required
              value={novoProcesso.tipo}
              onChange={(e) => setNovoProcesso({...novoProcesso, tipo: e.target.value})}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', outline: 'none' }}
            />
            <input
              type="text"
              placeholder="Funcionário / Requerente"
              value={novoProcesso.requerente}
              onChange={(e) => setNovoProcesso({...novoProcesso, requerente: e.target.value})}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', outline: 'none' }}
            />
            <button type="submit" style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              Salvar Processo
            </button>
          </form>
        )}

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
                  <th style={{ padding: '14px' }}>PROTOCOLO</th>
                  <th style={{ padding: '14px' }}>EMPRESA</th>
                  <th style={{ padding: '14px' }}>TIPO DE ATO</th>
                  <th style={{ padding: '14px' }}>REQUERENTE</th>
                  <th style={{ padding: '14px' }}>DATA</th>
                  <th style={{ padding: '14px' }}>STATUS</th>
                  <th style={{ padding: '14px' }}>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {processosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                      Nenhum processo encontrado.
                    </td>
                  </tr>
                ) : (
                  processosFiltrados.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #1e293b', fontSize: '14px' }}>
                      <td style={{ padding: '14px', fontWeight: '600', color: '#38bdf8' }}>{item.numero}</td>
                      <td style={{ padding: '14px' }}>{item.empresa}</td>
                      <td style={{ padding: '14px' }}>{item.tipo}</td>
                      <td style={{ padding: '14px', color: '#cbd5e1' }}>{item.requerente || '—'}</td>
                      <td style={{ padding: '14px', color: '#94a3b8' }}>{item.data}</td>
                      <td style={{ padding: '14px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: 
                            item.status === 'Concluído' || item.status === 'Aprovado' ? '#065f46' : 
                            item.status === 'Com Exigência' ? '#78350f' :
                            item.status === 'Indeferido' ? '#7f1d1d' : '#1e3a8a',
                          color: 
                            item.status === 'Concluído' || item.status === 'Aprovado' ? '#34d399' : 
                            item.status === 'Com Exigência' ? '#fde68a' :
                            item.status === 'Indeferido' ? '#fca5a5' : '#93c5fd'
                        }}>
                          {item.status}
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