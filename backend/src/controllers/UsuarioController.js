const UsuarioModel = require('../models/UsuarioModel');
const bcrypt = require('bcrypt');

class UsuarioController {
  static async cadastrar(req, res) {
    try {
      const { nome, email, senha } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
      }

      const usuarioExistente = await UsuarioModel.buscarPorEmail(email);
      if (usuarioExistente) {
        return res.status(409).json({ erro: 'Email já cadastrado' });
      }

      const saltRounds = 10;
      const senhaHash = await bcrypt.hash(senha, saltRounds);

      const id = await UsuarioModel.criar(nome, email, senhaHash);

      res.status(201).json({ id, nome, email, mensagem: 'Usuário cadastrado com sucesso' });
    } catch (error) {
      console.error('Erro no cadastro:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }
}

module.exports = UsuarioController;
