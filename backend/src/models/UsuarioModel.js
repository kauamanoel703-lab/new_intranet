const db = require('../config/db');

class UsuarioModel {
  // Aceita cpf e telefone (opcionais) e usa role 'usuario' por padrão
  static async criar(nome, email, senhaHash, cpf = null, telefone = null, role = 'usuario') {
    const [result] = await db.query(
      'INSERT INTO usuarios (nome, email, senha_hash, cpf, telefone, role) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, email, senhaHash, cpf, telefone, role]
    );
    return result.insertId;
  }

  static async buscarPorEmail(email) {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    return rows[0];
  }

  static async listarTodos() {
    const [rows] = await db.query(
      'SELECT id, nome, email, cpf, telefone, role, created_at FROM usuarios ORDER BY created_at DESC'
    );
    return rows;
  }

  static async buscarPorId(id) {
    const [rows] = await db.query(
      'SELECT id, nome, email, cpf, telefone, role, created_at FROM usuarios WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async atualizar(id, nome, email, role, cpf = null, telefone = null) {
    await db.query(
      'UPDATE usuarios SET nome = ?, email = ?, role = ?, cpf = ?, telefone = ? WHERE id = ?',
      [nome, email, role, cpf, telefone, id]
    );
  }

  static async deletar(id) {
    await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
  }
}

module.exports = UsuarioModel;