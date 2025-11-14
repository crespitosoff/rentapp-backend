// src/services/supabase.js
const { createClient } = require('@supabase/supabase-js');

// Obtenemos las variables de entorno
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Creamos y exportamos el cliente de Supabase
// (Usamos la clave de servicio en lugar de la anónima)
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;