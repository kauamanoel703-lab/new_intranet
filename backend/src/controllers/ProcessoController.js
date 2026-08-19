const db = require('../config/db');

class ProcessoController {
  // GET /api/processos
  static async listar(req, res) {
    try {
      const [processos] = await db.query('SELECT * FROM processos ORDER BY id DESC');
      res.json(processos);
    } catch (error) {
      console.error('❌ ERRO AO LISTAR PROCESSOS:', error);
      res.status(500).json({ mensagem: 'Erro ao listar processos.' });
    }
  }

  // POST /api/processos
  static async cadastrar(req, res) {
    const { numero_processo, requerente, tipo, status, descricao } = req.body;

    if (!numero_processo || !requerente || !tipo) {
      return res.status(400).json({ mensagem: 'Campos obrigatórios do processo ausentes.' });
    }

    try {
      const [result] = await db.query(
        'INSERT INTO processos (numero_processo, requerente, tipo, status, descricao) VALUES (?, ?, ?, ?, ?)',
        [numero_processo, requerente, tipo, status || 'Em Andamento', descricao || '']
      );

      res.status(201).json({ mensagem: 'Processo cadastrado com sucesso!', id: result.insertId });
    } catch (error) {
      console.error('❌ ERRO AO CADASTRAR PROCESSO:', error);
      res.status(500).json({ mensagem: 'Erro ao cadastrar processo.' });
    }
  }

  // PUT /api/processos/:id
  static async atualizar(req, res) {
    const { id } = req.params;
    const { numero_processo, requerente, tipo, status, descricao } = req.body;

    try {
      await db.query(
        'UPDATE processos SET numero_processo = ?, requerente = ?, tipo = ?, status = ?, descricao = ? WHERE id = ?',
        [numero_processo, requerente, tipo, status, descricao, id]
      );

      res.json({ mensagem: 'Processo atualizado com sucesso!' });
    } catch (error) {
      console.error('❌ ERRO AO ATUALIZAR PROCESSO:', error);
      res.status(500).json({ mensagem: 'Erro ao atualizar processo.' });
    }
  }

  // DELETE /api/processos/:id
  static async deletar(req, res) {
    const { id } = req.params;
    try {
      await db.query('DELETE FROM processos WHERE id = ?', [id]);
      res.json({ mensagem: 'Processo deletado com sucesso!' });
    } catch (error) {
      console.error('❌ ERRO AO DELETAR PROCESSO:', error);
      res.status(500).json({ mensagem: 'Erro ao deletar processo.' });
    }
  }
}

module.exports = ProcessoController;
