import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cadastrarUsuario } from '../services/api';
import { validarCPF, mascararCPF, mascararTelefone } from '../utils/validators';

export default function Register() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    cpf: '',
    telefone: ''
  });

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erros, setErros] = useState({});
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState('');

  const navigate = useNavigate();

  const handleChange = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
    if (erros[campo]) setErros(prev => ({ ...prev, [campo]: '' }));
  };

  const validarFormulario = () => {
    const novosErros = {};

    if (!form.nome.trim()) novosErros.nome = 'Informe seu nome completo.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      novosErros.email = 'Insira um e-mail válido.';
    }
    if (!form.senha || form.senha.length !== 6) {
      novosErros.senha = 'A senha deve conter exatamente 6 caracteres numéricos ou alfanuméricos.';
    }
    if (form.cpf && !validarCPF(form.cpf)) {
      novosErros.cpf = 'CPF inválido. Verifique os dígitos informados.';
    }

    return novosErros;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errosValidacao = validarFormulario();

    if (Object.keys(errosValidacao).length > 0) {
      setErros(errosValidacao);
      return;
    }

    setLoading(true);
    setSucesso('');
    setErros({});

    try {
      // Limpa as máscaras antes de enviar para o banco de dados
      const dadosLimpos = {
        ...form,
        cpf: form.cpf.replace(/\D/g, ''),
        telefone: form.telefone.replace(/\D/g, '')
      };

      await cadastrarUsuario(dadosLimpos);
      setSucesso('Cadastro realizado com sucesso! Redirecionando...');
      setForm({ nome: '', email: '', senha: '', cpf: '', telefone: '' });

      setTimeout(() => navigate('/login'), 2000);

    } catch (error) {
      setErros({ geral: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#090d16', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '440px', padding: '32px', textAlign: 'center' }}>
        
        <h1 style={{ color: '#ffffff', fontSize: '26px', fontWeight: '700', marginBottom: '8px' }}>Cadastro de Usuário</h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>Crie seu acesso para interagir com o sistema JUCEPE.</p>

        {sucesso && (
          <div role="status" style={{ backgroundColor: '#d1fae5', border: '1px solid #6ee7b7', color: '#065f46', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', textAlign: 'left', marginBottom: '20px' }}>
            {sucesso}
          </div>
        )}

        {erros.geral && (
          <div role="alert" style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', textAlign: 'left', marginBottom: '20px' }}>
            {erros.geral}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }} noValidate>
          
          {/* Nome */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="nome" style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Nome completo *</label>
            <input 
              id="nome"
              type="text" 
              required
              value={form.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Digite seu nome completo"
              style={{ width: '100%', padding: '12px 14px', backgroundColor: '#eef2ff', border: erros.nome ? '2px solid #ef4444' : 'none', borderRadius: '6px', fontSize: '14px', color: '#0f172a', boxSizing: 'border-box' }}
            />
            {erros.nome && <span style={{ color: '#f87171', fontSize: '12px', marginTop: '4px', display: 'block' }}>{erros.nome}</span>}
          </div>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="reg-email" style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>E-mail *</label>
            <input 
              id="reg-email"
              type="email" 
              required
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="seu.email@jucepe.pe.gov.br"
              style={{ width: '100%', padding: '12px 14px', backgroundColor: '#eef2ff', border: erros.email ? '2px solid #ef4444' : 'none', borderRadius: '6px', fontSize: '14px', color: '#0f172a', boxSizing: 'border-box' }}
            />
            {erros.email && <span style={{ color: '#f87171', fontSize: '12px', marginTop: '4px', display: 'block' }}>{erros.email}</span>}
          </div>

          {/* Senha */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label htmlFor="reg-senha" style={{ color: '#ffffff', fontSize: '14px', fontWeight: '600' }}>Senha (6 dígitos) *</label>
              <span style={{ fontSize: '12px', color: form.senha.length === 6 ? '#4ade80' : '#94a3b8' }}>{form.senha.length}/6</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                id="reg-senha"
                type={mostrarSenha ? "text" : "password"}
                required
                maxLength={6}
                value={form.senha}
                onChange={(e) => handleChange('senha', e.target.value.slice(0, 6))}
                placeholder="••••••"
                style={{ width: '100%', padding: '12px 46px 12px 14px', backgroundColor: '#eef2ff', border: erros.senha ? '2px solid #ef4444' : 'none', borderRadius: '6px', fontSize: '14px', color: '#0f172a', boxSizing: 'border-box', letterSpacing: mostrarSenha ? 'normal' : '0.25em' }}
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
            {erros.senha && <span style={{ color: '#f87171', fontSize: '12px', marginTop: '4px', display: 'block' }}>{erros.senha}</span>}
          </div>

          {/* CPF */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="cpf" style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>CPF</label>
            <input 
              id="cpf"
              type="text" 
              value={form.cpf}
              onChange={(e) => handleChange('cpf', mascararCPF(e.target.value))}
              placeholder="000.000.000-00"
              style={{ width: '100%', padding: '12px 14px', backgroundColor: '#eef2ff', border: erros.cpf ? '2px solid #ef4444' : 'none', borderRadius: '6px', fontSize: '14px', color: '#0f172a', boxSizing: 'border-box' }}
            />
            {erros.cpf && <span style={{ color: '#f87171', fontSize: '12px', marginTop: '4px', display: 'block' }}>{erros.cpf}</span>}
          </div>

          {/* Telefone */}
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="telefone" style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Telefone / Celular</label>
            <input 
              id="telefone"
              type="text" 
              value={form.telefone}
              onChange={(e) => handleChange('telefone', mascararTelefone(e.target.value))}
              placeholder="(81) 90000-0000"
              style={{ width: '100%', padding: '12px 14px', backgroundColor: '#eef2ff', border: 'none', borderRadius: '6px', fontSize: '14px', color: '#0f172a', boxSizing: 'border-box' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{ width: '100%', padding: '12px', backgroundColor: '#0070f3', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: loading ? 'wait' : 'pointer' }}
          >
            {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
          </button>
        </form>

        <p style={{ marginTop: '24px', color: '#94a3b8', fontSize: '14px' }}>
          Já possui conta? <Link to="/login" style={{ color: '#818cf8', fontWeight: '500', textDecoration: 'underline' }}>Fazer Login</Link>
        </p>
      </div>
    </div>
  );
}