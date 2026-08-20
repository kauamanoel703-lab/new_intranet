import { useState, useEffect, useCallback } from 'react';
import { listarProcessos, cadastrarProcesso, deletarProcesso } from '../services/api';

// Máscaras de formatação
const mascararCPF = (valor) => {
  return valor
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const mascararCNPJ = (valor) => {
  return valor
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};

export default function Processos() {
  const [processos, setProcessos] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [carregandoLista, setCarregandoLista] = useState(false);
  const [erro, setErro] = useState('');

  const [form, setForm] = useState({
    razaoSocial: '',
    tipoAto: 'Abertura de Empresa',
    nomeRequerente: '',
    tipoDocumento: 'CPF',
    documento: '',
    descricao: ''
  });

  const buscarProcessos = useCallback(async () => {
    setCarregandoLista(true);
    try {
      const dados = await listarProcessos();
      setProcessos(Array.isArray(dados) ? dados : dados?.processos || []);
    } catch (err) {
      setErro(err?.message || 'Erro ao carregar lista de processos.');
    } finally {
      setCarregandoLista(false);
    }
  }, []);

  useEffect(() => {
    buscarProcessos();
  }, [buscarProcessos]);

  const handleTipoDocumentoChange = (novoTipo) => {
    setForm(prev => ({
      ...prev,
      tipoDocumento: novoTipo,
      documento: ''
    }));
    if (erro) setErro('');
  };

  const handleDocumentoChange = (valor) => {
    const valorFormatado = form.tipoDocumento === 'CPF'
      ? mascararCPF(valor)
      : mascararCNPJ(valor);

    setForm(prev => ({ ...prev, documento: valorFormatado }));
    if (erro) setErro('');
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setErro('');

    if (!form.razaoSocial.trim() || !form.nomeRequerente.trim()) {
      setErro('Preencha os campos obrigatórios (Razão Social e Requerente).');
      return;
    }

    const docLimpo = form.documento.replace(/\D/g, '');

    setCarregando(true);

    try {
      // Objeto com as chaves exatas esperadas pelo backend
      const payload = {
        razao_social: form.razaoSocial.trim(),
        razaoSocial: form.razaoSocial.trim(),
        empresa: form.razaoSocial.trim(),

        tipo_ato: form.tipoAto,
        tipoAto: form.tipoAto,

        nome_requerente: form.nomeRequerente.trim(),
        nomeRequerente: form.nomeRequerente.trim(),
        requerente: form.nomeRequerente.trim(),

        tipo_documento: form.tipoDocumento,
        tipoDocumento: form.tipoDocumento,

        cpf_cnpj: docLimpo || form.documento,
        documento: docLimpo || form.documento,
        cpf: form.tipoDocumento === 'CPF' ? (docLimpo || form.documento) : '',
        cnpj: form.tipoDocumento === 'CNPJ' ? (docLimpo || form.documento) : '',

        descricao: form.descricao.trim() || 'Solicitação via Portal JUCEPE',
        observacao: form.descricao.trim() || 'Solicitação via Portal JUCEPE',
        status: 'Em Análise'
      };

      await cadastrarProcesso(payload);

      setForm({
        razaoSocial: '',
        tipoAto: 'Abertura de Empresa',
        nomeRequerente: '',
        tipoDocumento: 'CPF',
        documento: '',
        descricao: ''
      });

      setModalAberto(false);
      await buscarProcessos();

    } catch (err) {
      console.error('Erro na requisição:', err);

      // Tentativa de ler mensagem do backend caso retorne JSON
      let msg = 'Campos obrigatórios do processo ausentes ou inválidos.';
      if (err?.response?.data?.mensagem) msg = err.response.data.mensagem;
      else if (err?.response?.data?.message) msg = err.response.data.message;
      else if (err?.response?.data?.erro) msg = err.response.data.erro;

      setErro(msg);
    } finally {
      setCarregando(false);
    }
  };

  const handleExcluir = async (id) => {
    if (!window.confirm('Deseja realmente excluir este processo?')) return;
    try {
      await deletarProcesso(id);
      await buscarProcessos();
    } catch (err) {
      setErro(err?.message || 'Erro ao excluir processo.');
    }
  };

  return (
    <div style={{ padding: '32px', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Acompanhamento de Processos</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>Gerencie as solicitações e trâmites mercantis da JUCEPE.</p>
        </div>
        <button
          type="button"
          onClick={() => { setErro(''); setModalAberto(true); }}
          style={{ backgroundColor: '#0070f3', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
        >
          + Abrir Novo Processo
        </button>
      </div>

      {erro && !modalAberto && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px' }}>
          {erro}
        </div>
      )}

      {/* Tabela de Processos */}
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#1e293b', color: '#94a3b8' }}>
              <th style={{ padding: '14px 16px' }}>Empresa / Razão Social</th>
              <th style={{ padding: '14px 16px' }}>Tipo de Ato</th>
              <th style={{ padding: '14px 16px' }}>Requerente</th>
              <th style={{ padding: '14px 16px' }}>Status</th>
              <th style={{ padding: '14px 16px', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregandoLista ? (
              <tr>
                <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>Carregando...</td>
              </tr>
            ) : processos.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Nenhum processo cadastrado.</td>
              </tr>
            ) : (
              processos.map((proc) => {
                const id = proc.id || proc._id;
                return (
                  <tr key={id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '500' }}>{proc.razao_social || proc.razaoSocial || proc.empresa || '-'}</td>
                    <td style={{ padding: '14px 16px' }}>{proc.tipo_ato || proc.tipoAto || proc.tipo || '-'}</td>
                    <td style={{ padding: '14px 16px' }}>{proc.nome_requerente || proc.nomeRequerente || proc.requerente || '-'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ backgroundColor: '#1e293b', color: '#38bdf8', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                        {proc.status || 'Em Análise'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleExcluir(id)}
                        style={{ backgroundColor: 'transparent', color: '#f87171', border: 'none', cursor: 'pointer', fontSize: '13px' }}
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

      {/* Modal - Abrir Novo Processo */}
      {modalAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: '#1e293b', width: '100%', maxWidth: '520px', borderRadius: '12px', padding: '28px', boxSizing: 'border-box' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#ffffff', marginTop: 0 }}>
              Abrir Novo Processo
            </h2>

            {erro && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '12px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
                {erro}
              </div>
            )}

            <form onSubmit={handleSalvar}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>Razão Social / Nome da Empresa *</label>
                <input
                  type="text"
                  required
                  value={form.razaoSocial}
                  onChange={(e) => setForm({ ...form, razaoSocial: e.target.value })}
                  placeholder="Ex: Auto Posto Silva LTDA"
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>Tipo de Ato *</label>
                <select
                  value={form.tipoAto}
                  onChange={(e) => setForm({ ...form, tipoAto: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
                >
                  <option value="Abertura de Empresa">Abertura de Empresa</option>
                  <option value="Alteração Contratual">Alteração Contratual</option>
                  <option value="Extinção / Baixa">Extinção / Baixa</option>
                  <option value="Certidão Simplificada">Certidão Simplificada</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>Nome do Requerente *</label>
                <input
                  type="text"
                  required
                  value={form.nomeRequerente}
                  onChange={(e) => setForm({ ...form, nomeRequerente: e.target.value })}
                  placeholder="Ex: João da Silva"
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>Tipo Doc.</label>
                  <select
                    value={form.tipoDocumento}
                    onChange={(e) => handleTipoDocumentoChange(e.target.value)}
                    style={{ width: '100%', padding: '10px 10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
                  >
                    <option value="CPF">CPF (PF)</option>
                    <option value="CNPJ">CNPJ (PJ)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>Número do {form.tipoDocumento}</label>
                  <input
                    type="text"
                    value={form.documento}
                    onChange={(e) => handleDocumentoChange(e.target.value)}
                    placeholder={form.tipoDocumento === 'CPF' ? '000.000.000-00' : '00.000.000/0001-00'}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>Observações / Descrição do Processo</label>
                <textarea
                  rows={2}
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Detalhes adicionais do processo..."
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  disabled={carregando}
                  style={{ padding: '10px 18px', backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={carregando}
                  style={{ padding: '10px 18px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', cursor: carregando ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '600' }}
                >
                  {carregando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}