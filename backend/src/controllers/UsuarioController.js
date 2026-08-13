const UsuarioModel = require('../models/UsuarioModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class UsuarioController {

  // ─── CADASTRO (já existia) ───────────────────────────────────────────
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

      const senhaHash = await bcrypt.hash(senha, 10);
      const id = await UsuarioModel.criar(nome, email, senhaHash);

      res.status(201).json({ id, nome, email, mensagem: 'Usuário cadastrado com sucesso' });
    } catch (error) {
      console.error('Erro no cadastro:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  // ─── LOGIN (novo) ────────────────────────────────────────────────────
  static async login(req, res) {
    try {
      const { email, senha } = req.body;

      // 1. Valida se os campos vieram
      if (!email || !senha) {
        return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
      }

      // 2. Busca o usuário no banco
      const usuario = await UsuarioModel.buscarPorEmail(email);
      if (!usuario) {
        // Mensagem genérica por segurança (não revela se o email existe)
        return res.status(401).json({ erro: 'Credenciais inválidas' });
      }

      // 3. Compara a senha digitada com o hash salvo no banco
      const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
      if (!senhaValida) {
        return res.status(401).json({ erro: 'Credenciais inválidas' });
      }

      // 4. Gera o token JWT (válido por 8 horas)
      const token = jwt.sign(
        { id: usuario.id, email: usuario.email, role: usuario.role },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      // 5. Retorna o token e dados básicos do usuário
      res.json({
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          role: usuario.role
        }
      });

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }
}

module.exports = UsuarioController;