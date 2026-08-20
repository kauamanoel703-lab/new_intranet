import React from 'react';

/**
 * ColaboradorCard — Card corporativo individual
 * Exibe avatar (com fallback de iniciais), nome, cargo, setor e contato.
 */
export default function ColaboradorCard({ colaborador }) {
  const { nome, cargo, setor, ramal, email, foto, competencias = [] } = colaborador;

  // Fallback elegante: iniciais do nome quando não há foto
  const iniciais = nome
    .split(' ')
    .filter((p) => p.length > 0)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

  return (
    <article className="colaborador-card">
      {/* Avatar / Foto de perfil */}
      <div className="colaborador-avatar">
        {foto ? (
          <img src={foto} alt={`Foto de ${nome}`} loading="lazy" />
        ) : (
          <span className="colaborador-avatar-iniciais">{iniciais}</span>
        )}
        <span className="colaborador-status-dot" title="Disponível" />
      </div>

      {/* Identificação */}
      <h3 className="colaborador-nome">{nome}</h3>
      <p className="colaborador-cargo">{cargo}</p>
      <p className="colaborador-setor">{setor}</p>

      {/* Competências técnicas */}
      {competencias.length > 0 && (
        <div className="colaborador-competencias">
          {competencias.slice(0, 3).map((comp) => (
            <span key={comp} className="colaborador-competencia-tag">
              {comp}
            </span>
          ))}
          {competencias.length > 3 && (
            <span className="colaborador-competencia-tag colaborador-competencia-mais">
              +{competencias.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Contato */}
      <div className="colaborador-contato">
        {ramal && (
          <span className="colaborador-contato-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Ramal {ramal}
          </span>
        )}
        {email && (
          <span className="colaborador-contato-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            {email}
          </span>
        )}
      </div>
    </article>
  );
}