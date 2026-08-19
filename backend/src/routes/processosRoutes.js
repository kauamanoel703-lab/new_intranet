const express = require('express');
const router = express.Router();
const ProcessoController = require('../controllers/ProcessoController');
const { autenticar } = require('../middlewares/authMiddleware');

// Todas as rotas de processos exigem autenticação JWT
router.get('/', autenticar, ProcessoController.listar);
router.post('/', autenticar, ProcessoController.cadastrar);
router.put('/:id', autenticar, ProcessoController.atualizar);
router.delete('/:id', autenticar, ProcessoController.deletar);

module.exports = router;
