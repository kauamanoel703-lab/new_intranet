import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';

// Componente que protege rotas: redireciona para /login se não autenticado
const PrivateRoute = ({ children }) => {
  const { isAutenticado } = useAuth();
  return isAutenticado ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rota protegida — só entra autenticado */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <div><h1>Dashboard (em construção)</h1></div>
              </PrivateRoute>
            }
          />

          {/* Redireciona a raiz para /login */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;