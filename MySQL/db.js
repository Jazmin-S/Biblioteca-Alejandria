const mysql = require('mysql2');

// Crear conexión
const connection = mysql.createConnection({
  host: 'localhost',      // usualmente localhost
  user: 'root',           // tu usuario de MySQL
  password: '123456', // tu contraseña de MySQL
  database: 'biblioteca'  // nombre de tu base de datos
});
// Conectar
connection.connect((err) => {
  if (err) {
    console.error('Error de conexión: ' + err.stack);
    return;
  }
  console.log('Conectado a la base de datos con id ' + connection.threadId);
});

module.exports = connection;
