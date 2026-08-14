import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importe o useNavigate
import { useAuth } from '../contexts/AuthContext'; // 2. Importe o useAuth
import Input from '../components/Input';
import Button from '../components/Button';
import { loginUsuario } from '../services/api';

const Login = () => {
  const [form, setForm] = useState({ email: '', senha: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // Hook do React Router para navegação
  const { login } = useAuth();    // Função do nosso contexto atualizado

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = 'Email é obrigatório';
    if (!form.senha.trim()) newErrors.senha = 'Senha é obrigatória';
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
    setErrors({});

    try {
      const response = await loginUsuario(form);

      // Salva no contexto e no localStorage de uma só vez
      login(response.usuario, response.token);

      // Redireciona via SPA (sem dar F5 na tela)
      navigate('/dashboard');

    } catch (error) {
      setErrors({ geral: error.message || 'Erro ao fazer login' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '80px auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '5px' }}>Login — JUCEPE</h1>
      <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
        Entre com suas credenciais para acessar o sistema.
      </p>

      {errors.geral && (
        <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '16px' }}>
          {errors.geral}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="seu@email.com"
          error={errors.email}
        />
        <Input
          label="Senha"
          name="senha"
          type="password"
          value={form.senha}
          onChange={handleChange}
          placeholder="Sua senha"
          error={errors.senha}
        />
        <Button type="submit" variant="primary" loading={loading} disabled={loading}>
          Entrar
        </Button>
      </form>

      <p style={{ marginTop: '16px', textAlign: 'center' }}>
        Não tem conta? <a href="/register">Cadastre-se</a>
      </p>
    </div>
  );
};

export default Login;