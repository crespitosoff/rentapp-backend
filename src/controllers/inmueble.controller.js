const pool = require('../services/db');
// --- NUEVO: Importamos el cliente de Supabase ---
const supabase = require('../services/supabase');

// --- OBTENER TODOS LOS INMUEBLES (Modificado) ---
const getAllInmuebles = async (req, res) => {
  try {
    // 1. Obtenemos el término de búsqueda de la URL (ej: ?q=apartamento)
    const { q } = req.query;

    // Base de la consulta (con el JOIN de fotos que ya teníamos)
    let queryText = `SELECT i.*, f.url_imagen
    FROM inmuebles i
    LEFT JOIN (SELECT DISTINCT ON (inmueble_id) inmueble_id, url_imagen FROM fotos_inmueble ORDER BY inmueble_id, foto_id) AS f ON i.inmueble_id = f.inmueble_id
    `;

    const queryParams = [];

    // 2. Si hay búsqueda, agregamos el WHERE
    if (q) {
      // Usamos ILIKE para búsqueda insensible a mayúsculas/minúsculas
      // Buscamos en título O en dirección O en ciudad (si la tienes)
      queryText += ` WHERE (i.titulo ILIKE $1 OR i.direccion ILIKE $1) `;
      queryParams.push(`%${q}%`); // Agregamos los comodines % para buscar parciales
    }

    // 3. Ordenamos: Primero los destacados, luego por fecha
    queryText += ` ORDER BY i.es_destacado DESC, i.fecha_publicacion DESC`;

    const result = await pool.query(queryText, queryParams);
    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener los inmuebles' });
  }
};

// --- OBTENER UN INMUEBLE POR ID (Modificado) ---
const getInmuebleById = async (req, res) => {
  try {
    const { id } = req.params;
    // Esta consulta obtiene el inmueble Y TODAS sus fotos
    const inmuebleQuery = 'SELECT * FROM inmuebles WHERE inmueble_id = $1';
    const fotosQuery = 'SELECT foto_id, url_imagen FROM fotos_inmueble WHERE inmueble_id = $1';

    const inmuebleResult = await pool.query(inmuebleQuery, [id]);

    if (inmuebleResult.rows.length === 0) {
      return res.status(404).json({ message: 'Inmueble no encontrado' });
    }

    const fotosResult = await pool.query(fotosQuery, [id]);

    const inmueble = inmuebleResult.rows[0];
    inmueble.fotos = fotosResult.rows; // Añadimos el array de fotos al objeto

    res.json(inmueble);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener el inmueble' });
  }
};

// --- OBTENER MIS INMUEBLES (Modificado) ---
const getMyInmuebles = async (req, res) => {
  try {
    const arrendador_id = req.user.userId;
    // Modificamos la consulta para que también traiga la primera imagen
    const query = ` SELECT i.*, f.url_imagen FROM inmuebles i LEFT JOIN ( SELECT DISTINCT ON (inmueble_id) inmueble_id, url_imagen FROM fotos_inmueble ORDER BY inmueble_id, foto_id ) AS f ON i.inmueble_id = f.inmueble_id WHERE i.arrendador_id = $1 ORDER BY i.fecha_publicacion DESC `;
    const result = await pool.query(query, [arrendador_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener mis inmuebles' });
  }
};

// --- CREAR UN NUEVO INMUEBLE (Totalmente Modificado) ---
const createInmueble = async (req, res) => {
  const client = await pool.connect(); // Para usar una transacción
  try {
    // 1. Obtenemos los datos de texto de 'req.body'
    const { titulo, descripcion, precio_mensual, direccion } = req.body;
    // 2. Obtenemos el ID del usuario del token
    const arrendador_id_seguro = req.user.userId;

    // 3. Obtenemos el archivo de 'req.file' (gracias a Multer)
    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo de imagen.' });
    }

    // 4. Subir la imagen a Supabase Storage
    const file = req.file;
    const fileName = `${arrendador_id_seguro}/${Date.now()}-${file.originalname}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('inmuebles') // El nombre de tu bucket
      .upload(fileName, file.buffer, {
        contentType: file.mimetype
      });

    if (uploadError) {
      throw uploadError;
    }

    // 5. Obtener la URL pública de la imagen subida
    const { data: publicUrlData } = supabase.storage
      .from('inmuebles')
      .getPublicUrl(fileName);

    const url_imagen = publicUrlData.publicUrl;

    // 6. Iniciar Transacción SQL
    await client.query('BEGIN');

    // 7. Insertar el inmueble en la tabla 'inmuebles'
    const inmuebleQuery = `INSERT INTO inmuebles (arrendador_id, titulo, descripcion, precio_mensual, direccion) VALUES ($1, $2, $3, $4, $5) RETURNING * `;
    const inmuebleValues = [arrendador_id_seguro, titulo, descripcion, precio_mensual, direccion];
    const inmuebleResult = await client.query(inmuebleQuery, inmuebleValues);
    const newInmueble = inmuebleResult.rows[0];

    // 8. Insertar la foto en la tabla 'fotos_inmueble'
    const fotoQuery = ` INSERT INTO fotos_inmueble (inmueble_id, url_imagen) VALUES ($1, $2) `;
    await client.query(fotoQuery, [newInmueble.inmueble_id, url_imagen]);

    // 9. Finalizar Transacción
    await client.query('COMMIT');

    // 10. Devolver el inmueble creado (ahora le añadimos la url para el frontend)
    newInmueble.url_imagen = url_imagen;
    res.status(201).json(newInmueble);

  } catch (err) {
    await client.query('ROLLBACK'); // Deshace todo si algo falló
    console.error(err);
    res.status(500).json({ message: 'Error al crear el inmueble' });
  } finally {
    client.release(); // Libera la conexión
  }
};

// --- UPDATE (sin cambios por ahora) ---
const updateInmueble = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, precio_mensual, direccion, disponible } = req.body;
    const arrendador_id_seguro = req.user.userId;

    const result = await pool.query(
      'UPDATE inmuebles SET titulo = $1, descripcion = $2, precio_mensual = $3, direccion = $4, disponible = $5 WHERE inmueble_id = $6 AND arrendador_id = $7 RETURNING *',
      [titulo, descripcion, precio_mensual, direccion, disponible, id, arrendador_id_seguro]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Inmueble no encontrado o no tienes permiso para editarlo' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar el inmueble' });
  }
};

// --- DELETE (sin cambios por ahora) ---
// (Nota: Esto no borra la imagen de Supabase Storage, es una mejora futura)
const deleteInmueble = async (req, res) => {
  try {
    const { id } = req.params;
    const arrendador_id_seguro = req.user.userId;

    // Deberíamos usar una transacción para borrar de 'fotos_inmueble' primero
    await pool.query('DELETE FROM fotos_inmueble WHERE inmueble_id = $1', [id]);
    const result = await pool.query('DELETE FROM inmuebles WHERE inmueble_id = $1 AND arrendador_id = $2', [id, arrendador_id_seguro]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Inmueble no encontrado o no tienes permiso para borrarlo' });
    }
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar el inmueble' });
  }
};

module.exports = {
  getAllInmuebles,
  getInmuebleById,
  createInmueble,
  updateInmueble,
  deleteInmueble,
  getMyInmuebles,
};