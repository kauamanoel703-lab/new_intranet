const db = require('../config/db');

class UsuarioModel {
  static async criar(nome, email, senhaHash) {
    const [result] = await db.query(
      'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)',
      [nome, email, senhaHash]
    );
    return result.insertId;
  }

  static async buscarPorEmail(email) {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    return rows[0];
  }

  static async listarTodos() {
    const [rows] = await db.query(
      'SELECT id, nome, email, role, created_at FROM usuarios ORDER BY created_at DESC'
    );
    return rows;
  }

  static async buscarPorId(id) {
    const [rows] = await db.query(
      'SELECT id, nome, email, role, created_at FROM usuarios WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async atualizar(id, nome, email, role) {
    await db.query(
      'UPDATE usuarios SET nome = ?, email = ?, role = ? WHERE id = ?',
      [nome, email, role, id]
    );
  }

  static async deletar(id) {
    await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
  }
}

module.exports = UsuarioModel;