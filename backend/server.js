// ==================== CONFIGURAÇÃO INICIAL ====================
require('dotenv').config(); // Carrega variáveis de ambiente do .env

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3001;

// ==================== MIDDLEWARES DE SEGURANÇA ====================

// Helmet adiciona headers HTTP de segurança (XSS, clickjacking, etc.)
app.use(helmet());

// CORS com whitelist via .env (FRONTEND_ORIGIN pode ser lista separada por vírgula)
const origensPermitidas = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Permite requests sem origin (mobile, Postman, curl) só em dev
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    if (origensPermitidas.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origem ${origin} não permitida pelo CORS`));
  },
  credentials: true
}));

app.use(express.json());

// Rate limiter global: 100 req / 15 min por IP
const limiterGeral = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas requisições. Tente novamente em 15 minutos.' }
});
app.use(limiterGeral);

// Rate limiter específico para auth: 5 tentativas / 15 min por IP
const limiterAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas de login. Tente novamente em 15 minutos.' }
});

// ==================== BANCO DE DADOS ====================

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jucepe_db'
};

let db;

async function inicializarBanco() {
  try {
    // Garante que o banco existe
    const conexaoInicial = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });
    await conexaoInicial.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await conexaoInicial.end();

    // Conecta ao banco principal
    db = await mysql.createPool(dbConfig);

    // Tabela de Usuários
    await db.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        senha_hash VARCHAR(255) NOT NULL,
        cpf VARCHAR(14),
        telefone VARCHAR(20),
        role VARCHAR(20) DEFAULT 'usuario',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Migração: adiciona colunas em tabelas criadas com schema antigo
    try {
      await db.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'usuario';`);
    } catch (e) { /* coluna já existe em MySQL < 8 */ }

    // Renomeia coluna 'senha' → 'senha_hash' se necessário
    const [colsUsuarios] = await db.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'usuarios'`,
      [dbConfig.database]
    );
    const temSenha = colsUsuarios.some(c => c.COLUMN_NAME === 'senha');
    const temSenhaHash = colsUsuarios.some(c => c.COLUMN_NAME === 'senha_hash');
    if (temSenha && !temSenhaHash) {
      await db.query(`ALTER TABLE usuarios CHANGE COLUMN senha senha_hash VARCHAR(255) NOT NULL;`);
    }

    const temCriadoEm = colsUsuarios.some(c => c.COLUMN_NAME === 'criado_em');
    const temCreatedAt = colsUsuarios.some(c => c.COLUMN_NAME === 'created_at');
    if (temCriadoEm && !temCreatedAt) {
      await db.query(`ALTER TABLE usuarios CHANGE COLUMN criado_em created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);
    }

    // Tabela de Processos
    await db.query(`
      CREATE TABLE IF NOT EXISTS processos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        numero_processo VARCHAR(50) NOT NULL,
        requerente VARCHAR(100) NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        status VARCHAR(30) DEFAULT 'Em Andamento',
        descricao TEXT,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Tabela de Avisos (usada pelo Mural de Avisos do frontend)
    await db.query(`
      CREATE TABLE IF NOT EXISTS avisos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(200) NOT NULL,
        conteudo TEXT NOT NULL,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('✅ Banco de dados e tabelas sincronizados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar o Banco de Dados:', error.message);
    process.exit(1); // Falha rápida se o banco não inicializar
  }
}

// ==================== ROTAS ====================

// Aplica rate-limit específico nas rotas de auth
const usuarioRoutes = require('./src/routes/usuarioRoutes');
const processosRoutes = require('./src/routes/processosRoutes');
const avisosRoutes = require('./src/routes/avisosRoutes');

// Aplica rate-limit de auth nos endpoints públicos do usuarioRoutes
app.use('/api/usuarios/cadastrar', limiterAuth);
app.use('/api/usuarios/login', limiterAuth);

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/processos', processosRoutes);
app.use('/api', avisosRoutes);

// Rota raiz só pra confirmar que está online
app.get('/', (req, res) => {
  res.json({ status: 'online', servico: 'Intranet JUCEPE API', versao: '1.0.0' });
});

// Tratamento global de erros
app.use((err, req, res, next) => {
  console.error('❌ ERRO:', err.message);
  res.status(err.status || 500).json({ erro: err.message || 'Erro interno do servidor' });
});

// ==================== INICIALIZAÇÃO ====================

app.listen(PORT, async () => {
  await inicializarBanco();
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🔒 CORS permitido para: ${origensPermitidas.join(', ')}`);
});
