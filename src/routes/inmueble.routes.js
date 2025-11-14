const { Router } = require('express');
const {
    getAllInmuebles,
    getInmuebleById,
    createInmueble,
    updateInmueble,
    deleteInmueble,
    getMyInmuebles
} = require('../controllers/inmueble.controller');

// Importamos nuestros guardias de seguridad
const authMiddleware = require('../middleware/auth.middleware');
const checkRole = require('../middleware/roleCheck');

// --- NUEVO: Configuración de Multer ---
const multer = require('multer');
// 'memoryStorage' guarda el archivo temporalmente en la RAM
// Es perfecto para pasarlo directamente a Supabase
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// --- FIN NUEVO ---

const router = Router();

// --- RUTAS PÚBLICAS ---
router.get('/inmuebles', getAllInmuebles);

// --- RUTA PROTEGIDA (Arrendador) ---
router.get(
    '/inmuebles/propios',
    authMiddleware,
    checkRole('arrendador'),
    getMyInmuebles
);

// --- RUTA PÚBLICA ---
router.get('/inmuebles/:id', getInmuebleById);

// --- RUTAS PROTEGIDAS (Solo Arrendador) ---

// 2. Ruta para crear un nuevo inmueble
router.post(
    '/inmuebles',
    authMiddleware,
    checkRole('arrendador'),
    upload.single('imagen'), // <-- NUEVO: Middleware de Multer. 'imagen' es el nombre del campo del formulario
    createInmueble
);

// 3. Ruta para actualizar un inmueble por ID
router.put(
    '/inmuebles/:id',
    authMiddleware,
    checkRole('arrendador'),
    // (Por ahora no añadimos subida de imagen al actualizar,
    // eso es una lógica más compleja para después)
    updateInmueble
);

// 4. Ruta para eliminar un inmueble por ID
router.delete(
    '/inmuebles/:id',
    authMiddleware,
    checkRole('arrendador'),
    deleteInmueble
);

module.exports = router;