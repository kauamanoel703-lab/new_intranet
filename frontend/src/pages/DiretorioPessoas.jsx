import React, { useState, useMemo, useRef, useEffect } from 'react';

import ColaboradorCard from '../components/diretorio/ColaboradorCard';
import '../styles/dashboard.css';
import '../styles/diretorio.css';

// Dados mockados — substituir por chamada à API (services/api.js)
const COLABORADORES = [
  {
    id: 1,
    nome: 'Ana Beatriz Souza',
    cargo: 'Diretora de Tecnologia',
    setor: 'Diretoria',
    ramal: '2101',
    email: 'ana.souza@jucepe.pe.gov.br',
    foto: '',
    competencias: ['React', 'Node.js', 'Gestão de Equipes', 'Arquitetura de Software'],
  },
  {
    id: 2,
    nome: 'Carlos Eduardo Lima',
    cargo: 'Analista de Registro Mercantil',
    setor: 'Registro Mercantil',
    ramal: '2203',
    email: 'carlos.lima@jucepe.pe.gov.br',
    foto: '',
    competencias: ['Legislação Empresarial', 'Análise Documental'],
  },
  {
    id: 3,
    nome: 'Mariana Oliveira',
    cargo: 'Desenvolvedora Frontend',
    setor: 'Tecnologia',
    ramal: '2307',
    email: 'mariana.oliveira@jucepe.pe.gov.br',
    foto: '',
    competencias: ['React', 'TypeScript', 'UI/UX', 'CSS Avançado'],
  },
  {
    id: 4,
    nome: 'João Pedro Santos',
    cargo: 'Atendente de Balcão',
    setor: 'Atendimento',
    ramal: '2401',
    email: 'joao.santos@jucepe.pe.gov.br',
    foto: '',
    competencias: ['Atendimento ao Público', 'Protocolo'],
  },
  {
    id: 5,
    nome: 'Fernanda Costa',
    cargo: 'Analista de Sistemas',
    setor: 'Tecnologia',
    ramal: '2309',
    email: 'fernanda.costa@jucepe.pe.gov.br',
    foto: '',
    competencias: ['Node.js', 'PostgreSQL', 'APIs REST', 'Docker'],
  },
  {
    id: 6,
    nome: 'Ricardo Almeida',
    cargo: 'Assessor Jurídico',
    setor: 'Diretoria',
    ramal: '2105',
    email: 'ricardo.almeida@jucepe.pe.gov.br',
    foto: '',
    competencias: ['Direito Empresarial', 'Pareceres Técnicos'],
  },
  {
    id: 7,
    nome: 'Patrícia Gomes',
    cargo: 'Técnica em Registro',
    setor: 'Registro Mercantil',
    ramal: '2210',
    email: 'patricia.gomes@jucepe.pe.gov.br',
    foto: '',
    competencias: ['Registro de Empresas', 'Certificação Digital'],
  },
  {
    id: 8,
    nome: 'Lucas Ferreira',
    cargo: 'Suporte de TI',
    setor: 'Tecnologia',
    ramal: '2312',
    email: 'lucas.ferreira@jucepe.pe.gov.br',
    foto: '',
    competencias: ['Suporte Técnico', 'Redes', 'Windows Server'],
  },
];

const SETORES = ['Todos', 'Diretoria', 'Registro Mercantil', 'Tecnologia', 'Atendimento'];

export default function DiretorioPessoas() {
  const [busca, setBusca] = useState('');
  const [buscaDebounced, setBuscaDebounced] = useState('');
  const [setorSelecionado, setSetorSelecionado] = useState('Todos');
  const debounceRef = useRef(null);

  // Debounce de 300ms para busca instantânea
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setBuscaDebounced(busca);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [busca]);

  // Filtro combinado: busca (nome, cargo, setor, competências) + setor estrutural
  const colaboradoresFiltrados = useMemo(() => {
    const termo = buscaDebounced.trim().toLowerCase();

    return COLABORADORES.filter((colab) => {
      // Filtro por setor estrutural
      if (setorSelecionado !== 'Todos' && colab.setor !== setorSelecionado) {
        return false;
      }

      // Filtro por busca (nome, cargo, setor, competências)
      if (!termo) return true;

      const camposBusca = [
        colab.nome,
        colab.cargo,
        colab.setor,
        ...(colab.competencias || []),
      ]
        .join(' ')
        .toLowerCase();

      return camposBusca.includes(termo);
    });
  }, [buscaDebounced, setorSelecionado]);

  return (
    <div className="diretorio-shell">
      {/* Cabeçalho da página */}
      <header className="diretorio-header">
        <div>
          <h1 className="diretorio-titulo">Diretório de Pessoas</h1>
          <p className="diretorio-subtitulo">
            Organograma corporativo · {COLABORADORES.length} colaboradores
          </p>
        </div>
      </header>

      {/* Busca instantânea global */}
      <div className="diretorio-busca-wrapper">
        <svg
          className="diretorio-busca-icone"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          className="diretorio-busca-input"
          placeholder="Buscar por nome, cargo, setor ou competência técnica..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar colaboradores"
        />
        {busca && (
          <button
            className="diretorio-busca-limpar"
            onClick={() => setBusca('')}
            aria-label="Limpar busca"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filtros por setor (tags de seleção rápida) */}
      <nav className="diretorio-filtros" aria-label="Filtrar por setor">
        {SETORES.map((setor) => (
          <button
            key={setor}
            className={`diretorio-filtro-tag ${setorSelecionado === setor ? 'ativo' : ''}`}
            onClick={() => setSetorSelecionado(setor)}
          >
            {setor}
          </button>
        ))}
      </nav>

      {/* Contador de resultados */}
      <p className="diretorio-resultado-info">
        {colaboradoresFiltrados.length === 0
          ? 'Nenhum colaborador encontrado.'
          : `${colaboradoresFiltrados.length} colaborador${colaboradoresFiltrados.length > 1 ? 'es' : ''} encontrado${colaboradoresFiltrados.length > 1 ? 's' : ''}`}
      </p>

      {/* Grid de cards */}
      {colaboradoresFiltrados.length === 0 ? (
        <div className="diretorio-vazio">
          <span className="diretorio-vazio-icone">🔍</span>
          <p>Nenhum resultado para sua busca.</p>
          <p className="diretorio-vazio-dica">
            Tente buscar por outro nome, cargo, setor ou competência.
          </p>
        </div>
      ) : (
        <div className="diretorio-grid">
          {colaboradoresFiltrados.map((colab) => (
            <ColaboradorCard key={colab.id} colaborador={colab} />
          ))}
        </div>
      )}
    </div>
  );
}