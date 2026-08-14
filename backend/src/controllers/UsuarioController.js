const UsuarioModel = require('../models/UsuarioModel');

class UsuarioController {
  // POST /api/usuarios/cadastrar
  static async cadastrar(req, res) {
    try {
      const { nome, email, senha } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
      }

      // Em produção usaremos bcrypt para hash, por enquanto simulamos
      const idInserido = await UsuarioModel.criar(nome, email, senha);
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

      // Comparação simples (trocaremos para bcrypt depois)
      if (usuario.senha_hash !== senha) {
        return res.status(401).json({ erro: 'Credenciais inválidas' });
      }

      return res.json({
        mensagem: 'Login realizado!',
        token: 'token_de_teste_123', // Simulando JWT
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