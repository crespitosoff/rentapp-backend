// Importa la función Router de Express, que nos permite crear manejadores de rutas modulares.
const { Router } = require('express');
// Importamos el middleware que verifica el token
const authenticateToken = require('../middleware/auth.middleware');
// Importa el objeto que contiene las funciones del controlador de usuarios.
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    loginUser
} = require('../controllers/user.controller');

// Crea una nueva instancia del Router.
const router = Router();

// Ruta para login
router.post('/usuarios/login', loginUser);

// AÑADIR EL MIDDLEWARE A LA RUTA
// Ahora, para acceder a esta ruta, se necesita un token válido.
router.get('/usuarios', authenticateToken, getAllUsers);

// Define una ruta GET para el endpoint '/usuarios'.
// Cuando un usuario haga una petición GET a '/api/usuarios', se ejecutará la función 'getAllUsers'.
router.get('/usuarios', getAllUsers);

// El ':id' es un "parámetro". Express entenderá que cualquier cosa que pongas ahí
// (ej: /usuarios/1, /usuarios/25) es un valor para 'id'.
router.get('/usuarios/:id', getUserById);

// Esta ruta escucha peticiones POST.
router.post('/usuarios', createUser);

// Esta ruta escucha peticiones PUT para actualizar un usuario por su ID.
router.put('/usuarios/:id', updateUser);

// Esta ruta escucha peticiones DELETE para eliminar un usuario por su ID.
router.delete('/usuarios/:id', deleteUser);

// Exporta el router configurado para que el archivo principal (index.js) pueda usarlo.
module.exports = router;