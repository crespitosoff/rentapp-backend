// Importa la clase Pool desde la librería 'pg'. Pool es una forma eficiente
// de gestionar múltiples conexiones a la base de datos para que no se sature.
const { Pool } = require('pg');

// Crea una nueva instancia de Pool con los datos de conexión.
// Tu aplicación usará este 'pool' para enviar consultas a PostgreSQL.
const pool = new Pool({
connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Exporta la instancia de 'pool' para que otros archivos de tu aplicación
// puedan usarla para interactuar con la base de datos.
module.exports = pool;