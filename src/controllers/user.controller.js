// Importa el 'pool' de conexión que configuramos en db.js.
const pool = require('../services/db');
// Importamos el módulo 'bcrypt' para cifrar las contraseñas, o sea, encriptar
// las contraseñas antes de almacenarlas en la base de datos.
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Define una función asíncrona para obtener todos los usuarios.
// 'async' permite usar 'await', que pausa la función hasta que la base de datos
// responda.
// 'req' (request) contiene la información de la petición del usuario.
// 'res' (response) es lo que usaremos para enviar una respuesta de vuelta al usuario.
const getAllUsers = async (req, res) => {
    // 'try...catch' es para manejar errores. Si algo falla en el 'try',
    // el código dentro del 'catch' se ejecutará.
    try {
        // Usa el pool para enviar una consulta SQL a la base de datos.
        // 'await' espera a que la consulta termine antes de continuar.
        const result = await pool.query('SELECT * FROM usuarios');

        // Si la consulta es exitosa, envía los resultados (result.rows) de vuelta
        // al usuario en formato JSON.
        res.json(result.rows);
    } catch (err) {
        // Si hay un error, lo muestra en la consola del servidor.
        console.error(err);
        // Y envía un mensaje de error genérico al usuario.
        res.status(500).send('Error al obtener los usuarios');
    }
};

// Obtiene un solo usuario basado en el ID proporcionado en la URL.
const getUserById = async (req, res) => {
    try {
        // 'req.params' contiene los parámetros de la ruta. 'id' es el nombre que le daremos en el archivo de rutas.
        const { id } = req.params;

        // Ejecuta una consulta SQL para seleccionar solo el usuario con el ID correspondiente.
        // Usamos '$1' para pasar el 'id' de forma segura. Esto previene ataques de inyección SQL.
        const result = await pool.query('SELECT * FROM usuarios WHERE usuario_id = $1', [id]);

        // Si no se encuentra ningún usuario (el resultado tiene 0 filas), devuelve un error 404.
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Si se encuentra, devuelve el primer (y único) resultado.
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener el usuario');
    }
};

const createUser = async (req, res) => {
    try {
        // Obtenemos los datos del nuevo usuario del "cuerpo" (body) de la petición.
        const { primer_nombre, primer_apellido, email, password, rol } = req.body;

        // 1. Hashear la contraseña
        // El '10' es el "costo" o "salt rounds", un factor de complejidad. 10 es un buen estándar.
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. Ejecutar la consulta SQL con la contraseña ya hasheada
        const result = await pool.query(
            'INSERT INTO usuarios (primer_nombre, primer_apellido, email, password_hash, rol) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [primer_nombre, primer_apellido, email, hashedPassword, rol] // <-- Usamos la contraseña hasheada
        );

        // No queremos devolver el hash de la contraseña en la respuesta por seguridad
        const newUser = result.rows[0];
        delete newUser.password_hash;
        // Respondemos con un código 201 (Created) y los datos del nuevo usuario.
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al crear el usuario');
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params; // Obtenemos el ID del usuario a actualizar
        const { primer_nombre, primer_apellido, email, rol } = req.body; // Obtenemos los nuevos datos menos el "password_hash" por una razón clave: seguridad y separación de lógica.

        // Ejecutamos la consulta SQL para actualizar el usuario.
        // SET actualiza las columnas con los nuevos valores ($1, $2, etc.).
        // WHERE especifica QUÉ usuario actualizar.
        const result = await pool.query(
            'UPDATE usuarios SET primer_nombre = $1, primer_apellido = $2, email = $3, rol = $4 WHERE usuario_id = $5 RETURNING *',
            [primer_nombre, primer_apellido, email, rol, id]
        );

        // Si la consulta no devuelve ninguna fila, significa que el usuario no existía.
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Devolvemos los datos del usuario ya actualizado.
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al actualizar el usuario');
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params; // Obtenemos el ID del usuario a eliminar.

        // Ejecutamos la consulta DELETE.
        // WHERE es crucial para no borrar toda la tabla.
        const result = await pool.query('DELETE FROM usuarios WHERE usuario_id = $1', [id]);

        // La propiedad 'rowCount' nos dice cuántas filas fueron afectadas.
        // Si es 0, el usuario no existía.
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Si la eliminación es exitosa, no hay contenido que devolver.
        // El código 204 (No Content) es el estándar para esto.
        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al eliminar el usuario');
    }
};

// --- NUEVA FUNCIÓN DE LOGIN ---
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Buscar al usuario por su email
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: "Credenciales inválidas" });
        }
        const user = result.rows[0];

        // 2. Comparar la contraseña enviada con el hash guardado
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: "Credenciales inválidas" });
        }

        if (passwordMatch) {
            // 3. Si la contraseña es correcta, crear un Token (JWT)
            const payload = {
                userId: user.usuario_id,
                rol: user.rol // <-- ¡YA TENÍAMOS EL ROL EN EL TOKEN! Perfecto.
            };

            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET, // <-- Usando la variable de entorno (¡excelente!)
                { expiresIn: '1h' }
            );

            // 4. Enviar el token Y EL ROL al cliente
            res.json({
                token: token,
                rol: user.rol, // <-- AÑADE ESTA LÍNEA
                nombre: user.primer_nombre // <-- (Opcional, pero útil para un "Hola, Crespo")
            });

        } else {
            // ... (tu manejo de error de contraseña)
        }

        // 3. Si la contraseña es correcta, crear un Token (JWT)
        const token = jwt.sign(
            { userId: user.usuario_id, rol: user.rol }, // 'payload' - ¿Qué datos guardamos en el token?
            process.env.JWT_SECRET, // 'secret' - Una clave secreta para firmar el token
            { expiresIn: '1h' } // 'options' - El token expirará en 1 hora
        );

        // 4. Enviar el token de vuelta al usuario
        res.json({ token, message: "Inicio de sesión exitoso" });

    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
};

// Exporta las funciones para que puedan ser usadas en el archivo de rutas.
module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    loginUser,
};