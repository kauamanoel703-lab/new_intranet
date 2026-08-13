const API_URL = 'http://localhost:3001/api';

// Pega o token salvo no localStorage (se existir)
const getToken = () => localStorage.getItem('token');

// ─── CADASTRO ────────────────────────────────────────────────────────────────
export const cadastrarUsuario = async (dados) => {
  const response = await fetch(`${API_URL}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.erro || 'Erro ao cadastrar');
  }
  return response.json();
};

// ─── LOGIN ───────────────────────────────────────────────────────────────────
export const loginUsuario = async (dados) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.erro || 'Erro ao fazer login');
  }
  return response.json();
};

// ─── REQUISIÇÃO AUTENTICADA (com token no header) ─────────────────────────────
export const fetchAutenticado = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`, // <-- o crachá JWT
      ...options.headers
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.erro || 'Erro na requisição');
  }
  return response.json();
};

// ─── LOGOUT ──────────────────────────────────────────────────────────────────
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = '/login';
};