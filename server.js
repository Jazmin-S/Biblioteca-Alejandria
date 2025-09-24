const express = require("express");
const cors = require("cors");
const db = require("./MySQL/db"); // 👈 importa tu conexión
const app = express();

app.use(cors());
app.use(express.json());

// Ruta para registrar usuario
app.post("/api/usuarios", (req, res) => {
  const { nombre, correo, contrasena, rol } = req.body;
 
  if (!nombre || !correo || !contrasena || !rol) {
    return res.json({ success: false, message: "Faltan datos" });
  }

  const sql = "INSERT INTO USUARIO (nombre, correo, contrasena, rol) VALUES (?, ?, ?, ?)";
  db.query(sql, [nombre, correo, contrasena, rol], (err, result) => {
    if (err) {
      console.error("Error al insertar:", err);
      return res.json({ success: false, message: "Error al registrar usuario" });
    }
    res.json({ success: true, message: "Usuario registrado", id: result.insertId });
  });
});

// Inicia servidor
app.listen(3000, () => {
  console.log("🚀 Servidor corriendo en http://localhost:3000");
});
