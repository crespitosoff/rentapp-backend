// Importa la clase Pool desde la librería 'pg'. Pool es una forma eficiente
// de gestionar múltiples conexiones a la base de datos para que no se sature.
const { Pool } = require('pg');

// Crea una nueva instancia de Pool con los datos de conexión.
// Tu aplicación usará este 'pool' para enviar consultas a PostgreSQL.
const pool = new Pool({
  user: 'postgres.zrhcddrhgcqnhvxjavug',                  // El usuario por defecto de PostgreSQL
  host: 'aws-1-sa-east-1.pooler.supabase.com',                 // La dirección del servidor de la base de datos (tu máquina)
  database: 'postgres',            // El nombre de la base de datos que creamos
  password: 'Cr3p0s&T0m4s', // La contraseña que estableciste al instalar
  port: 6543,                        // El puerto por defecto de PostgreSQL
  // AÑADIDO: Configuración para requerir una conexión segura (SSL)
  ssl: {
    rejectUnauthorized: false
  }
});

// Exporta la instancia de 'pool' para que otros archivos de tu aplicación
// puedan usarla para interactuar con la base de datos.
module.exports = pool;