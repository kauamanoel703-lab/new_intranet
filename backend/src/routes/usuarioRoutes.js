const express = require('express');
const UsuarioController = require('../controllers/UsuarioController');

const router = express.Router();

router.post('/usuarios', UsuarioController.cadastrar);

module.exports = router;
