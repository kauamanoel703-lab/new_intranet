const API_URL = 'http://localhost:3001/api';

export const cadastrarUsuario = async (dados) => {
  const response = await fetch(`${API_URL}/usuarios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dados)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.erro || 'Erro ao cadastrar');
  }

  return response.json();
};