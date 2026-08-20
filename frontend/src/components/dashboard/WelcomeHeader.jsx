import { useEffect, useState } from 'react';

const getSaudacao = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return { texto: 'Bom dia', emoji: '🌤️' };
  if (h >= 12 && h < 18) return { texto: 'Boa tarde', emoji: '☀️' };
  return { texto: 'Boa noite', emoji: '🌙' };
};

const StatusPill = ({ label, pulse }) => (
  <span className="status-pill">
    <span className={`status-dot ${pulse ? 'status-dot-pulse' : ''}`} />
    {label}
  </span>
);

export default function WelcomeHeader({ usuarioNome }) {
  const [saudacao, setSaudacao] = useState(getSaudacao());
  const [agora, setAgora] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => {
      setSaudacao(getSaudacao());
      setAgora(new Date());
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const dataLonga = agora
    .toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    .replace(/^./, (c) => c.toUpperCase());

  const hora = agora.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="welcome-header">
      <div className="welcome-header-glow" />
      <div className="welcome-saudacao">
        <span className="welcome-emoji">{saudacao.emoji}</span>
        <div>
          <h1>
            {saudacao.texto},{' '}
            <span className="welcome-nome">{usuarioNome || 'Usuário'}</span>
          </h1>
          <p className="welcome-data">
            {dataLonga} · {hora}
          </p>
        </div>
      </div>
      <div className="welcome-status">
        <StatusPill label="Sistemas Operacionais" pulse />
        <StatusPill label="Banco de Dados" />
        <StatusPill label="Fila de Processos" />
      </div>
    </div>
  );
}