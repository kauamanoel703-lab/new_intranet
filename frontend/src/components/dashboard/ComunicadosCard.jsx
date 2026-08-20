import { useEffect, useRef, useState } from 'react';

import { COMUNICADOS } from '../../data/dashboardData.jsx';

export default function ComunicadosCard({
  comunicados = COMUNICADOS,
  intervalo = 6000,
}) {
  const [ativo, setAtivo] = useState(0);
  const [pausado, setPausado] = useState(false);
  const timerRef = useRef(null);

  const total = Array.isArray(comunicados) ? comunicados.length : 0;
  const temComunicados = total > 0;

  // Índice derivado — nunca fica fora do range da lista atual
  const indiceAtivo = temComunicados && ativo >= total ? 0 : ativo;

  // Rotação automática — pausada no hover e com 1 item (ou lista vazia)
  useEffect(() => {
    if (!temComunicados || total <= 1 || pausado) return;
    timerRef.current = setInterval(() => {
      setAtivo((prev) => (prev + 1) % total);
    }, intervalo);
    return () => clearInterval(timerRef.current);
  }, [temComunicados, total, pausado, intervalo]);

  // Empty state elegante — nunca exibir bloco preto vazio
  if (!temComunicados) {
    return (
      <div className="comunicados-card comunicados-vazio">
        <div className="comunicados-empty">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 11l18-5v12L3 13v-2z" />
            <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
          </svg>
          <p>Nenhum comunicado oficial no momento</p>
        </div>
      </div>
    );
  }

  const aviso = comunicados[indiceAtivo];
  const proximo = () => setAtivo((prev) => (prev + 1) % total);
  const anterior = () => setAtivo((prev) => (prev - 1 + total) % total);

  return (
    <div
      className="comunicados-card"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      <div className="comunicados-topo">
        <h2>Comunicados Institucionais</h2>
        <div className="comunicados-dots">
          {comunicados.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`comunicado-dot ${i === indiceAtivo ? 'active' : ''}`}
              style={i === indiceAtivo ? { backgroundColor: comunicados[indiceAtivo].cor } : undefined}
              onClick={() => setAtivo(i)}
              aria-label={`Ir para comunicado ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="comunicados-viewport">
        <article
          key={aviso.id}
          className="comunicado-item comunicado-item-ativo"
          style={{ '--cor-aviso': aviso.cor }}
        >
          <span className="comunicado-flag">{aviso.flag}</span>
          <div className="comunicado-conteudo">
            <div className="comunicado-meta">
              <span
                className="comunicado-tipo"
                style={{ color: aviso.cor, backgroundColor: `${aviso.cor}1a` }}
              >
                {aviso.tipo}
              </span>
              <span className="comunicado-categoria">{aviso.categoria}</span>
            </div>
            <h3>{aviso.titulo}</h3>
            <p>{aviso.descricao}</p>
            <span className="comunicado-data">{aviso.data}</span>
          </div>
        </article>

        {/* Setas de navegação — apenas quando há 2+ comunicados */}
        {total > 1 && (
          <>
            <button
              type="button"
              className="comunicado-setas comunicado-anterior"
              onClick={anterior}
              aria-label="Comunicado anterior"
            >
              ‹
            </button>
            <button
              type="button"
              className="comunicado-setas comunicado-proximo"
              onClick={proximo}
              aria-label="Próximo comunicado"
            >
              ›
            </button>
          </>
        )}
      </div>
    </div>
  );
}