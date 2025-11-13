const checkRole = (allowedRole) => {
    return (req, res, next) => {

        // --- ¡AQUÍ ESTÁ EL ARREGLO! ---
        // Buscamos en 'req.user' (como lo define tu authMiddleware)
        if (!req.user) {
            return res.status(500).json({ message: 'Error de autenticación. Faltan datos del usuario.' });
        }

        // --- ¡Y AQUÍ! ---
        // Comparamos el rol del TOKEN (req.user.rol)
        if (req.user.rol !== allowedRole) {
            return res.status(403).json({ message: 'Acceso Prohibido: No tienes los permisos necesarios.' });
        }
        // --- FIN DEL ARREGLO ---

        // Si coincide, ¡adelante!
        next();
    };
};

module.exports = checkRole;