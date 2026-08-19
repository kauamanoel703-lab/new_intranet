const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/UsuarioModel');

class UsuarioController {
  // POST /api/usuarios/cadastrar
  static async cadastrar(req, res) {
    try {
      const { nome, email, senha, cpf, telefone, role } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
      }

      // Verifica se e-mail já existe
      const existente = await UsuarioModel.buscarPorEmail(email);
      if (existente) {
        return res.status(400).json({ erro: 'Este e-mail já está cadastrado.' });
      }

      // Criptografa a senha antes de enviar ao Model
      const saltRounds = 10;
      const senhaHash = await bcrypt.hash(senha, saltRounds);

      // Salva a hash gerada no banco de dados (role padrão = 'usuario')
      const idInserido = await UsuarioModel.criar(
        nome, email, senhaHash,
        cpf || null,
        telefone || null,
        role || 'usuario'
      );

      console.log(`✅ [CADASTRO] Usuário "${nome}" (ID: ${idInserido}) cadastrado.`);
      return res.status(201).json({ mensagem: 'Usuário criado com sucesso!', id: idInserido });
    } catch (error) {
      console.error('❌ ERRO NO CADASTRO:', error);
      return res.status(500).json({ erro: 'Erro interno ao cadastrar usuário' });
    }
  }

  // POST /api/usuarios/login
  static async login(req, res) {
    try {
      const { email, senha } = req.body;
      const usuario = await UsuarioModel.buscarPorEmail(email);

      if (!usuario) {
        return res.status(401).json({ erro: 'Credenciais inválidas' });
      }

      // Compara a senha informada com o hash armazenado
      const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
      if (!senhaCorreta) {
        return res.status(401).json({ erro: 'Credenciais inválidas' });
      }

      // Assina o Token JWT com dados do usuário e expiração
      // Usa o JWT_SECRET do .env (carregado via dotenv.config() no server.js)
      const token = jwt.sign(
        { id: usuario.id, role: usuario.role, email: usuario.email, nome: usuario.nome },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      console.log(`🔑 [LOGIN] Usuário "${usuario.nome}" autenticado.`);
      return res.json({
        mensagem: 'Login realizado com sucesso!',
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          cpf: usuario.cpf,
          telefone: usuario.telefone,
          role: usuario.role
        }
      });
    } catch (error) {
      console.error('❌ ERRO NO LOGIN:', error);
      return res.status(500).json({ erro: 'Erro interno ao realizar login' });
    }
  }

  // GET /api/usuarios/listar
  static async listar(req, res) {
    try {
      const usuarios = await UsuarioModel.listarTodos();
      return res.json(usuarios);
    } catch (error) {
      console.error('❌ ERRO AO LISTAR USUÁRIOS:', error);
      return res.status(500).json({ erro: 'Erro ao listar usuários' });
    }
  }

  // PUT /api/usuarios/atualizar/:id
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, email, role, cpf, telefone } = req.body;
      await UsuarioModel.atualizar(id, nome, email, role, cpf, telefone);
      return res.json({ mensagem: 'Usuário atualizado com sucesso!' });
    } catch (error) {
      console.error('❌ ERRO AO ATUALIZAR USUÁRIO:', error);
      return res.status(500).json({ erro: 'Erro ao atualizar usuário' });
    }
  }

  // DELETE /api/usuarios/deletar/:id
  static async deletar(req, res) {
    try {
      const { id } = req.params;
      await UsuarioModel.deletar(id);
      return res.json({ mensagem: 'Usuário removido com sucesso!' });
    } catch (error) {
      console.error('❌ ERRO AO DELETAR USUÁRIO:', error);
      return res.status(500).json({ erro: 'Erro ao deletar usuário' });
    }
  }
}

module.exports = UsuarioController;