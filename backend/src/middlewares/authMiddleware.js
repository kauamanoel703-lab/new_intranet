const jwt = require('jsonwebtoken');

/**
 * Middleware para autenticação via Token JWT.
 * Verifica a validade do token enviado no header Authorization: Bearer <token>
 */
const autenticar = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // Anexa os dados do usuário decodificados (id, role, email, nome)
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        erro: 'Sessão expirada. Por favor, faça login novamente.',
        tokenExpirado: true
      });
    }
    return res.status(403).json({ erro: 'Token inválido' });
  }
};

/**
 * Middleware de Autorização baseado em Perfis (RBAC).
 * Verifica se a role do usuário autenticado tem permissão para acessar a rota.
 * @param  {...string} rolesPermitidas Ex: 'admin', 'gestor', 'usuario'
 */
const autorizarRoles = (...rolesPermitidas) => {
  return (req, res, next) => {
    if (!req.usuario || !req.usuario.role) {
      return res.status(403).json({ erro: 'Acesso negado: Perfil do usuário não identificado.' });
    }

    if (!rolesPermitidas.includes(req.usuario.role)) {
      return res.status(403).json({
        erro: `Acesso negado: Perfil '${req.usuario.role}' não possui permissão para esta ação.`
      });
    }

    next();
  };
};

module.exports = { autenticar, autorizarRoles };
