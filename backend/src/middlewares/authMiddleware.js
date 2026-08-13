const jwt = require('jsonwebtoken');

// Esse middleware funciona como um "segurança na porta":
// ele verifica o crachá (token) antes de deixar entrar na rota.
const autenticar = (req, res, next) => {
  // O token vem no header assim: "Authorization: Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  try {
    // Verifica e decodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // Anexa os dados do usuário na requisição
    next();               // Libera para a rota seguinte
  } catch (error) {
    return res.status(403).json({ erro: 'Token inválido ou expirado' });
  }
};

module.exports = { autenticar };