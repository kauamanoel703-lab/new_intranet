import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  // Tratativa para exibição do nome real
  const nomeExibicao = usuario?.nome || 'Usuário';
  const emailExibicao = usuario?.email || 'Não informado';
  const perfilExibicao = usuario?.role ? usuario.role.toUpperCase() : 'COMUM';

  const panel = { 
    background: '#0f1220', 
    border: '1px solid #1c2035', 
    borderRadius: '11px', 
    padding: '20px' 
  };
  
  const panelTitle = { 
    fontSize: '14px', 
    fontWeight: '600', 
    color: '#c4cde8', 
    marginBottom: '16px' 
  };

  return (
    <MainLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>

        {/* HERO - DADOS REAIS DO USUÁRIO LOGADO */}
        <div style={{ ...panel, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(109,40,217,0.12) 0%,transparent 70%)' }} />
          
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: '11px', color: '#6d789c', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '6px' }}>
              Painel Interno — JUCEPE
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#f8fafc', marginBottom: '6px' }}>
              Bem-vindo(a), <span style={{ background: 'linear-gradient(90deg,#a78bfa,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{nomeExibicao}</span> 👋
            </div>
            <div style={{ fontSize: '13px', color: '#8a94b8', lineHeight: '1.6' }}>
              Sua sessão está ativa e autenticada com sucesso no sistema.
            </div>
          </div>

          <div style={{ textAlign: 'right', flexShrink: 0, zIndex: 1 }}>
            <span style={{ 
              backgroundColor: '#1a1535', 
              color: '#a78bfa', 
              border: '1px solid #2d1f6e', 
              padding: '6px 14px', 
              borderRadius: '20px', 
              fontSize: '12px', 
              fontWeight: '600' 
            }}>
              Perfil: {perfilExibicao}
            </span>
          </div>
        </div>

        {/* INFORMAÇÕES DO PERFIL REAL */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', width: '100%' }}>
          <div style={panel}>
            <div style={{ fontSize: '11px', color: '#6d789c', textTransform: 'uppercase', marginBottom: '6px' }}>Email Cadastrado</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#f8fafc' }}>{emailExibicao}</div>
          </div>

          <div style={panel}>
            <div style={{ fontSize: '11px', color: '#6d789c', textTransform: 'uppercase', marginBottom: '6px' }}>Status da Conexão</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
              Autenticado via JWT
            </div>
          </div>

          <div style={panel}>
            <div style={{ fontSize: '11px', color: '#6d789c', textTransform: 'uppercase', marginBottom: '6px' }}>Identificador do Usuário</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#f8fafc' }}>ID #{usuario?.id || 'N/A'}</div>
          </div>
        </div>

        {/* MÓDULO DE ATALHOS DO SISTEMA */}
        <div style={panel}>
          <div style={panelTitle}>⚡ Módulos do Sistema</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            {[
              { label: 'Gerenciar Usuários', icon: '👥', path: '/usuarios', cor: '#a78bfa' },
              { label: 'Processos', icon: '📄', path: '/processos', cor: '#34d399' },
              { label: 'Solicitações', icon: '📋', path: '#', cor: '#fbbf24' },
              { label: 'Configurações', icon: '🛠️', path: '#', cor: '#f472b6' },
            ].map((m, i) => (
              <div 
                key={i} 
                onClick={() => m.path !== '#' && navigate(m.path)}
                style={{ 
                  background: '#0c0f18', 
                  border: '1px solid #1c2035', 
                  borderRadius: '9px', 
                  padding: '16px 12px', 
                  textAlign: 'center', 
                  cursor: m.path !== '#' ? 'pointer' : 'default',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '22px', marginBottom: '8px' }}>{m.icon}</div>
                <div style={{ fontSize: '12px', color: '#c4cde8', fontWeight: '500' }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default Dashboard;