/**
 * Crea un middleware que verifica si el rol del usuario (del token)
 * coincide con el rol permitido.
 * @param {string} allowedRole - El rol que se permite ('arrendador', 'arrendatario')
 */
const checkRole = (allowedRole) => {

  // Esta es la función de middleware real que usará Express
  return (req, res, next) => {

    // Asumimos que authMiddleware ya corrió y puso 'req.usuario'
    if (!req.usuario) {
      return res.status(500).send('Error de autenticación. Faltan datos del usuario.');
    }

    // ¡LA VERIFICACIÓN REAL!
    // Comparamos el rol del TOKEN (req.usuario.rol) con el rol que requiere esta ruta
    if (req.usuario.rol !== allowedRole) {
      // Si no coincide, ¡acceso prohibido!
      return res.status(403).send('Acceso Prohibido: No tienes los permisos necesarios.');
    }

    // Si coincide, ¡adelante! Pasa al siguiente middleware o al controlador
    next();
  };
};

module.exports = checkRole;