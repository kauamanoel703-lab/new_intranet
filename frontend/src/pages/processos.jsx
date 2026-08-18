import React, { useState, useEffect } from 'react';
import { listarProcessos, cadastrarProcesso, atualizarProcesso, deletarProcesso } from '../services/api';

export default function Processos() {
  const [processos, setProcessos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Estados do Formulário
  const [modalAberto, setModalAberto] = useState(false);
  const [empresa, setEmpresa] = useState('');
  const [tipo, setTipo] = useState('Abertura de Empresa');
  const [requerente, setRequerente] = useState('');

  // Limpeza completa da sessão e redirecionamento limpo
  const handleSessaoExpirada = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  // Buscar processos do Backend
  const carregarProcessos = async () => {
    setCarregando(true);
    setErro('');
    try {
      const data = await listarProcessos();
      setProcessos(data);
    } catch (err) {
      setErro(err.message || 'Falha ao carregar a lista de processos.');
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
      await cadastrarProcesso({ empresa, tipo, requerente });
      setEmpresa('');
      setRequerente('');
      setModalAberto(false);
      carregarProcessos();
    } catch (err) {
      alert(err.message || 'Erro ao cadastrar o processo. Verifique os dados informados.');
    }
  };

  // Alterar Status do Processo
  const handleAlterarStatus = async (id, novoStatus) => {
    try {
      await atualizarProcesso(id, { status: novoStatus });
      carregarProcessos();
    } catch (err) {
      alert(err.message || 'Erro ao atualizar o status do processo.');
    }
  };

  // Excluir Processo
  const handleExcluir = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este processo?')) return;
    try {
      await deletarProcesso(id);
      carregarProcessos();
    } catch (err) {
      alert(err.message || 'Erro ao excluir o processo.');
    }
  };

  // Estilização condicional dos badges de status
  const obterEstiloStatus = (status) => {
    switch(status) {
      case 'Aprovado':
      case 'Deferido': 
        return { bg: '#064e3b', text: '#6ee7b7' };
      case 'Com Exigência': 
        return { bg: '#78350f', text: '#fde68a' };
      case 'Indeferido': 
        return { bg: '#7f1d1d', text: '#fca5a5' };
      default: 
        return { bg: '#1e3a8a', text: '#93c5fd' }; // Em Análise
    }
  };

  return (
    <div style={{
      padding: '40px 24px',
      maxWidth: '1280px',
      margin: '0 auto',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      
      {/* CABEÇALHO */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '36px',
        paddingBottom: '24px',
        borderBottom: '1px solid #334155'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#f8fafc', margin: '0 0 10px 0' }}>
            Acompanhamento de Processos
          </h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '15px' }}>
            Gerencie as solicitações empresariais cadastradas no sistema.
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
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          + Novo Processo
        </button>
      </div>

      {/* CARREGAMENTO */}
      {carregando && <div style={{ color: '#94a3b8' }}>Carregando registros do banco de dados...</div>}

      {/* ERRO COM LIMPEZA COMPLETA DE SESSÃO */}
      {erro && (
        <div style={{
          backgroundColor: '#451a1a',
          border: '1px solid #7f1d1d',
          color: '#fca5a5',
          padding: '20px 24px',
          borderRadius: '10px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div>
            <strong>Atenção:</strong> {erro}
          </div>

          <button
            onClick={handleSessaoExpirada}
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Fazer Login Novamente
          </button>
        </div>
      )}

      {/* TABELA DE PROCESSOS */}
      {!carregando && !erro && (
        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#e2e8f0' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '16px 24px' }}>Protocolo</th>
                <th style={{ padding: '16px 24px' }}>Empresa</th>
                <th style={{ padding: '16px 24px' }}>Tipo de Ato</th>
                <th style={{ padding: '16px 24px' }}>Requerente</th>
                <th style={{ padding: '16px 24px' }}>Status</th>
                <th style={{ padding: '16px 24px', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {processos.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    Nenhum processo cadastrado.
                  </td>
                </tr>
              ) : (
                processos.map((proc) => {
                  const estilo = obterEstiloStatus(proc.status);
                  
                  return (
                    <tr key={proc.id} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '18px 24px', fontWeight: '600', color: '#38bdf8' }}>{proc.numero}</td>
                      <td style={{ padding: '18px 24px', fontWeight: '500', color: '#f8fafc' }}>{proc.empresa}</td>
                      <td style={{ padding: '18px 24px', color: '#cbd5e1' }}>{proc.tipo}</td>
                      <td style={{ padding: '18px 24px', color: '#cbd5e1' }}>{proc.requerente}</td>
                      <td style={{ padding: '18px 24px' }}>
                        <select
                          value={proc.status}
                          onChange={(e) => handleAlterarStatus(proc.id, e.target.value)}
                          style={{
                            backgroundColor: estilo.bg,
                            color: estilo.text,
                            border: '1px solid #334155',
                            borderRadius: '20px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          <option value="Em Análise">Em Análise</option>
                          <option value="Aprovado">Aprovado</option>
                          <option value="Com Exigência">Com Exigência</option>
                          <option value="Indeferido">Indeferido</option>
                        </select>
                      </td>
                      <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleExcluir(proc.id)}
                          style={{ backgroundColor: 'transparent', color: '#f87171', border: '1px solid #7f1d1d', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  );
                })
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
          justifyContent: 'center',
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
            <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '700' }}>
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
                  required
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