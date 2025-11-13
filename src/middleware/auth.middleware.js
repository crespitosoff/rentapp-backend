const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    // CAMBIO: Enviar JSON para que el frontend no se rompa
    return res.status(401).json({ message: 'Acceso denegado. No se proveyó token.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // CAMBIO: Enviar JSON
      return res.status(403).json({ message: 'Token no válido o expirado.' });
    }

    // ¡Tu variable es 'req.user'! Esto es lo correcto.
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;