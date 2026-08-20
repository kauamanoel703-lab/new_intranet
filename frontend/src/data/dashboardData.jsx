/* ============================================================================
   DADOS CENTRALIZADOS — MÓDULO 1 · DASHBOARD
   Etapas, Atalhos e Comunicados da Intranet JUCEPE
   ========================================================================== */

/* FLUXOS / ETAPAS DA INTRANET */
export const ETAPAS_FLUXO = [
  {
    id: 'protocolo',
    icone: '📥',
    titulo: 'Protocolo e Entrada',
    descricao: 'Recepção e registro de documentos e petições.',
    cor: '#38bdf8',
    status: 'Ativo',
  },
  {
    id: 'analise',
    icone: '🔍',
    titulo: 'Análise Técnica',
    descricao: 'Avaliação técnica e emissão de parecer.',
    cor: '#facc15',
    status: 'Ativo',
  },
  {
    id: 'assinatura',
    icone: '✍️',
    titulo: 'Assinatura e Registro',
    descricao: 'Assinatura da autoridade e registro oficial.',
    cor: '#4ade80',
    status: 'Ativo',
  },
  {
    id: 'arquivo',
    icone: '🗄️',
    titulo: 'Gestão e Arquivo',
    descricao: 'Gestão documental e arquivamento definitivo.',
    cor: '#f87171',
    status: 'Ativo',
  },
];

/* ATALHOS RÁPIDOS — sistemas da Junta Comercial
   (ícones SVG inline, stroke 1.6 — estilo limpo) */
export const ATALHOS_RAPIDOS = [
  {
    id: 'cnpj',
    nome: 'Consulta CNPJ',
    rota: '/consulta-cnpj',
    icone: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M9 9h6v6H9z" />
        <path d="M9 4v5M15 4v5M9 15v5M15 15v5" />
      </svg>
    ),
  },
  {
    id: 'redesim',
    nome: 'Redesim',
    rota: '/redesim',
    icone: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h4l3-8 4 16 3-8h4" />
      </svg>
    ),
  },
  {
    id: 'nire',
    nome: 'Certidão NIRE',
    rota: '/certidao-nire',
    icone: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-1" />
        <rect x="8" y="3" width="8" height="4" rx="1" />
        <path d="M9 12h6M9 16h6" />
      </svg>
    ),
  },
  {
    id: 'assinador',
    nome: 'Assinador Digital',
    rota: '/assinador',
    icone: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a5 5 0 0 0-5 5c0 2.8 2 4 2 6v2a3 3 0 0 0 6 0v-2c0-2 2-3.2 2-6a5 5 0 0 0-5-5Z" />
        <path d="M10 21h4" />
      </svg>
    ),
  },
  {
    id: 'jb',
    nome: 'Junta Brasil',
    rota: '/junta-brasil',
    icone: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M3.5 12h17M12 3.5c2.5 2.3 3.8 5.2 3.8 8.5s-1.3 6.2-3.8 8.5c-2.5-2.3-3.8-5.2-3.8-8.5S9.5 5.8 12 3.5Z" />
      </svg>
    ),
  },
  {
    id: 'santander',
    nome: 'Guia Santander',
    rota: '/guia-santander',
    icone: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10h18M7 15h2M12 15h2" />
      </svg>
    ),
  },
];

/* COMUNICADOS INSTITUCIONAIS */
export const COMUNICADOS = [
  {
    id: 1,
    tipo: 'URGENTE',
    categoria: 'Presidência',
    titulo: 'Manutenção programada do SMB',
    descricao: 'O acesso ao Sistema Brasileiro de Mensagens ficará indisponível no sábado (14h-18h) para atualização de infraestrutura.',
    cor: '#f87171',
    flag: '🚨',
    data: 'Hoje · 10:32',
  },
  {
    id: 2,
    tipo: 'ATENÇÃO',
    categoria: 'Diretoria',
    titulo: 'Novo padrão de assinatura digital',
    descricao: 'A partir de 01/09, todos os registros exigem certificado digital ICP-Brasil.',
    cor: '#facc15',
    flag: '⚠️',
    data: 'Ontem · 16:45',
  },
  {
    id: 3,
    tipo: 'INFO',
    categoria: 'Tecnologia',
    titulo: 'Painel de métricas disponível',
    descricao: 'O novo dashboard de indicadores internos já está no ar para consulta.',
    cor: '#38bdf8',
    flag: '📢',
    data: '17/08 · 09:00',
  },
];

/* CARD KPIs — cores das bordas laterais */
export const CORES_KPI = {
  border: '#0284c7',
  color: '#38bdf8',
};