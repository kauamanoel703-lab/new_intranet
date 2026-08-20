import { useState } from 'react';

export default function EtapasGrid({ etapas, onSelecionarEtapa, etapaSelecionada }) {
  const [hoverId, setHoverId] = useState(null);

  return (
    <div className="etapas-grid">
      {etapas.map((etapa) => {
        const isHovered = hoverId === etapa.id;
        const isSelected = etapaSelecionada?.id === etapa.id;

        return (
          <button
            key={etapa.id}
            type="button"
            className={`etapa-card ${isHovered ? 'hovered' : ''} ${isSelected ? 'selected' : ''}`}
            style={{ '--cor-etapa': etapa.cor }}
            onClick={() => onSelecionarEtapa(etapa)}
            onMouseEnter={() => setHoverId(etapa.id)}
            onMouseLeave={() => setHoverId(null)}
          >
            <span className="etapa-barra-lateral" style={{ background: etapa.cor }} />
            <span className="etapa-glow" />

            <div className="etapa-icone">{etapa.icone}</div>
            <h3>{etapa.titulo}</h3>
            <p>{etapa.descricao}</p>

            <div className="etapa-rodape">
              <span className="etapa-contador">
                {etapa.contador} {etapa.contador === 1 ? 'processo' : 'processos'}
              </span>
              <span className={`etapa-badge ${isSelected ? 'badge-selecionada' : ''}`}>
                {isSelected ? 'Selecionada' : etapa.status}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}