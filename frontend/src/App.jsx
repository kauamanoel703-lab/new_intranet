import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Processos from './pages/processos';

// Rota Protegida (só entra se autenticado)
const PrivateRoute = ({ children }) => {
  const { isAutenticado, carregando } = useAuth();

  if (carregando) {
    return <div style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>Carregando sessão...</div>;
  }

  if (!isAutenticado) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Rota Pública (se já estiver logado, manda direto pro Dashboard/Processos)
const PublicRoute = ({ children }) => {
  const { isAutenticado, carregando } = useAuth();

  if (carregando) {
    return <div style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>Carregando sessão...</div>;
  }

  if (isAutenticado) {
    return <Navigate to="/processos" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          
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

          {/* Redirecionamentos padrão */}
          <Route path="/" element={<Navigate to="/processos" replace />} />
          <Route path="*" element={<Navigate to="/processos" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;