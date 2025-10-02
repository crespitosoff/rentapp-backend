const { Router } = require('express');
const {
    getAllInmuebles,
    getInmuebleById,
    createInmueble,
    updateInmueble,
    deleteInmueble
} = require('../controllers/inmueble.controller');

// Importamos el objeto que contiene las funciones del controlador de usuarios.
const router = Router();

// Ruta para obtener todos los inmuebles
router.get('/inmuebles', getAllInmuebles);

// Ruta para obtener un inmueble por ID
router.get('/inmuebles/:id', getInmuebleById);

// Ruta para crear un nuevo inmueble
router.post('/inmuebles', createInmueble);

// Ruta para actualizar un inmueble por ID
router.put('/inmuebles/:id', updateInmueble);

// Ruta para eliminar un inmueble por ID
router.delete('/inmuebles/:id', deleteInmueble);

module.exports = router;