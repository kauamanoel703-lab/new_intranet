const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Configuração da Conexão com o Banco de Dados MySQL (phpMyAdmin)
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',      // Ajuste para o seu usuário do MySQL, se necessário
  password: '',      // Coloque sua senha do MySQL, se houver
  database: 'intranet_jucepe'
});

// Chave secreta para geração do token JWT
const JWT_SECRET = 'sua_chave_secreta_jucepe_2026';

// Middleware de Autenticação por Token JWT
const autenticarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensagem: 'Acesso negado. Token de autenticação não informado.' });
  }

  jwt.verify(token, JWT_SECRET, (err, usuario) => {
    if (err) {
      return res.status(403).json({ mensagem: 'Sessão expirada. Por favor, faça login novamente.' });
    }
    req.usuario = usuario;
    next();
  });
};

// ==================== ROTA DE AUTENTICAÇÃO (LOGIN) ====================

app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ mensagem: 'Preencha os campos de e-mail e senha.' });
  }

  try {
    // Consulta a tabela 'usuarios' no banco intranet_jucepe
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
    }

    const usuario = rows[0];

    // Validação de senha
    if (usuario.senha !== senha) {
      return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
    }

    // Gerar token de acesso
    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome || 'Usuário', email: usuario.email },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      mensagem: 'Login realizado com sucesso!',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome || 'Usuário',
        email: usuario.email
      }
    });

  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({ mensagem: 'Erro interno no servidor ao tentar realizar login.' });
  }
});

// ==================== ROTAS DE PROCESSOS ====================

// Listar todos os processos
app.get('/processos', autenticarToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM processos ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar processos:', error);
    res.status(500).json({ mensagem: 'Erro ao buscar processos no banco de dados.' });
  }
});

// Cadastrar processo
app.post('/processos', autenticarToken, async (req, res) => {
  const { numero, empresa, tipo, requerente, status } = req.body;

  if (!empresa || !tipo) {
    return res.status(400).json({ mensagem: 'Informe a Empresa e o Tipo de Ato.' });
  }

  const numeroProtocolo = numero || `JUC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const dataHoje = new Date().toLocaleDateString('pt-BR');
  const statusInicial = status || 'Em Análise';

  try {
    const [result] = await db.query(
      'INSERT INTO processos (numero, empresa, tipo, requerente, data, status) VALUES (?, ?, ?, ?, ?, ?)',
      [numeroProtocolo, empresa, tipo, requerente || req.usuario?.nome || 'Usuário', dataHoje, statusInicial]
    );

    res.status(201).json({
      mensagem: 'Processo cadastrado com sucesso!',
      id: result.insertId,
      numero: numeroProtocolo,
      empresa,
      tipo,
      requerente: requerente || req.usuario?.nome || 'Usuário',
      data: dataHoje,
      status: statusInicial
    });
  } catch (error) {
    console.error('Erro ao cadastrar processo:', error);
    res.status(500).json({ mensagem: 'Erro ao salvar o processo no banco de dados.' });
  }
});

// Atualizar status do processo
app.put('/processos/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ mensagem: 'Informe o novo status do processo.' });
  }

  try {
    const [result] = await db.query('UPDATE processos SET status = ? WHERE id = ?', [status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Processo não encontrado.' });
    }

    res.json({ mensagem: 'Status do processo atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar processo:', error);
    res.status(500).json({ mensagem: 'Erro ao atualizar o processo no banco.' });
  }
});

// Inicialização do Servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});