const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // Busca el token en el header 'Authorization'
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

  if (token == null) {
    return res.sendStatus(401); // No autorizado (no hay token)
  }

  // Verifica el token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Prohibido (el token no es válido)
    }

    // Si el token es válido, guarda los datos del usuario en la petición
    // y permite que continúe hacia la ruta.
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;