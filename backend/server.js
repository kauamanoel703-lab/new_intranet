const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Configuração da Conexão com o Banco de Dados MySQL
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'intranet_jucepe'
});

const JWT_SECRET = 'sua_chave_secreta_jucepe_2026';

const autenticarToken = (req, res, next) => {
  // LIBERAÇÃO DE CORS: Permite que o preflight (OPTIONS) do navegador passe sem token
  if (req.method === 'OPTIONS') {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensagem: 'Acesso negado. Token não informado.' });
  }

  jwt.verify(token, JWT_SECRET, (err, usuario) => {
    if (err) {
      return res.status(403).json({ mensagem: 'Sessão expirada.' });
    }
    req.usuario = usuario;
    next();
  });
};

// ==================== AUTENTICAÇÃO ====================

// Rota de Cadastro
  app.post('/register', async (req, res) => {
  const { nome, email, senha, cpf, telefone } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ mensagem: 'Preencha os campos obrigatórios.' });
  }
  try {
    const [usuarioExistente] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (usuarioExistente.length > 0) {
      return res.status(400).json({ mensagem: 'E-mail já cadastrado.' });
    }
    const [result] = await db.query(
      'INSERT INTO usuarios (nome, email, senha, cpf, telefone) VALUES (?, ?, ?, ?, ?)',
      [nome, email, senha, cpf || null, telefone || null]
    );
    res.status(201).json({ mensagem: 'Cadastrado com sucesso!', id: result.insertId });
  } catch (error) {
    res.status(500).json({ mensagem: `Erro no servidor: ${error.message}` });
  }
});

// Rota de Login
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0 || rows[0].senha !== senha) {
      return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
    }
    const usuario = rows[0];
    const token = jwt.sign({ id: usuario.id, nome: usuario.nome, email: usuario.email }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ mensagem: 'Login com sucesso!', token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
  } catch (error) {
    res.status(500).json({ mensagem: `Erro no servidor: ${error.message}` });
  }
});

// ==================== ROTAS DE USUÁRIOS ====================

// Listar usuários
app.get('/api/usuarios', autenticarToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nome, email, cpf, telefone FROM usuarios ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ mensagem: `Erro ao buscar usuários: ${error.message}` });
  }
});

// Atualizar usuário
app.put('/api/usuarios/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;
  const { nome, email, cpf, telefone } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE usuarios SET nome = ?, email = ?, cpf = ?, telefone = ? WHERE id = ?',
      [nome, email, cpf || null, telefone || null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }
    res.json({ mensagem: 'Usuário atualizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ mensagem: `Erro ao atualizar usuário: ${error.message}` });
  }
});

// Deletar usuário
app.delete('/api/usuarios/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }
    res.json({ mensagem: 'Usuário removido com sucesso!' });
  } catch (error) {
    res.status(500).json({ mensagem: `Erro ao remover usuário: ${error.message}` });
  }
});

// ==================== ROTAS DE PROCESSOS ====================

// Listar Processos
app.get('/api/processos', autenticarToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM processos ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao buscar processos.' });
  }
});

// Cadastrar Processo (Aceita tanto 'empresa' quanto 'razaoSocial')
app.post('/api/processos', autenticarToken, async (req, res) => {
  const { numero, empresa, razaoSocial, tipo, requerente, status } = req.body;

  const nomeEmpresa = empresa || razaoSocial;

  if (!nomeEmpresa || !tipo) {
    return res.status(400).json({ mensagem: 'Informe a Razão Social/Empresa e o Tipo de Ato.' });
  }

  const numeroProtocolo = numero || `JUC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const dataHoje = new Date().toISOString().split('T')[0];
  const statusInicial = status || 'Em Análise';
  const nomeRequerente = requerente || req.usuario?.nome || 'Usuário';

  try {
    const [result] = await db.query(
      'INSERT INTO processos (numero, empresa, tipo, requerente, data, status) VALUES (?, ?, ?, ?, ?, ?)',
      [numeroProtocolo, nomeEmpresa, tipo, nomeRequerente, dataHoje, statusInicial]
    );

    res.status(201).json({
      mensagem: 'Processo cadastrado com sucesso!',
      id: result.insertId,
      numero: numeroProtocolo,
      empresa: nomeEmpresa,
      tipo,
      requerente: nomeRequerente,
      status: statusInicial
    });
  } catch (error) {
    console.error('Erro ao cadastrar processo:', error);
    res.status(500).json({ mensagem: `Erro no banco: ${error.message}` });
  }
});

// Atualizar processo (ex: mudar status)
app.put('/api/processos/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;
  const { status, empresa, tipo, requerente } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE processos SET status = COALESCE(?, status), empresa = COALESCE(?, empresa), tipo = COALESCE(?, tipo), requerente = COALESCE(?, requerente) WHERE id = ?',
      [status || null, empresa || null, tipo || null, requerente || null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Processo não encontrado.' });
    }
    res.json({ mensagem: 'Processo atualizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ mensagem: `Erro ao atualizar processo: ${error.message}` });
  }
});

// Excluir processo
app.delete('/api/processos/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM processos WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Processo não encontrado.' });
    }
    res.json({ mensagem: 'Processo removido com sucesso!' });
  } catch (error) {
    res.status(500).json({ mensagem: `Erro ao remover processo: ${error.message}` });
  }
});

// Inicialização do Servidor
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});