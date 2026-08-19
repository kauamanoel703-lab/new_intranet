const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'sua_chave_secreta_jucepe_2026'; // Mude em produção

// Middlewares
app.use(cors());
app.use(express.json());

// Configuração da Conexão com o Banco de Dados MySQL
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Insira sua senha do MySQL se houver
  database: 'jucepe_db' // Altere para o nome do seu banco de dados
};

let db;

// Inicialização do Banco de Dados e Criação Automática das Tabelas
async function inicializarBanco() {
  try {
    // Cria conexão inicial sem especificar banco para garantir que o BD existe
    const conexaoInicial = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });
    await conexaoInicial.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await conexaoInicial.end();

    // Conecta ao banco de dados principal
    db = await mysql.createPool(dbConfig);

    // Tabela de Usuários (senha com VARCHAR(255) para aceitar o Hash do Bcrypt)
    await db.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        cpf VARCHAR(14),
        telefone VARCHAR(20),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Altera a coluna senha para VARCHAR(255) caso a tabela já existisse com tamanho menor
    await db.query(`ALTER TABLE usuarios MODIFY COLUMN senha VARCHAR(255) NOT NULL;`);

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

    console.log('✅ Banco de dados e tabelas sincronizados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar o Banco de Dados:', error.message);
  }
}

// ==================== MIDDLEWARE DE AUTENTICAÇÃO JWT ====================

const autenticarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensagem: 'Acesso negado. Token não fornecido.' });
  }

  jwt.verify(token, JWT_SECRET, (err, usuario) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          mensagem: 'Sessão expirada. Por favor, faça login novamente.', 
          tokenExpirado: true 
        });
      }
      return res.status(403).json({ mensagem: 'Token inválido.' });
    }
    req.usuario = usuario;
    next();
  });
};

// ==================== ROTAS DE AUTENTICAÇÃO ====================

// Cadastro de Usuário
app.post('/api/register', async (req, res) => {
  const { nome, email, senha, cpf, telefone } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ mensagem: 'Preencha todos os campos obrigatórios (Nome, E-mail e Senha).' });
  }

  try {
    // Verifica se e-mail já existe
    const [usuarioExistente] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (usuarioExistente.length > 0) {
      return res.status(400).json({ mensagem: 'Este e-mail já está cadastrado.' });
    }

    // Criptografa a senha com Bcrypt
    const senhaHash = await bcrypt.hash(senha, 10);

    // Insere no banco
    const [result] = await db.query(
      'INSERT INTO usuarios (nome, email, senha, cpf, telefone) VALUES (?, ?, ?, ?, ?)',
      [nome, email, senhaHash, cpf || null, telefone || null]
    );

    console.log(`✅ [CADASTRO SUCCESSO] Usuário "${nome}" (ID: ${result.insertId}) cadastrado.`);
    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!', id: result.insertId });

  } catch (error) {
    console.error('❌ ERRO NO CADASTRO:', error);
    res.status(500).json({ mensagem: `Erro ao cadastrar usuário: ${error.message}` });
  }
});

// Login de Usuário
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ mensagem: 'Informe e-mail e senha.' });
  }

  try {
    const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (usuarios.length === 0) {
      return res.status(400).json({ mensagem: 'E-mail ou senha inválidos.' });
    }

    const usuario = usuarios[0];

    // Compara a senha informada com o Hash do banco
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(400).json({ mensagem: 'E-mail ou senha inválidos.' });
    }

    // Gera o Token JWT (expira em 8 horas)
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, nome: usuario.nome },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    const usuarioInfo = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      cpf: usuario.cpf,
      telefone: usuario.telefone
    };

    console.log(`🔑 [LOGIN SUCCESS] Usuário "${usuario.nome}" autenticado.`);
    res.json({ token, usuario: usuarioInfo });

  } catch (error) {
    console.error('❌ ERRO NO LOGIN:', error);
    res.status(500).json({ mensagem: `Erro no servidor: ${error.message}` });
  }
});

// ==================== ROTAS DE USUÁRIOS (PROTEGIDAS) ====================

// Listar Usuários
app.get('/api/usuarios', autenticarToken, async (req, res) => {
  try {
    const [usuarios] = await db.query('SELECT id, nome, email, cpf, telefone, criado_em FROM usuarios');
    res.json(usuarios);
  } catch (error) {
    console.error('❌ ERRO AO LISTAR USUÁRIOS:', error);
    res.status(500).json({ mensagem: 'Erro ao buscar usuários.' });
  }
});

// Atualizar Usuário
app.put('/api/usuarios/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;
  const { nome, email, senha, cpf, telefone } = req.body;

  try {
    if (senha) {
      const senhaHash = await bcrypt.hash(senha, 10);
      await db.query(
        'UPDATE usuarios SET nome = ?, email = ?, senha = ?, cpf = ?, telefone = ? WHERE id = ?',
        [nome, email, senhaHash, cpf, telefone, id]
      );
    } else {
      await db.query(
        'UPDATE usuarios SET nome = ?, email = ?, cpf = ?, telefone = ? WHERE id = ?',
        [nome, email, cpf, telefone, id]
      );
    }

    res.json({ mensagem: 'Usuário atualizado com sucesso!' });
  } catch (error) {
    console.error('❌ ERRO AO ATUALIZAR USUÁRIO:', error);
    res.status(500).json({ mensagem: 'Erro ao atualizar usuário.' });
  }
});

// Deletar Usuário
app.delete('/api/usuarios/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
    res.json({ mensagem: 'Usuário removido com sucesso!' });
  } catch (error) {
    console.error('❌ ERRO AO DELETAR USUÁRIO:', error);
    res.status(500).json({ mensagem: 'Erro ao deletar usuário.' });
  }
});

// ==================== ROTAS DE PROCESSOS (PROTEGIDAS) ====================

// Listar Processos
app.get('/api/processos', autenticarToken, async (req, res) => {
  try {
    const [processos] = await db.query('SELECT * FROM processos ORDER BY id DESC');
    res.json(processos);
  } catch (error) {
    console.error('❌ ERRO AO LISTAR PROCESSOS:', error);
    res.status(500).json({ mensagem: 'Erro ao listar processos.' });
  }
});

// Cadastrar Processo
app.post('/api/processos', autenticarToken, async (req, res) => {
  const { numero_processo, requerente, tipo, status, descricao } = req.body;

  if (!numero_processo || !requerente || !tipo) {
    return res.status(400).json({ mensagem: 'Campos obrigatórios do processo ausentes.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO processos (numero_processo, requerente, tipo, status, descricao) VALUES (?, ?, ?, ?, ?)',
      [numero_processo, requerente, tipo, status || 'Em Andamento', descricao || '']
    );

    res.status(201).json({ mensagem: 'Processo cadastrado com sucesso!', id: result.insertId });
  } catch (error) {
    console.error('❌ ERRO AO CADASTRAR PROCESSO:', error);
    res.status(500).json({ mensagem: 'Erro ao cadastrar processo.' });
  }
});

// Atualizar Processo
app.put('/api/processos/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;
  const { numero_processo, requerente, tipo, status, descricao } = req.body;

  try {
    await db.query(
      'UPDATE processos SET numero_processo = ?, requerente = ?, tipo = ?, status = ?, descricao = ? WHERE id = ?',
      [numero_processo, requerente, tipo, status, descricao, id]
    );

    res.json({ mensagem: 'Processo atualizado com sucesso!' });
  } catch (error) {
    console.error('❌ ERRO AO ATUALIZAR PROCESSO:', error);
    res.status(500).json({ mensagem: 'Erro ao atualizar processo.' });
  }
});

// Deletar Processo
app.delete('/api/processos/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM processos WHERE id = ?', [id]);
    res.json({ mensagem: 'Processo deletado com sucesso!' });
  } catch (error) {
    console.error('❌ ERRO AO DELETAR PROCESSO:', error);
    res.status(500).json({ mensagem: 'Erro ao deletar processo.' });
  }
});

// ==================== INICIALIZAÇÃO DO SERVIDOR ====================

app.listen(PORT, async () => {
  await inicializarBanco();
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});