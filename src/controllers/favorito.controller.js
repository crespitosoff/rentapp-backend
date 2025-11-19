// src/controllers/favorito.controller.js
const pool = require('../services/db');

// --- AÑADIR UN INMUEBLE A FAVORITOS ---
const addFavorito = async (req, res) => {
    try {
        // El ID del inmueble viene del cuerpo de la petición (o parámetros)
        const { inmueble_id } = req.body;
        // El ID del usuario viene del TOKEN (¡seguro!)
        const usuario_id = req.user.userId;

        if (!inmueble_id) {
            return res.status(400).json({ message: 'Se requiere el ID del inmueble.' });
        }

        // Usamos "ON CONFLICT" para evitar errores si el usuario
        // hace clic en "guardar" dos veces. Simplemente no hace nada.
        const query = `INSERT INTO favoritos(usuario_id, inmueble_id) VALUES ($1, $2) ON CONFLICT (usuario_id, inmueble_id) DO NOTHING RETURNING * `;

        const result = await pool.query(query, [usuario_id, inmueble_id]);

        res.status(201).json({ message: 'Inmueble guardado en favoritos', data: result.rows[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al guardar el favorito' });
    }
};

// --- ELIMINAR UN INMUEBLE DE FAVORITOS ---
const removeFavorito = async (req, res) => {
    try {
        // El ID del inmueble viene de los parámetros de la URL (ej: /favoritos/5)
        const { inmueble_id } = req.params;
        // El ID del usuario viene del TOKEN
        const usuario_id = req.user.userId;

        const result = await pool.query(
            'DELETE FROM favoritos WHERE usuario_id = $1 AND inmueble_id = $2',
            [usuario_id, inmueble_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Favorito no encontrado' });
        }

        res.status(200).json({ message: 'Favorito eliminado exitosamente' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al eliminar el favorito' });
    }
};

// --- OBTENER TODOS MIS FAVORITOS ---
const getMyFavoritos = async (req, res) => {
    try {
        const usuario_id = req.user.userId;

        // Hacemos un JOIN para obtener la *información completa* de los inmuebles
        // que el usuario ha guardado, Y AHORA TAMBIÉN LA IMAGEN.
        const query = `
            SELECT i.*, fimg.url_imagen
            FROM inmuebles i
            JOIN favoritos f ON i.inmueble_id = f.inmueble_id
            LEFT JOIN (
                SELECT DISTINCT ON (inmueble_id) inmueble_id, url_imagen
                FROM fotos_inmueble
                ORDER BY inmueble_id, foto_id 
            ) AS fimg ON i.inmueble_id = fimg.inmueble_id
            WHERE f.usuario_id = $1
        `;

        const result = await pool.query(query, [usuario_id]);

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al obtener los favoritos' });
    }
};

module.exports = {
    addFavorito,
    removeFavorito,
    getMyFavoritos
};