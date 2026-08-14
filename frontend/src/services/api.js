// src/services/api.js
const BASE_URL = 'http://localhost:3001/api/usuarios';

// Helper privado para tratar respostas HTTP
const tratarResposta = async (resposta) => {
  const contentType = resposta.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const textoErro = await resposta.text();
    console.error('Erro (não JSON):', textoErro);
    throw new Error('Servidor fora do ar ou rota inexistente.');
  }

  const data = await resposta.json();
  if (!resposta.ok) throw new Error(data.erro || 'Erro na requisição');
  return data;
};

// 1. Login
export const loginUsuario = async (dados) => {
  const resposta = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  return tratarResposta(resposta);
};

// 2. Cadastro
export const cadastrarUsuario = async (dados) => {
  const resposta = await fetch(`${BASE_URL}/cadastrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  return tratarResposta(resposta);
};

// 3. Listar Usuários (Que faltava para Usuarios.jsx)
export const listarUsuarios = async () => {
  const resposta = await fetch(`${BASE_URL}/listar`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return tratarResposta(resposta);
};

// 4. Atualizar Usuário (Que faltava para Usuarios.jsx)
export const atualizarUsuario = async (id, dados) => {
  const resposta = await fetch(`${BASE_URL}/atualizar/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  return tratarResposta(resposta);
};

// 5. Deletar Usuário (Que faltava para Usuarios.jsx)
export const deletarUsuario = async (id) => {
  const resposta = await fetch(`${BASE_URL}/deletar/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  return tratarResposta(resposta);
};