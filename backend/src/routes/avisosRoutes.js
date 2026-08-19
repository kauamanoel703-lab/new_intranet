const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Caminho correto: ../config/db

// Lista todos os avisos ordenados pelos mais recentes
router.get('/avisos', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM avisos ORDER BY data_criacao DESC');
        res.json(rows);
    } catch (err) {
        console.error("Erro ao buscar avisos:", err);
        res.status(500).json({ erro: 'Erro ao buscar avisos' });
    }
});

module.exports = router;
