import React, { useState } from 'react';

const EtapasGrid = ({ etapas, onSelecionarEtapa, etapaSelecionada }) => {
  const [hoverId, setHoverId] = useState(null);

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
      gap: '16px',
      marginBottom: '32px'
    }}>
      {etapas.map((etapa) => {
        const isHovered = hoverId === etapa.id;
        const isSelected = etapaSelecionada?.id === etapa.id;

        return (
          <div 
            key={etapa.id}
            onClick={() => onSelecionarEtapa(etapa)}
            onMouseEnter={() => setHoverId(etapa.id)}
            onMouseLeave={() => setHoverId(null)}
            style={{
              backgroundColor: isSelected ? '#1e293b' : '#0f172a',
              borderLeft: `4px solid ${etapa.cor}`,
              borderTop: `1px solid ${isHovered || isSelected ? etapa.cor : '#1e293b'}`,
              borderRight: `1px solid ${isHovered || isSelected ? etapa.cor : '#1e293b'}`,
              borderBottom: `1px solid ${isHovered || isSelected ? etapa.cor : '#1e293b'}`,
              borderRadius: '8px',
              padding: '20px',
              cursor: 'pointer',
              transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: isHovered ? '0 4px 12px rgba(0, 0, 0, 0.3)' : 'none',
              transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
            }}
          >
            {/* Ícone */}
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>
              {etapa.icone}
            </div>

            {/* Título */}
            <h3 style={{ 
              margin: '0 0 8px 0', 
              fontSize: '16px', 
              fontWeight: '700', 
              color: '#fff' 
            }}>
              {etapa.titulo}
            </h3>

            {/* Descrição */}
            <p style={{ 
              margin: '0 0 16px 0', 
              fontSize: '13px', 
              color: '#94a3b8', 
              lineHeight: '1.5' 
            }}>
              {etapa.descricao}
            </p>

            {/* Rodapé do card */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <span style={{ 
                fontSize: '12px', 
                color: '#64748b', 
                fontWeight: '600' 
              }}>
                {etapa.contador} {etapa.contador === 1 ? 'processo' : 'processos'}
              </span>
              <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '600',
                backgroundColor: isSelected ? '#065f46' : (etapa.status === 'Ativo' ? '#1e3a8a' : '#1e3a8a'),
                color: isSelected ? '#34d399' : '#93c5fd'
              }}>
                {isSelected ? 'Selecionada' : etapa.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EtapasGrid;