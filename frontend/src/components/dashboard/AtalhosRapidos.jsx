import { ATALHOS_RAPIDOS } from '../../data/dashboardData.jsx';

export default function AtalhosRapidos() {
  return (
    <div className="atalhos-card">
      <div className="atalhos-topo">
        <h2>Atalhos Rápidos</h2>
        <span className="atalhos-subtitulo">Sistemas mais usados</span>
      </div>
      <div className="atalhos-grid">
        {ATALHOS_RAPIDOS.map((at) => (
          <a key={at.id} href={at.rota} className="atalho-item">
            <span className="atalho-icone">{at.icone}</span>
            <span className="atalho-nome">{at.nome}</span>
          </a>
        ))}
      </div>
    </div>
  );
}