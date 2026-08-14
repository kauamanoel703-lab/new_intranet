import React from 'react';
import { useAuth } from '../contexts/AuthContext';
// MainLayout foi removido temporariamente para quebrar a tela branca!

const Dashboard = () => {
  const { usuario } = useAuth();

  // Tratativa ultra-segura para o primeiro nome
  const primeiroNome = usuario && usuario.nome 
    ? usuario.nome.split(' ')[0] 
    : 'Usuário';

  const cards = [
    { label: 'Usuários cadastrados', valor: '142', trend: '▲ +8 este mês', cor: '#6d28d9', trendCor: '#10b981' },
    { label: 'Processos concluídos', valor: '891', trend: '▲ +5% vs anterior', cor: '#0d9488', trendCor: '#10b981' },
    { label: 'Solicitações abertas', valor: '37', trend: '12 aguardando', cor: '#d97706', trendCor: '#f87171' },
    { label: 'Documentos emitidos', valor: '2.4k', trend: 'Agosto 2026', cor: '#be185d', trendCor: '#5a6380' },
  ];

  const atalhos = [
    { label: 'Processos', icon: '📄', bg: '#1a1535', cor: '#a78bfa' },
    { label: 'RH', icon: '👥', bg: '#0a1f14', cor: '#34d399' },
    { label: 'Solicitações', icon: '📋', bg: '#1f1508', cor: '#fbbf24' },
    { label: 'Relatórios', icon: '📊', bg: '#1f0a14', cor: '#f472b6' },
    { label: 'Agenda', icon: '📅', bg: '#001515', cor: '#22d3ee' },
    { label: 'Comunicação', icon: '✉️', bg: '#15001f', cor: '#c084fc' },
    { label: 'Treinamentos', icon: '🎓', bg: '#0f150a', cor: '#86efac' },
    { label: 'TI', icon: '🛠️', bg: '#1a0f00', cor: '#fb923c' },
  ];

  const comunicados = [
    { titulo: 'Novo módulo de gestão documental disponível para todos os setores', tempo: 'Hoje · 14h30 · TI', cor: '#a78bfa', urgente: false },
    { titulo: 'Convocação — Reunião de planejamento estratégico 2026/2027', tempo: 'Ontem · 09h15 · Diretoria', cor: '#34d399', urgente: false },
    { titulo: 'Campanha de vacinação na sede — agende sua dose', tempo: '12/08 · 08h00 · RH', cor: '#fbbf24', urgente: false },
  ];

  const aniversariantes = [
    { nome: 'Maria Santos', dept: 'Atendimento', dia: 'Hoje', grad: ['#6d28d9', '#4f46e5'] },
    { nome: 'João Oliveira', dept: 'Jurídico', dia: '14/08', grad: ['#0d9488', '#0891b2'] },
    { nome: 'Ana Lima', dept: 'Financeiro', dia: '18/08', grad: ['#059669', '#10b981'] },
    { nome: 'Rafael Costa', dept: 'TI', dia: '22/08', grad: ['#d97706', '#f59e0b'] },
  ];

  const panel = { background: '#0f1220', border: '1px solid #1c2035', borderRadius: '11px', padding: '16px' };
  const panelTitle = { fontSize: '12.5px', fontWeight: '600', color: '#c4cde8', marginBottom: '13px' };

  return (
    // Wrapper simples substituindo o MainLayout temporariamente
    <div style={{ backgroundColor: '#050814', minHeight: '100vh', padding: '30px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1200px', margin: '0 auto' }}>

        {/* MENSAGEM DE SUCESSO - PARA PROVAR QUE FUNCIONOU */}
        <div style={{ background: '#10b981', color: '#fff', padding: '10px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}>
          ✅ LOGIN E ROTAS FUNCIONANDO! O ERRO ERA O MAINLAYOUT.
        </div>

        {/* HERO */}
        <div style={{ ...panel, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(109,40,217,0.07) 0%,transparent 70%)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: '10px', color: '#3d4566', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '5px' }}>Bem-vindo de volta</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#f8fafc', marginBottom: '5px' }}>
              Olá, <span style={{ background: 'linear-gradient(90deg,#a78bfa,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{primeiroNome}</span> 👋
            </div>
            <div style={{ fontSize: '12.5px', color: '#5a6380', lineHeight: '1.6', maxWidth: '420px' }}>
              Conectando pessoas, serviços e inovação na JUCEPE. Você tem pendências para resolver hoje.
            </div>
            <div style={{ display: 'flex', gap: '7px', marginTop: '13px', flexWrap: 'wrap' }}>
              {[
                { label: '3 Pendências', bg: '#1a1535', cor: '#a78bfa', borda: '#2d1f6e' },
                { label: 'Sistema estável', bg: '#0a1f14', cor: '#34d399', borda: '#064e3b' },
                { label: '2 Eventos hoje', bg: '#1f1508', cor: '#fbbf24', borda: '#78350f' },
              ].map((t, i) => (
                <div key={i} style={{ padding: '4px 11px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: t.bg, color: t.cor, border: `1px solid ${t.borda}` }}>{t.label}</div>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '34px', fontWeight: '800', color: '#f8fafc', lineHeight: 1 }}>142</div>
            <div style={{ fontSize: '11px', color: '#3d4566', marginTop: '3px' }}>usuários ativos</div>
            <div style={{ fontSize: '10px', color: '#10b981', marginTop: '2px' }}>▲ +8 este mês</div>
          </div>
        </div>

        {/* MÉTRICAS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '11px' }}>
          {cards.map((c, i) => (
            <div key={i} style={{ ...panel, borderTop: `2px solid ${c.cor}`, padding: '15px' }}>
              <div style={{ fontSize: '10px', color: '#3d4566', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '8px' }}>{c.label}</div>
              <div style={{ fontSize: '26px', fontWeight: '700', color: '#f8fafc' }}>{c.valor}</div>
              <div style={{ fontSize: '10px', color: c.trendCor, marginTop: '4px' }}>{c.trend}</div>
            </div>
          ))}
        </div>

        {/* ATALHOS */}
        <div style={panel}>
          <div style={panelTitle}>⚡ Acesso rápido</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: '8px' }}>
            {atalhos.map((a, i) => (
              <div key={i} style={{ background: '#0c0f18', border: '1px solid #1c2035', borderRadius: '9px', padding: '12px 8px', textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 7px', fontSize: '16px' }}>{a.icon}</div>
                <div style={{ fontSize: '10px', color: '#5a6380', fontWeight: '500' }}>{a.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* COMUNICADOS + ANIVERSARIANTES */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '14px' }}>
          <div style={panel}>
            <div style={panelTitle}>🔔 Comunicados</div>
            <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: '9px', padding: '10px 13px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '11px' }}>
              <span style={{ color: '#f87171', fontSize: '15px', flexShrink: 0 }}>⚠️</span>
              <div>
                <div style={{ fontSize: '11.5px', color: '#fca5a5', fontWeight: '600' }}>Urgente — Manutenção sáb. 15/08 das 22h às 02h</div>
                <div style={{ fontSize: '10px', color: '#5a6380', marginTop: '1px' }}>Sistema temporariamente indisponível</div>
              </div>
            </div>
            {comunicados.map((n, i) => (
              <div key={i} style={{ display: 'flex', gap: '11px', padding: '9px 0', borderBottom: i < comunicados.length - 1 ? '1px solid #1c2035' : 'none' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: n.cor, marginTop: '5px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '11.5px', color: '#c4cde8', fontWeight: '500', lineHeight: '1.4', marginBottom: '2px' }}>{n.titulo}</div>
                  <div style={{ fontSize: '10px', color: '#2e3555' }}>{n.tempo}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={panel}>
            <div style={panelTitle}>🎂 Aniversariantes</div>
            {aniversariantes.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 0', borderBottom: i < aniversariantes.length - 1 ? '1px solid #1c2035' : 'none' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: `linear-gradient(135deg,${a.grad[0]},${a.grad[1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>
                  {a.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11.5px', color: '#c4cde8', fontWeight: '500' }}>{a.nome}</div>
                  <div style={{ fontSize: '10px', color: '#2e3555' }}>{a.dept}</div>
                </div>
                <div style={{ fontSize: '10px', color: a.dia === 'Hoje' ? '#a78bfa' : '#3d4566', fontWeight: a.dia === 'Hoje' ? '600' : '400' }}>{a.dia}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;