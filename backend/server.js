// ==================== CONFIGURAÇÃO INICIAL ====================
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_jucepe_2026';

// ==================== MIDDLEWARES DE SEGURANÇA ====================
app.use(helmet());

const origensPermitidas = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
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

// Log de requisições
app.use((req, res, next) => {
  if (req.method !== 'GET') {
    console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    const bodyLog = { ...req.body };
    if (bodyLog.senha) bodyLog.senha = '***';
    console.log('  Body recebido:', JSON.stringify(bodyLog, null, 2));
  }
  next();
});

// Rate limiters
const limiterGeral = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas requisições. Tente novamente em 15 minutos.' }
});
app.use(limiterGeral);

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
  database: process.env.DB_NAME || 'intranet_jucepe'
};

let db;

async function inicializarBanco() {
  try {
    const conexaoInicial = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    await conexaoInicial.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await conexaoInicial.end();

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

    // Tabela de Processos
    await db.query(`
      CREATE TABLE IF NOT EXISTS processos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        numero VARCHAR(50) NOT NULL,
        empresa VARCHAR(100) NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        requerente VARCHAR(100) NOT NULL,
        data DATE NOT NULL,
        status VARCHAR(30) DEFAULT 'Em Análise'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Tabela de Avisos
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
    process.exit(1);
  }
}

// ==================== MIDDLEWARE DE AUTENTICAÇÃO ====================
function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ mensagem: 'Token de autenticação não fornecido.' });

  jwt.verify(token, JWT_SECRET, (err, usuario) => {
    if (err) return res.status(403).json({ mensagem: 'Token inválido ou expirado.' });
    req.usuario = usuario;
    next();
  });
}

// ==================== ROTAS ====================

// Rota de Cadastro com Rate Limit de Auth
app.post('/api/usuarios/cadastrar', limiterAuth, async (req, res) => {
  const { nome, email, senha, cpf, telefone } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ mensagem: 'Preencha os campos obrigatórios.' });
  }

  try {
    const [usuarioExistente] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (usuarioExistente.length > 0) {
      return res.status(400).json({ mensagem: 'E-mail já cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const [result] = await db.query(
      'INSERT INTO usuarios (nome, email, senha_hash, cpf, telefone) VALUES (?, ?, ?, ?, ?)',
      [nome.trim(), email.trim(), senhaHash, cpf || null, telefone || null]
    );
    res.status(201).json({ mensagem: 'Cadastrado com sucesso!', id: result.insertId });
  } catch (error) {
    console.error('❌ Erro no cadastro:', error);
    res.status(500).json({ mensagem: 'Erro no servidor.' });
  }
});

// Rota de Login com Rate Limit de Auth
app.post('/api/usuarios/login', limiterAuth, async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ mensagem: 'Informe e-mail e senha.' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [String(email).trim()]);
    if (rows.length === 0) {
      return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
    }

    const usuario = rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
    }

    const token = jwt.sign({ id: usuario.id, nome: usuario.nome, email: usuario.email }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ mensagem: 'Login com sucesso!', token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ mensagem: 'Erro no servidor.' });
  }
});

// ==================== ROTAS DE PROCESSOS ====================

// Listar Processos
app.get('/api/processos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM processos ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('❌ Erro ao listar processos:', error);
    res.status(500).json({ mensagem: 'Erro ao buscar processos.' });
  }
});

// Cadastrar Processo
app.post('/api/processos', async (req, res) => {
  const { numero, empresa, tipo, requerente, status } = req.body;

  const numeroProtocolo = numero || `JUC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const dataHoje = new Date().toISOString().split('T')[0];
  const statusInicial = status || 'Em Análise';

  if (!empresa || !tipo) {
    return res.status(400).json({ mensagem: 'Informe a Empresa e o Tipo de Ato.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO processos (numero, empresa, tipo, requerente, data, status) VALUES (?, ?, ?, ?, ?, ?)',
      [numeroProtocolo, empresa, tipo, requerente || 'Usuário', dataHoje, statusInicial]
    );

    res.status(201).json({
      mensagem: 'Processo cadastrado com sucesso!',
      id: result.insertId,
      numero: numeroProtocolo,
      empresa,
      tipo,
      requerente: requerente || 'Usuário',
      data: dataHoje,
      status: statusInicial
    });
  } catch (error) {
    console.error('❌ Erro ao cadastrar processo:', error);
    res.status(500).json({ mensagem: 'Erro no servidor ao salvar processo.' });
  }
});

// Rota raiz
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