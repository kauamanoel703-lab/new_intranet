import React, { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Trava estrita para garantir NO MÁXIMO 6 caracteres
  const handleSenhaChange = (e) => {
    const valor = e.target.value;
    if (valor.length <= 6) {
      setSenha(valor);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('A rota do servidor não retornou JSON. Verifique se o server.js está rodando e com a rota /login.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || 'E-mail ou senha inválidos.');
      }

      localStorage.setItem('token', data.token);
      window.location.href = '/processos';

    } catch (err) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setErro('Não foi possível conectar ao servidor. Verifique se o backend está ligado na porta 3000.');
      } else if (err.message.includes('Unexpected token') || err.message.includes('JSON')) {
        setErro('Erro na resposta do servidor. Certifique-se de que a rota /login existe no server.js.');
      } else {
        setErro(err.message || 'Ocorreu um erro ao realizar o login.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#090d16',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '32px',
        textAlign: 'center'
      }}>
        {/* TÍTULO */}
        <h1 style={{
          color: '#ffffff',
          fontSize: '28px',
          fontWeight: '700',
          marginBottom: '8px',
          letterSpacing: '-0.02em'
        }}>
          Login — JUCEPE
        </h1>
        
        <p style={{
          color: '#94a3b8',
          fontSize: '14px',
          marginBottom: '28px',
          lineHeight: '1.5'
        }}>
          Entre com suas credenciais para acessar o sistema.
        </p>

        {/* CAIXA DE ERRO PT-BR */}
        {erro && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            textAlign: 'left',
            marginBottom: '20px',
            lineHeight: '1.4'
          }}>
            {erro}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
          {/* CAMPO DE E-MAIL */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              Email
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@jucepe.pe.gov.br"
              style={{
                width: '100%',
                padding: '12px 14px',
                backgroundColor: '#eef2ff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* CAMPO DE SENHA COM BLOQUEIO DE 6 DÍGITOS E VISOR (OLHINHO) */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ color: '#ffffff', fontSize: '14px', fontWeight: '600' }}>
                Senha
              </label>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                {senha.length}/6 dígitos
              </span>
            </div>
            
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={mostrarSenha ? "text" : "password"}
                required
                maxLength={6}
                value={senha}
                onChange={handleSenhaChange}
                placeholder="••••••"
                style={{
                  width: '100%',
                  padding: '12px 46px 12px 14px',
                  backgroundColor: '#eef2ff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box',
                  letterSpacing: mostrarSenha ? 'normal' : '0.25em'
                }}
              />

              {/* BOTÃO DO OLHINHO / VISOR DE SENHA */}
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                title={mostrarSenha ? "Ocultar senha" : "Exibir senha"}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#334155',
                  zIndex: 2
                }}
              >
                {mostrarSenha ? (
                  /* Ícone Olho Fechado (Com Risco) */
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  /* Ícone Olho Aberto */
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={carregando}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#0070f3',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: carregando ? 'wait' : 'pointer',
              opacity: carregando ? 0.7 : 1,
              transition: 'background-color 0.2s'
            }}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{
          marginTop: '28px',
          color: '#94a3b8',
          fontSize: '14px'
        }}>
          Não tem conta? <a href="/cadastro" style={{ color: '#818cf8', textDecoration: 'underline' }}>Cadastre-se</a>
        </p>
      </div>
    </div>
  );
}