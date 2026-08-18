import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { listarUsuarios, atualizarUsuario, deletarUsuario } from '../services/api';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [form, setForm] = useState({ nome: '', email: '', role: 'usuario' });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const data = await listarUsuarios();
      setUsuarios(data);
    } catch (error) {
      setErro('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarUsuarios(); }, []);

  const usuariosFiltrados = usuarios.filter(u =>
    u.nome.toLowerCase().includes(busca.toLowerCase()) ||
    u.email.toLowerCase().includes(busca.toLowerCase())
  );

  const abrirModal = (usuario) => {
    setUsuarioEditando(usuario);
    setForm({ nome: usuario.nome, email: usuario.email, role: usuario.role });
    setModalAberto(true);
    setErro('');
  };

  const fecharModal = () => {
    setModalAberto(false);
    setUsuarioEditando(null);
    setErro('');
  };

  const handleSalvar = async () => {
    try {
      await atualizarUsuario(usuarioEditando.id, form);
      setSucesso('Usuário atualizado com sucesso!');
      fecharModal();
      carregarUsuarios();
      setTimeout(() => setSucesso(''), 3000);
    } catch (error) {
      setErro(error.message || 'Erro ao atualizar usuário');
    }
  };

  const handleDeletar = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este usuário?')) return;
    try {
      await deletarUsuario(id);
      setSucesso('Usuário removido com sucesso!');
      carregarUsuarios();
      setTimeout(() => setSucesso(''), 3000);
    } catch (error) {
      setErro(error.message || 'Erro ao remover usuário');
    }
  };

  const getRoleBadge = (role) => {
    const config = {
      admin: { label: 'Admin', bg: '#1a1535', cor: '#a78bfa', borda: '#2d1f6e' },
      gestor: { label: 'Gestor', bg: '#0a1f14', cor: '#34d399', borda: '#064e3b' },
      usuario: { label: 'Usuário', bg: '#1c2035', cor: '#94a3b8', borda: '#2d3748' },
    };
    const c = config[role] || config.usuario;
    return (
      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: c.bg, color: c.cor, border: `1px solid ${c.borda}` }}>
        {c.label}
      </span>
    );
  };

  const getIniciais = (nome) => nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  const panel = { background: '#0f1220', border: '1px solid #1c2035', borderRadius: '11px', padding: '20px' };

  return (
    <MainLayout paginaAtiva="usuarios">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* HEADER DA PÁGINA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>Gerenciamento de Usuários</h1>
            <p style={{ fontSize: '12px', color: '#3d4566', margin: '4px 0 0' }}>{usuarios.length} usuário(s) cadastrado(s)</p>
          </div>
        </div>

        {sucesso && (
          <div style={{ background: '#0a1f14', border: '1px solid #064e3b', borderRadius: '8px', padding: '10px 14px', color: '#34d399', fontSize: '13px' }}>
            ✅ {sucesso}
          </div>
        )}

        {erro && (
          <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: '8px', padding: '10px 14px', color: '#f87171', fontSize: '13px' }}>
            ⚠️ {erro}
          </div>
        )}

        <div style={panel}>
          {/* BUSCA */}
          <div style={{ marginBottom: '16px' }}>
            <input
              placeholder="🔍 Buscar por nome ou email..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              style={{ background: '#0c0f18', border: '1px solid #1c2035', borderRadius: '8px', padding: '9px 14px', color: '#e2e8f0', fontSize: '13px', width: '300px', outline: 'none' }}
            />
          </div>

          {/* TABELA */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#3d4566' }}>Carregando...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Usuário', 'Email', 'Função', 'Cadastrado em', 'Ações'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '10px', color: '#3d4566', textTransform: 'uppercase', letterSpacing: '.6px', borderBottom: '1px solid #1c2035' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #1c2035' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#0c0f18'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#6d28d9,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>
                          {getIniciais(u.nome)}
                        </div>
                        <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>{u.nome}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#5a6380' }}>{u.email}</td>
                    <td style={{ padding: '12px' }}>{getRoleBadge(u.role)}</td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#3d4566' }}>
                      {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => abrirModal(u)} style={{ background: '#1a1535', border: '1px solid #2d1f6e', color: '#a78bfa', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                          Editar
                        </button>
                        <button onClick={() => handleDeletar(u.id)} style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', color: '#f87171', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {usuariosFiltrados.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#3d4566', fontSize: '13px' }}>Nenhum usuário encontrado</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* MODAL DE EDIÇÃO */}
        {modalAberto && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#0f1220', border: '1px solid #1c2035', borderRadius: '12px', padding: '24px', width: '420px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', margin: '0 0 20px' }}>Editar Usuário</h2>

              {erro && <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: '8px', padding: '8px 12px', color: '#f87171', fontSize: '12px', marginBottom: '14px' }}>{erro}</div>}

              {[
                { label: 'Nome', field: 'nome', type: 'text' },
                { label: 'Email', field: 'email', type: 'email' },
              ].map(f => (
                <div key={f.field} style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#5a6380', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px' }}>{f.label}</label>
                  <input
                    type={f.type}
                    value={form[f.field]}
                    onChange={e => setForm(prev => ({ ...prev, [f.field]: e.target.value }))}
                    style={{ width: '100%', background: '#0c0f18', border: '1px solid #1c2035', borderRadius: '7px', padding: '9px 12px', color: '#e2e8f0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#5a6380', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px' }}>Função</label>
                <select
                  value={form.role}
                  onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}
                  style={{ width: '100%', background: '#0c0f18', border: '1px solid #1c2035', borderRadius: '7px', padding: '9px 12px', color: '#e2e8f0', fontSize: '13px', outline: 'none' }}
                >
                  <option value="usuario">Usuário</option>
                  <option value="gestor">Gestor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={fecharModal} style={{ background: 'transparent', border: '1px solid #1c2035', color: '#5a6380', padding: '8px 16px', borderRadius: '7px', fontSize: '13px', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button onClick={handleSalvar} style={{ background: 'linear-gradient(135deg,#6d28d9,#4f46e5)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: '7px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default Usuarios;