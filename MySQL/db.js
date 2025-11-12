const mysql = require('mysql2');

// Crear conexión a la base de datos
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',  // tu contraseña real de MySQL
  database: 'biblioteca',
  charset: 'utf8mb4'
});

// Conectar
connection.connect((err) => {
  if (err) {
    console.error('❌ Error de conexión: ' + err.stack);
    return;
  }
  console.log('✅ Conectado a la base de datos con id ' + connection.threadId);
});

module.exports = connection;
