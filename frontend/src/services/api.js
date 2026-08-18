const BASE_URL = 'http://localhost:3001/api';

const obterCabecalho = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const tratarResposta = async (resposta) => {
  const contentType = resposta.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const textoErro = await resposta.text();
    throw new Error(textoErro || 'Erro de comunicação com o servidor.');
  }
  const data = await resposta.json();
  if (!resposta.ok) throw new Error(data.mensagem || 'Erro na requisição');
  return data;
};

// ==================== AUTENTICAÇÃO ====================

export const loginUsuario = async (dados) => {
  const resposta = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  return tratarResposta(resposta);
};

export const cadastrarUsuario = async (dados) => {
  const resposta = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  return tratarResposta(resposta);
};

// ==================== USUÁRIOS ====================

export const listarUsuarios = async () => {
  const resposta = await fetch(`${BASE_URL}/usuarios`, {
    method: 'GET',
    headers: obterCabecalho(),
  });
  return tratarResposta(resposta);
};

export const atualizarUsuario = async (id, dados) => {
  const resposta = await fetch(`${BASE_URL}/usuarios/${id}`, {
    method: 'PUT',
    headers: obterCabecalho(),
    body: JSON.stringify(dados),
  });
  return tratarResposta(resposta);
};

export const deletarUsuario = async (id) => {
  const resposta = await fetch(`${BASE_URL}/usuarios/${id}`, {
    method: 'DELETE',
    headers: obterCabecalho(),
  });
  return tratarResposta(resposta);
};

// ==================== PROCESSOS ====================

export const listarProcessos = async () => {
  const resposta = await fetch(`${BASE_URL}/processos`, {
    method: 'GET',
    headers: obterCabecalho(),
  });
  return tratarResposta(resposta);
};

export const cadastrarProcesso = async (dados) => {
  const resposta = await fetch(`${BASE_URL}/processos`, {
    method: 'POST',
    headers: obterCabecalho(),
    body: JSON.stringify(dados),
  });
  return tratarResposta(resposta);
};

export const atualizarProcesso = async (id, dados) => {
  const resposta = await fetch(`${BASE_URL}/processos/${id}`, {
    method: 'PUT',
    headers: obterCabecalho(),
    body: JSON.stringify(dados),
  });
  return tratarResposta(resposta);
};

export const deletarProcesso = async (id) => {
  const resposta = await fetch(`${BASE_URL}/processos/${id}`, {
    method: 'DELETE',
    headers: obterCabecalho(),
  });
  return tratarResposta(resposta);
};