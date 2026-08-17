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
  database: 'jucepe_infranet'
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

// ==================== ROTA DE CADASTRO DE USUÁRIO ====================

app.post('/register', async (req, res) => {
  const { nome, email, senha, cpf, telefone } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ mensagem: 'Preencha os campos obrigatórios: nome, email e senha.' });
  }

  try {
    const [usuarioExistente] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (usuarioExistente.length > 0) {
      return res.status(400).json({ mensagem: 'Este e-mail já está cadastrado no sistema.' });
    }

    const [result] = await db.query(
      'INSERT INTO usuarios (nome, email, senha, cpf, telefone) VALUES (?, ?, ?, ?, ?)',
      [nome, email, senha, cpf || null, telefone || null]
    );

    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso!',
      id: result.insertId
    });

  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ mensagem: 'Erro interno no servidor ao tentar realizar cadastro.' });
  }
});

// ==================== ROTA DE AUTENTICAÇÃO (LOGIN) ====================

app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ mensagem: 'Preencha os campos de e-mail e senha.' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (rows.length === 0 || rows[0].senha !== senha) {
      return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
    }

    const usuario = rows[0];

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

// ==================== ROTA DE MÉTRICAS DO DASHBOARD ====================

app.get('/dashboard/metricas', autenticarToken, async (req, res) => {
  try {
    const [totalRows] = await db.query('SELECT COUNT(*) AS total FROM processos');
    const [emAnaliseRows] = await db.query('SELECT COUNT(*) AS total FROM processos WHERE status = "Em Análise"');
    const [aprovadosRows] = await db.query('SELECT COUNT(*) AS total FROM processos WHERE status IN ("Aprovado", "Deferido", "Concluído")');
    const [exigenciaRows] = await db.query('SELECT COUNT(*) AS total FROM processos WHERE status = "Com Exigência"');
    const [indeferidosRows] = await db.query('SELECT COUNT(*) AS total FROM processos WHERE status = "Indeferido"');

    res.json({
      total: totalRows[0].total,
      emAnalise: emAnaliseRows[0].total,
      aprovados: aprovadosRows[0].total,
      exigencia: exigenciaRows[0].total,
      indeferidos: indeferidosRows[0].total
    });
  } catch (error) {
    console.error('Erro ao carregar métricas:', error);
    res.status(500).json({ mensagem: 'Erro ao buscar métricas do dashboard.' });
  }
});

// ==================== ROTAS DE PROCESSOS ====================

// Listar todos os processos
app.get('/processos', autenticarToken, async (req, res) => {
  try {
    // Busca os dados e tenta formatar a data diretamente no MySQL para DD/MM/YYYY
    // Caso a coluna "data" seja VARCHAR, a formatação DATE_FORMAT retornará null, então usamos um fallback
    const [rows] = await db.query(`
      SELECT *, DATE_FORMAT(data, '%d/%m/%Y') AS dataFormatada 
      FROM processos 
      ORDER BY id DESC
    `);
    
    const processosAjustados = rows.map(p => ({
      ...p,
      data: p.dataFormatada || p.data // Retorna bonitinho pro frontend
    }));

    res.json(processosAjustados);
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
  
  // ATENÇÃO: Gera a data no formato YYYY-MM-DD aceito pelo MySQL
  const dataHoje = new Date().toISOString().split('T')[0]; 
  
  const statusInicial = status || 'Em Análise';
  const nomeRequerente = requerente || req.usuario?.nome || 'Usuário';

  try {
    const [result] = await db.query(
      'INSERT INTO processos (numero, empresa, tipo, requerente, data, status) VALUES (?, ?, ?, ?, ?, ?)',
      [numeroProtocolo, empresa, tipo, nomeRequerente, dataHoje, statusInicial]
    );

    res.status(201).json({
      mensagem: 'Processo cadastrado com sucesso!',
      id: result.insertId,
      numero: numeroProtocolo,
      empresa,
      tipo,
      requerente: nomeRequerente,
      data: new Date().toLocaleDateString('pt-BR'), // Envia formatado na resposta
      status: statusInicial
    });
  } catch (error) {
    console.error('Erro ao cadastrar processo no MySQL:', error);
    // Agora o frontend e o Postman verão o erro exato que o MySQL jogou!
    res.status(500).json({ 
      mensagem: `Erro no banco de dados: ${error.message}` 
    });
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

// Excluir processo
app.delete('/processos/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM processos WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Processo não encontrado.' });
    }

    res.json({ mensagem: 'Processo removido com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir processo:', error);
    res.status(500).json({ mensagem: 'Erro ao remover processo do banco.' });
  }
});

// Inicialização do Servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});