import React, { useState } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import { cadastrarUsuario } from '../services/api';

const Register = () => {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    cpf: '',
    telefone: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!form.email.trim()) newErrors.email = 'Email é obrigatório';
    if (!form.senha || form.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
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
      const response = await cadastrarUsuario({
        nome: form.nome,
        email: form.email,
        senha: form.senha
      });

      setSuccessMsg(`Usuário cadastrado com sucesso! ID: ${response.id}`);
      setForm({ nome: '', email: '', senha: '', cpf: '', telefone: '' });
    } catch (error) {
      setErrors({ geral: error.message || 'Erro inesperado ao conectar com o servidor.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h1>Cadastro de Usuário</h1>
      {successMsg && (
        <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '10px', borderRadius: '4px', marginBottom: '16px' }}>
          {successMsg}
        </div>
      )}
      {errors.geral && (
        <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '16px' }}>
          {errors.geral}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <Input label="Nome completo" name="nome" value={form.nome} onChange={handleChange} placeholder="Digite seu nome" required error={errors.nome} />
        <Input label="Email" name="email" value={form.email} onChange={handleChange} type="email" placeholder="seu@email.com" required error={errors.email} />
        <Input label="Senha" name="senha" value={form.senha} onChange={handleChange} type="password" placeholder="Mínimo 6 caracteres" required error={errors.senha} />
        <Input label="CPF" name="cpf" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" mask="cpf" />
        <Input label="Telefone" name="telefone" value={form.telefone} onChange={handleChange} placeholder="(00) 00000-0000" mask="telefone" />
        <Button type="submit" variant="primary" loading={loading} disabled={loading}>
          Cadastrar
        </Button>
      </form>
    </div>
  );
};

export default Register;