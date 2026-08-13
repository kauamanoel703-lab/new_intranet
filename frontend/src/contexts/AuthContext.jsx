import React, { createContext, useContext, useState } from 'react';

// O contexto é como uma "variável global" do React
// que qualquer componente pode ler sem precisar passar por props
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(() => {
    // Tenta recuperar o usuário salvo no localStorage ao carregar a página
    const salvo = localStorage.getItem('usuario');
    return salvo ? JSON.parse(salvo) : null;
  });

  const isAutenticado = !!usuario; // true se usuario não for null

  return (
    <AuthContext.Provider value={{ usuario, setUsuario, isAutenticado }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto facilmente em qualquer componente
export const useAuth = () => useContext(AuthContext);