// src/routes/favorito.routes.js
const { Router } = require('express');
const router = Router();

const {
    addFavorito,
    removeFavorito,
    getMyFavoritos
} = require('../controllers/favorito.controller');

// Importamos nuestros guardias (usando los nombres de tus archivos)
const authMiddleware = require('../middleware/auth.middleware');
const checkRole = require('../middleware/roleCheck');

// --- RUTAS DE FAVORITOS (SOLO ARRENDATARIO) ---

// Obtener la lista de todos mis inmuebles favoritos
router.get(
    '/favoritos',
    authMiddleware,
    checkRole('arrendatario'),
    getMyFavoritos
);

// Añadir un nuevo inmueble a favoritos
router.post(
    '/favoritos',
    authMiddleware,
    checkRole('arrendatario'),
    addFavorito
);

// Eliminar un inmueble de favoritos
router.delete(
    '/favoritos/:inmueble_id',
    authMiddleware,
    checkRole('arrendatario'),
    removeFavorito
);

module.exports = router;