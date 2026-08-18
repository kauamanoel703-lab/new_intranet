const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/UsuarioModel');

class UsuarioController {
  // POST /api/usuarios/cadastrar
  static async cadastrar(req, res) {
    try {
      const { nome, email, senha } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
      }

      // Criptografa a senha antes de enviar ao Model
      const saltRounds = 10;
      const senhaHash = await bcrypt.hash(senha, saltRounds);

      // Salva a hash gerada no banco de dados
      const idInserido = await UsuarioModel.criar(nome, email, senhaHash);
      return res.status(201).json({ mensagem: 'Usuário criado com sucesso!', id: idInserido });
    } catch (error) {
      console.error(error);
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

      // Assina o Token JWT real com dados do usuário e expiração
      const secretKey = process.env.JWT_SECRET || 'jucepe_chave_secreta_dev';
      const token = jwt.sign(
        { id: usuario.id, role: usuario.role },
        secretKey,
        { expiresIn: '8h' }
      );

      return res.json({
        mensagem: 'Login realizado com sucesso!',
        token,
        usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: 'Erro interno ao realizar login' });
    }
  }

  // GET /api/usuarios/listar
  static async listar(req, res) {
    try {
      const usuarios = await UsuarioModel.listarTodos();
      return res.json(usuarios);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: 'Erro ao listar usuários' });
    }
  }

  // PUT /api/usuarios/atualizar/:id
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, email, role } = req.body;
      await UsuarioModel.atualizar(id, nome, email, role);
      return res.json({ mensagem: 'Usuário atualizado com sucesso!' });
    } catch (error) {
      console.error(error);
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
      console.error(error);
      return res.status(500).json({ erro: 'Erro ao deletar usuário' });
    }
  }
}

module.exports = UsuarioController;