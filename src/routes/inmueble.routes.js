const { Router } = require('express');
const {
    getAllInmuebles,
    getInmuebleById,
    createInmueble,
    updateInmueble,
    deleteInmueble
} = require('../controllers/inmueble.controller');

// 1. Importamos nuestros guardias de seguridad
const authMiddleware = require('../middleware/auth.middleware');
const checkRole = require('../middleware/roleCheck');

const router = Router();

// --- RUTAS PÚBLICAS ---
// Cualquiera puede ver los inmuebles
router.get('/inmuebles', getAllInmuebles);
router.get('/inmuebles/:id', getInmuebleById);


// --- RUTAS PROTEGIDAS (Solo Arrendador) ---

// 2. Ruta para crear un nuevo inmueble
// Solo usuarios conectados (authMiddleware) Y que sean 'arrendador' (checkRole)
router.post(
    '/inmuebles',
    authMiddleware,
    checkRole('arrendador'),
    createInmueble
);

// 3. Ruta para actualizar un inmueble por ID
// Solo usuarios conectados Y que sean 'arrendador'
router.put(
    '/inmuebles/:id',
    authMiddleware,
    checkRole('arrendador'),
    updateInmueble
);

// 4. Ruta para eliminar un inmueble por ID
// Solo usuarios conectados Y que sean 'arrendador'
router.delete(
    '/inmuebles/:id',
    authMiddleware,
    checkRole('arrendador'),
    deleteInmueble
);

module.exports = router;