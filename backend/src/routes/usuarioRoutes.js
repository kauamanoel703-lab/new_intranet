const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');

// Rotas públicas (Cadastro e Login)
router.post('/cadastrar', UsuarioController.cadastrar);
router.post('/login', UsuarioController.login);

// Rotas protegidas (serão usadas com o token JWT)
router.get('/listar', UsuarioController.listar);
router.put('/atualizar/:id', UsuarioController.atualizar);
router.delete('/deletar/:id', UsuarioController.deletar);

module.exports = router;