const db = require('./db');

db.query('SELECT * FROM LIBRO', (err, results) => {
  if (err) {
    console.error(err);
  } else {
    console.log(results);
  }
  db.end(); // cerrar conexión
});
