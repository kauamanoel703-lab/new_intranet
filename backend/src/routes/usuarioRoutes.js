const express = require('express');
const UsuarioController = require('../controllers/UsuarioController');
const { autenticar } = require('../middlewares/authMiddleware');

const router = express.Router();

// Rotas públicas (não precisam de token)
router.post('/usuarios', UsuarioController.cadastrar);
router.post('/auth/login', UsuarioController.login);

// Exemplo de rota protegida (só entra com token válido)
router.get('/usuarios/me', autenticar, (req, res) => {
  res.json({ mensagem: 'Rota protegida!', usuario: req.usuario });
});

module.exports = router;