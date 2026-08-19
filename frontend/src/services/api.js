// Compatível com Vite (import.meta.env) e fallback local
const BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3001/api';
const TIMEOUT_PADRAO = 10000; // 10 segundos

const obterCabecalhos = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

/**
 * Wrapper de Fetch com suporte a Timeout e tratamento unificado de erros
 */
const executarRequisicao = async (endpoint, opcoes = {}) => {
  const controller = new AbortController();
  const idTimeout = setTimeout(() => controller.abort(), TIMEOUT_PADRAO);

  try {
    const resposta = await fetch(`${BASE_URL}${endpoint}`, {
      ...opcoes,
      headers: { ...obterCabecalhos(), ...opcoes.headers },
      signal: controller.signal
    });

    clearTimeout(idTimeout);

    const contentType = resposta.headers.get('content-type');
    let dados = {};

    if (contentType && contentType.includes('application/json')) {
      dados = await resposta.json();
    } else {
      const texto = await resposta.text();
      dados = { mensagem: texto };
    }

    if (!resposta.ok) {
      if (resposta.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?sessao=expirada';
        }
      }
      throw new Error(dados.mensagem || `Erro no servidor (Status: ${resposta.status})`);
    }

    return dados;

  } catch (erro) {
    clearTimeout(idTimeout);

    if (erro.name === 'AbortError') {
      throw new Error('A conexão com o servidor expirou. Tente novamente.');
    }
    if (erro.message === 'Failed to fetch' || erro.name === 'TypeError') {
      throw new Error('Impossível conectar ao servidor da JUCEPE. Verifique sua conexão ou se o backend está online.');
    }
    throw erro;
  }
};

// ==================== ENDPOINTS DE AUTENTICAÇÃO ====================
export const loginUsuario = (credenciais) => 
  executarRequisicao('/login', { method: 'POST', body: JSON.stringify(credenciais) });

export const cadastrarUsuario = (dados) => 
  executarRequisicao('/register', { method: 'POST', body: JSON.stringify(dados) });

// ==================== ENDPOINTS DE USUÁRIOS ====================
export const listarUsuarios = () => 
  executarRequisicao('/usuarios', { method: 'GET' });

export const atualizarUsuario = (id, dados) => 
  executarRequisicao(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(dados) });

export const deletarUsuario = (id) => 
  executarRequisicao(`/usuarios/${id}`, { method: 'DELETE' });

// ==================== ENDPOINTS DE PROCESSOS (JUCEPE) ====================
export const listarProcessos = () => 
  executarRequisicao('/processos', { method: 'GET' });

export const cadastrarProcesso = (dados) => 
  executarRequisicao('/processos', { method: 'POST', body: JSON.stringify(dados) });

export const atualizarProcesso = (id, dados) => 
  executarRequisicao(`/processos/${id}`, { method: 'PUT', body: JSON.stringify(dados) });

export const deletarProcesso = (id) => 
  executarRequisicao(`/processos/${id}`, { method: 'DELETE' });