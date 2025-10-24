require('dotenv').config(); // Carga las variables de .env en process.env

// Importa la librería Express.
const express = require('express');
// Importa el archivo de rutas de usuario que acabamos de crear.
const userRoutes = require('./src/routes/user.routes');
// Importa el archivo de rutas de inmuebles que acabamos de crear.
const inmuebleRoutes = require('./src/routes/inmueble.routes');
// Importa el middleware 'cors' para permitir peticiones de CORS.
const cors = require('cors');

// Crea la aplicación principal de Express.
const app = express();
// Define el puerto en el que correrá el servidor.
const port = 3000;

// Middleware para que Express entienda JSON.
app.use(express.json());
// Middleware para permitir peticiones de CORS.
app.use(cors());

// ----- RUTAS -----
// Define una ruta GET para la raíz ('/') del servidor.
app.get('/', (req, res) => {
  res.send('API de RentApp funcionando!');
});

// Le dice a la aplicación que use las rutas definidas en 'userRoutes'.
// El '/api' es un prefijo, por lo que todas las rutas de usuarios
// comenzarán con '/api'. Por ejemplo: '/api/usuarios'.
app.use('/api', userRoutes);
app.use('/api', inmuebleRoutes);

// ----- INICIAR SERVIDOR -----
// Pone al servidor a escuchar peticiones en el puerto definido.
app.listen(port, () => {
  console.log(`Servidor de RentApp corriendo en http://localhost:${port}`);
});