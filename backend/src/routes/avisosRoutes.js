const express = require('express');
const router = express.Router();
const db = require('../db'); // Ajuste o caminho '../db' caso o arquivo db.js esteja em outra pasta

// Rota para listar todos os avisos ordenados pelos mais recentes
router.get('/avisos', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM avisos ORDER BY data_criacao DESC');
        res.json(rows);
    } catch (err) {
        console.error("Erro ao buscar avisos:", err);
        res.status(500).json({ erro: 'Erro ao buscar avisos' });
    }
});

module.exports = router;
