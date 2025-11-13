const pool = require('../services/db');

// --- OBTENER TODOS LOS INMUEBLES --- (Sin cambios)
const getAllInmuebles = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inmuebles');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener los inmuebles' }); // Cambiado a JSON
  }
};

// --- OBTENER UN INMUEBLE POR ID --- (Sin cambios)
const getInmuebleById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM inmuebles WHERE inmueble_id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Inmueble no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener el inmueble' }); // Cambiado a JSON
  }
};

// --- CREAR UN NUEVO INMUEBLE (¡ARREGLO DE SEGURIDAD!) ---
const createInmueble = async (req, res) => {
  try {
    // --- ARREGLO DE SEGURIDAD ---
    // NO tomamos el 'arrendador_id' del body.
    const { titulo, descripcion, precio_mensual, direccion } = req.body;

    // LO TOMAMOS DEL TOKEN, que es 100% seguro y verificado.
    // (Viene de tu payload de login: { userId: user.usuario_id, ... })
    const arrendador_id_seguro = req.user.userId;
    // --- FIN DEL ARREGLO ---

    const result = await pool.query(
      'INSERT INTO inmuebles (arrendador_id, titulo, descripcion, precio_mensual, direccion) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      // Usamos el ID seguro del token
      [arrendador_id_seguro, titulo, descripcion, precio_mensual, direccion]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear el inmueble' }); // Cambiado a JSON
  }
};

// --- UPDATE (¡CON MÁS SEGURIDAD!) ---
const updateInmueble = async (req, res) => {
  try {
    const { id } = req.params; // ID del inmueble
    const { titulo, descripcion, precio_mensual, direccion, disponible } = req.body;
    // Obtenemos el ID del propietario desde el token
    const arrendador_id_seguro = req.user.userId;

    const result = await pool.query(
      // Añadimos 'AND arrendador_id = $7'
      // Esto asegura que un propietario SOLO pueda editar SUS PROPIOS inmuebles
      'UPDATE inmuebles SET titulo = $1, descripcion = $2, precio_mensual = $3, direccion = $4, disponible = $5 WHERE inmueble_id = $6 AND arrendador_id = $7 RETURNING *',
      [titulo, descripcion, precio_mensual, direccion, disponible, id, arrendador_id_seguro]
    );

    if (result.rows.length === 0) {
      // El inmueble no se encontró O no le pertenece a este usuario
      return res.status(404).json({ message: 'Inmueble no encontrado o no tienes permiso para editarlo' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar el inmueble' }); // Cambiado a JSON
  }
};

// --- DELETE (¡CON MÁS SEGURIDAD!) ---
const deleteInmueble = async (req, res) => {
  try {
    const { id } = req.params; // ID del inmueble
    // Obtenemos el ID del propietario desde el token
    const arrendador_id_seguro = req.user.userId;

    // Añadimos 'AND arrendador_id = $2'
    // Esto asegura que un propietario SOLO pueda borrar SUS PROPIOS inmuebles
    const result = await pool.query('DELETE FROM inmuebles WHERE inmueble_id = $1 AND arrendador_id = $2', [id, arrendador_id_seguro]);

    if (result.rowCount === 0) {
      // El inmueble no se encontró O no le pertenece a este usuario
      return res.status(404).json({ message: 'Inmueble no encontrado o no tienes permiso para borrarlo' });
    }
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar el inmueble' }); // Cambiado a JSON
  }
};

module.exports = {
  getAllInmuebles,
  getInmuebleById,
  createInmueble,
  updateInmueble,
  deleteInmueble,
};