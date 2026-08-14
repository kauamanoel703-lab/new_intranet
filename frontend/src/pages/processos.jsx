import React, { useState, useEffect } from 'react';

export default function Processos() {
  const [processos, setProcessos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Estados do Formulário
  const [modalAberto, setModalAberto] = useState(false);
  const [empresa, setEmpresa] = useState('');
  const [tipo, setTipo] = useState('Abertura de Empresa');
  const [requerente, setRequerente] = useState('');

  // Buscar processos do Backend
  const carregarProcessos = async () => {
    setCarregando(true);
    setErro('');
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:3000/processos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Sessão expirada. Por favor, faça login novamente para continuar.');
        }
        throw new Error('Não foi possível conectar ao servidor de banco de dados.');
      }

      const data = await response.json();
      setProcessos(data);
    } catch (err) {
      setErro(err.message || 'Falha ao carregar a lista de processos.');
      console.error('Detalhes da requisição:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarProcessos();
  }, []);

  // Cadastrar Novo Processo
  const handleCadastrar = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:3000/processos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ empresa, tipo, requerente })
      });

      if (response.ok) {
        setEmpresa('');
        setRequerente('');
        setModalAberto(false);
        carregarProcessos();
      } else {
        alert('Erro ao cadastrar o processo. Verifique os dados informados.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de comunicação com o servidor backend.');
    }
  };

  // Renderização do Badge de Status
  const renderStatusBadge = (status) => {
    const isAprovado = status === 'Aprovado';
    const isExigencia = status === 'Com Exigência';
    const isIndeferido = status === 'Indeferido';

    let bgColor = '#1e3a8a';
    let textColor = '#93c5fd';
    let borderColor = '#1d4ed8';

    if (isAprovado) {
      bgColor = '#064e3b';
      textColor = '#6ee7b7';
      borderColor = '#047857';
    } else if (isExigencia) {
      bgColor = '#78350f';
      textColor = '#fde68a';
      borderColor = '#b45309';
    } else if (isIndeferido) {
      bgColor = '#7f1d1d';
      textColor = '#fca5a5';
      borderColor = '#b91c1c';
    }

    return (
      <span style={{
        display: 'inline-block',
        padding: '6px 14px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        letterSpacing: '0.03em',
        backgroundColor: bgColor,
        color: textColor,
        border: `1px solid ${borderColor}`
      }}>
        {status}
      </span>
    );
  };

  return (
    <div style={{
      padding: '40px 24px',
      maxWidth: '1280px',
      margin: '0 auto',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      
      {/* CABEÇALHO COM ESPAÇAMENTO E TIPOGRAFIA PROFISSIONAL */}
      <div style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        marginBottom: '36px',
        paddingBottom: '24px',
        borderBottom: '1px solid #334155'
      }}>
        <div style={{ paddingRight: '24px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#f8fafc',
            margin: '0 0 10px 0',
            letterSpacing: '-0.02em',
            lineHeight: '1.2'
          }}>
            Acompanhamento de Processos
          </h1>
          <p style={{
            color: '#94a3b8',
            margin: 0,
            fontSize: '15px',
            lineHeight: '1.6',
            letterSpacing: '0.01em'
          }}>
            Gerencie as solicitações e alterações empresariais registradas na JUCEPE
          </p>
        </div>

        <button 
          onClick={() => setModalAberto(true)}
          style={{
            backgroundColor: '#0284c7',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            fontSize: '14px',
            letterSpacing: '0.02em',
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
            whiteSpace: 'nowrap',
            transition: 'background-color 0.2s'
          }}
        >
          + Novo Processo
        </button>
      </div>

      {/* MENSAGEM DE CARREGAMENTO */}
      {carregando && (
        <div style={{ padding: '32px 0', color: '#94a3b8', fontSize: '15px', letterSpacing: '0.01em' }}>
          Carregando registros do banco de dados...
        </div>
      )}

      {/* MENSAGEM DE ERRO */}
      {erro && (
        <div style={{
          backgroundColor: '#451a1a',
          border: '1px solid #7f1d1d',
          color: '#fca5a5',
          padding: '20px 24px',
          borderRadius: '10px',
          marginBottom: '28px',
          lineHeight: '1.5',
          fontSize: '14px'
        }}>
          <strong>Atenção:</strong> {erro}
        </div>
      )}

      {/* TABELA DE PROCESSOS */}
      {!carregando && !erro && (
        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#e2e8f0' }}>
            <thead>
              <tr style={{
                backgroundColor: '#0f172a',
                borderBottom: '1px solid #334155',
                color: '#94a3b8',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}>
                <th style={{ padding: '16px 24px' }}>Protocolo</th>
                <th style={{ padding: '16px 24px' }}>Empresa</th>
                <th style={{ padding: '16px 24px' }}>Tipo de Ato</th>
                <th style={{ padding: '16px 24px' }}>Requerente</th>
                <th style={{ padding: '16px 24px' }}>Data</th>
                <th style={{ padding: '16px 24px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {processos.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px 24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                    Nenhum processo cadastrado até o momento.
                  </td>
                </tr>
              ) : (
                processos.map((proc) => (
                  <tr key={proc.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '18px 24px', fontWeight: '600', color: '#38bdf8', fontSize: '14px' }}>
                      {proc.numero}
                    </td>
                    <td style={{ padding: '18px 24px', fontWeight: '500', color: '#f8fafc', fontSize: '14px' }}>
                      {proc.empresa}
                    </td>
                    <td style={{ padding: '18px 24px', color: '#cbd5e1', fontSize: '14px' }}>
                      {proc.tipo}
                    </td>
                    <td style={{ padding: '18px 24px', color: '#cbd5e1', fontSize: '14px' }}>
                      {proc.requerente}
                    </td>
                    <td style={{ padding: '18px 24px', color: '#94a3b8', fontSize: '14px' }}>
                      {proc.data}
                    </td>
                    <td style={{ padding: '18px 24px' }}>
                      {renderStatusBadge(proc.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DE NOVO PROCESSO */}
      {modalAberto && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            padding: '32px',
            borderRadius: '16px',
            width: '460px',
            border: '1px solid #334155',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            color: '#f8fafc'
          }}>
            <h2 style={{
              margin: '0 0 24px 0',
              fontSize: '20px',
              fontWeight: '700',
              letterSpacing: '-0.01em'
            }}>
              Abrir Novo Processo
            </h2>

            <form onSubmit={handleCadastrar}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
                  Razão Social / Nome da Empresa:
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Tech Pernambuco Ltda"
                  value={empresa} 
                  onChange={(e) => setEmpresa(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
                  Tipo de Ato:
                </label>
                <select 
                  value={tipo} 
                  onChange={(e) => setTipo(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                >
                  <option value="Abertura de Empresa">Abertura de Empresa</option>
                  <option value="Alteração Contratual">Alteração Contratual</option>
                  <option value="Extinção / Baixa">Extinção / Baixa</option>
                  <option value="Autenticação de Livros">Autenticação de Livros</option>
                </select>
              </div>

              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
                  Nome do Requerente:
                </label>
                <input 
                  type="text" 
                  placeholder="Ex: Carlos Eduardo"
                  value={requerente} 
                  onChange={(e) => setRequerente(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setModalAberto(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#334155',
                    color: '#f8fafc',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}