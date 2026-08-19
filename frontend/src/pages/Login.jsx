import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loginUsuario } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [sessaoExpirada, setSessaoExpirada] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('sessao') === 'expirada') {
      setSessaoExpirada(true);
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setSessaoExpirada(false);

    if (!email || !senha) {
      setErro('Por favor, preencha todos os campos.');
      return;
    }

    setCarregando(true);

    try {
      const data = await loginUsuario({ email, senha });

      // Ordem correta mantida: login(usuario, token)
      if (typeof login === 'function') {
        login(data.usuario, data.token);
      }

      navigate('/dashboard');
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#090d16', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '32px', textAlign: 'center' }}>
        
        {/* Identidade JUCEPE */}
        <h1 style={{ color: '#ffffff', fontSize: '26px', fontWeight: '700', marginBottom: '8px', letterSpacing: '-0.5px' }}>
          Portal JUCEPE
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '28px' }}>
          Sistema de Gestão e Processos Mercantis
        </p>

        {sessaoExpirada && (
          <div role="alert" style={{ backgroundColor: '#fffbe8', border: '1px solid #fde047', color: '#854d0e', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', textAlign: 'left', marginBottom: '20px' }}>
            <strong>⚠️ Sessão Expirada:</strong> Por favor, faça login novamente para continuar.
          </div>
        )}

        {erro && (
          <div role="alert" style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', textAlign: 'left', marginBottom: '20px' }}>
            {erro}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ textAlign: 'left' }} noValidate>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="email" style={{ display: 'block', color: '#f8fafc', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              E-mail corporativo ou institucional
            </label>
            <input 
              id="email"
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.nome@jucepe.pe.gov.br"
              style={{ width: '100%', padding: '12px 14px', backgroundColor: '#eef2ff', border: 'none', borderRadius: '6px', fontSize: '14px', color: '#0f172a', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="senha" style={{ color: '#f8fafc', fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
              Senha de Acesso (6 dígitos)
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                id="senha"
                type={mostrarSenha ? "text" : "password"}
                required
                maxLength={6}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••"
                style={{ width: '100%', padding: '12px 46px 12px 14px', backgroundColor: '#eef2ff', border: 'none', borderRadius: '6px', fontSize: '14px', color: '#0f172a', boxSizing: 'border-box', letterSpacing: mostrarSenha ? 'normal' : '0.25em' }}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                aria-label={mostrarSenha ? "Ocultar senha" : "Exibir senha"}
                style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
              >
                {mostrarSenha ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={carregando}
            style={{ width: '100%', padding: '12px', backgroundColor: '#0070f3', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: carregando ? 'wait' : 'pointer', transition: 'background-color 0.2s' }}
          >
            {carregando ? 'Autenticando...' : 'Acessar Sistema'}
          </button>
        </form>

        <p style={{ marginTop: '28px', color: '#94a3b8', fontSize: '14px' }}>
          Ainda não possui credenciais? <Link to="/register" style={{ color: '#818cf8', fontWeight: '500', textDecoration: 'underline' }}>Solicitar Cadastro</Link>
        </p>
      </div>
    </div>
  );
}