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
}

module.exports = UsuarioModel;
