const pool = require('../services/db');

// --- OBTENER TODOS LOS INMUEBLES ---
const getAllInmuebles = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inmuebles');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener los inmuebles');
  }
};

// --- OBTENER UN INMUEBLE POR ID ---
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
    res.status(500).send('Error al obtener el inmueble');
  }
};

// --- CREAR UN NUEVO INMUEBLE ---
const createInmueble = async (req, res) => {
  try {
    // Obtenemos los datos del cuerpo de la petición.
    // ¡Es crucial incluir el 'arrendador_id' para saber a quién pertenece!
    const { arrendador_id, titulo, descripcion, precio_mensual, direccion } = req.body;

    const result = await pool.query(
      'INSERT INTO inmuebles (arrendador_id, titulo, descripcion, precio_mensual, direccion) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [arrendador_id, titulo, descripcion, precio_mensual, direccion]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al crear el inmueble');
  }
};

// --- UPDATE ---
const updateInmueble = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, precio_mensual, direccion, disponible } = req.body;
    
    const result = await pool.query(
      'UPDATE inmuebles SET titulo = $1, descripcion = $2, precio_mensual = $3, direccion = $4, disponible = $5 WHERE inmueble_id = $6 RETURNING *',
      [titulo, descripcion, precio_mensual, direccion, disponible, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Inmueble no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar el inmueble');
  }
};

// --- DELETE ---
const deleteInmueble = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM inmuebles WHERE inmueble_id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Inmueble no encontrado' });
    }
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar el inmueble');
  }
};


// Exportamos las nuevas funciones
module.exports = {
  getAllInmuebles,
  getInmuebleById,
  createInmueble,
  updateInmueble,
  deleteInmueble,
};