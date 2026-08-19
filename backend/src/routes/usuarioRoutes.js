const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');
const { autenticar } = require('../middlewares/authMiddleware');

// Rotas públicas (Cadastro e Login)
router.post('/cadastrar', UsuarioController.cadastrar);
router.post('/login', UsuarioController.login);

// Rotas protegidas (exigem token JWT válido)
router.get('/listar', autenticar, UsuarioController.listar);
router.put('/atualizar/:id', autenticar, UsuarioController.atualizar);
router.delete('/deletar/:id', autenticar, UsuarioController.deletar);

module.exports = router;