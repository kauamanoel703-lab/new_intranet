import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Processos from './pages/Processos'; // 👈 Importado

// Componente de Rota Protegida com depuração
const PrivateRoute = ({ children }) => {
  const { isAutenticado, usuario } = useAuth();

  console.log("🔍 [PrivateRoute] Verificando acesso:", { isAutenticado, usuario });

  if (!isAutenticado) {
    console.warn("⚠️ [PrivateRoute] Acesso negado! Redirecionando para /login...");
    return <Navigate to="/login" replace />;
  }

  console.log("✅ [PrivateRoute] Acesso liberado!");
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rotas Protegidas */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/usuarios" 
            element={
              <PrivateRoute>
                <Usuarios />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/processos" 
            element={
              <PrivateRoute>
                <Processos />
              </PrivateRoute>
            } 
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* Rota coringa para capturar qualquer caminho inexistente e evitar tela branca */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;