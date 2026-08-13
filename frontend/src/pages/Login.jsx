import React, { useState } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import { loginUsuario } from '../services/api';

const Login = () => {
  const [form, setForm] = useState({ email: '', senha: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = 'Email é obrigatório';
    if (!form.senha) newErrors.senha = 'Senha é obrigatória';
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
    try {
      const response = await loginUsuario(form);

      // Salva o token e dados do usuário no localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('usuario', JSON.stringify(response.usuario));

      // Redireciona para o dashboard (vamos criar depois)
      window.location.href = '/dashboard';

    } catch (error) {
      setErrors({ geral: error.message || 'Erro ao fazer login' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '20px' }}>
      <h1>Login — JUCEPE</h1>

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