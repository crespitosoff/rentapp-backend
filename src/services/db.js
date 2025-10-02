// Importa la clase Pool desde la librería 'pg'. Pool es una forma eficiente
// de gestionar múltiples conexiones a la base de datos para que no se sature.
const { Pool } = require('pg');

// Crea una nueva instancia de Pool con los datos de conexión.
// Tu aplicación usará este 'pool' para enviar consultas a PostgreSQL.
const pool = new Pool({
  user: 'postgres',                  // El usuario por defecto de PostgreSQL
  host: 'localhost',                 // La dirección del servidor de la base de datos (tu máquina)
  database: 'rentapp_db',            // El nombre de la base de datos que creamos
  password: 'Cr3sp0s', // La contraseña que estableciste al instalar
  port: 5432,                        // El puerto por defecto de PostgreSQL
});

// Exporta la instancia de 'pool' para que otros archivos de tu aplicación
// puedan usarla para interactuar con la base de datos.
module.exports = po
ol;