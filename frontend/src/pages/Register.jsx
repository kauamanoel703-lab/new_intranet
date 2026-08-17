import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    cpf: '',
    telefone: ''
  });

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  // MÁSCARA E TRAVA PARA CPF (Apenas números, máx 11 dígitos -> 000.000.000-00)
  const maskCPF = (value) => {
    return value
      .replace(/\D/g, '') // Remove tudo o que não for dígito
      .slice(0, 11) // Limita a 11 números
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  // MÁSCARA E TRAVA PARA TELEFONE (Apenas números, máx 11 dígitos -> (00) 00000-0000)
  const maskTelefone = (value) => {
    return value
      .replace(/\D/g, '') // Remove tudo o que não for dígito
      .slice(0, 11) // Limita a 11 números
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCpfChange = (e) => {
    const valorFormatado = maskCPF(e.target.value);
    handleChange('cpf', valorFormatado);
  };

  const handleTelefoneChange = (e) => {
    const valorFormatado = maskTelefone(e.target.value);
    handleChange('telefone', valorFormatado);
  };

  const handleSenhaChange = (e) => {
    const valor = e.target.value;
    if (valor.length <= 6) {
      handleChange('senha', valor);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!form.email.trim()) newErrors.email = 'Email é obrigatório';
    if (!form.senha || form.senha.length < 6) {
      newErrors.senha = 'A senha deve ter exatamente 6 dígitos';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setSuccessMsg('');
    setErrors({});

    try {
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: form.nome,
          email: form.email,
          senha: form.senha,
          cpf: form.cpf,
          telefone: form.telefone
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('O servidor não retornou JSON. Verifique se o server.js está rodando.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || 'Erro ao cadastrar usuário.');
      }

      setSuccessMsg('Usuário cadastrado com sucesso!');
      setForm({ nome: '', email: '', senha: '', cpf: '', telefone: '' });
      
      setTimeout(() => navigate('/login'), 2000);

    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        setErrors({ geral: 'Servidor offline! Ligue o backend com "node server.js" na porta 3000.' });
      } else {
        setErrors({ geral: error.message || 'Erro inesperado ao conectar com o servidor.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#090d16',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        padding: '32px',
        textAlign: 'center'
      }}>
        <h1 style={{
          color: '#ffffff',
          fontSize: '28px',
          fontWeight: '700',
          marginBottom: '8px',
          letterSpacing: '-0.02em'
        }}>
          Cadastro de Usuário
        </h1>

        <p style={{
          color: '#94a3b8',
          fontSize: '14px',
          marginBottom: '24px'
        }}>
          Preencha os dados abaixo para se cadastrar no sistema JUCEPE.
        </p>

        {/* MENSAGEM DE SUCESSO */}
        {successMsg && (
          <div style={{
            backgroundColor: '#d1fae5',
            border: '1px solid #6ee7b7',
            color: '#065f46',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            textAlign: 'left',
            marginBottom: '20px'
          }}>
            {successMsg}
          </div>
        )}

        {/* MENSAGEM DE ERRO GERAL */}
        {errors.geral && (
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
            {errors.geral}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          {/* NOME COMPLETO */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
              Nome completo *
            </label>
            <input
              type="text"
              required
              value={form.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Digite seu nome completo"
              style={{
                width: '100%',
                padding: '12px 14px',
                backgroundColor: '#eef2ff',
                border: errors.nome ? '2px solid #ef4444' : 'none',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {errors.nome && <span style={{ color: '#f87171', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.nome}</span>}
          </div>

          {/* EMAIL */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
              Email *
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="seu.email@jucepe.pe.gov.br"
              style={{
                width: '100%',
                padding: '12px 14px',
                backgroundColor: '#eef2ff',
                border: errors.email ? '2px solid #ef4444' : 'none',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {errors.email && <span style={{ color: '#f87171', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
          </div>

          {/* SENHA (MAX 6 CARACTERES) */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ color: '#ffffff', fontSize: '14px', fontWeight: '600' }}>
                Senha *
              </label>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                {form.senha.length}/6 dígitos
              </span>
            </div>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={mostrarSenha ? "text" : "password"}
                required
                maxLength={6}
                value={form.senha}
                onChange={handleSenhaChange}
                placeholder="••••••"
                style={{
                  width: '100%',
                  padding: '12px 46px 12px 14px',
                  backgroundColor: '#eef2ff',
                  border: errors.senha ? '2px solid #ef4444' : 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box',
                  letterSpacing: mostrarSenha ? 'normal' : '0.25em'
                }}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#334155',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {mostrarSenha ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            {errors.senha && <span style={{ color: '#f87171', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.senha}</span>}
          </div>

          {/* CPF COM TRAVA NUMÉRICA E MÁSCARA */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
              CPF
            </label>
            <input
              type="text"
              maxLength={14}
              value={form.cpf}
              onChange={handleCpfChange}
              placeholder="000.000.000-00"
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

          {/* TELEFONE COM TRAVA NUMÉRICA E MÁSCARA */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
              Telefone
            </label>
            <input
              type="text"
              maxLength={15}
              value={form.telefone}
              onChange={handleTelefoneChange}
              placeholder="(81) 90000-0000"
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

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#0070f3',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <p style={{ marginTop: '24px', color: '#94a3b8', fontSize: '14px' }}>
          Já tem uma conta?{' '}
          <Link to="/login" style={{ color: '#818cf8', textDecoration: 'underline' }}>
            Voltar para o Login
          </Link>
        </p>
      </div>
    </div>
  );
}