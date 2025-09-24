const express = require("express");
const cors = require("cors");
const db = require("./MySQL/db"); // Asegúrate de que la ruta sea correcta
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Para servir archivos estáticos

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

// Ruta para login de administrador
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: "Faltan datos" });
  }

  const sql = "SELECT * FROM USUARIO WHERE correo = ? AND contrasena = ? AND rol IN ('bibliotecario', 'admin')";
  
  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error("Error en la consulta:", err);
      return res.json({ success: false, message: "Error del servidor" });
    }

    if (results.length > 0) {
      const usuario = results[0];
      res.json({ 
        success: true, 
        message: "Login exitoso",
        usuario: {
          id: usuario.id_usuario,
          nombre: usuario.nombre,
          correo: usuario.correo,
          rol: usuario.rol
        }
      });
    } else {
      res.json({ success: false, message: "Credenciales incorrectas o no tiene permisos de administrador" });
    }
  });
});

// Ruta para verificar si un correo ya existe
app.post("/api/verificar-correo", (req, res) => {
  const { correo } = req.body;

  const sql = "SELECT * FROM USUARIO WHERE correo = ?";
  db.query(sql, [correo], (err, results) => {
    if (err) {
      return res.json({ existe: false, message: "Error del servidor" });
    }
    res.json({ existe: results.length > 0 });
  });
});

// Inicia servidor
app.listen(3000, () => {
  console.log("🚀 Servidor corriendo en http://localhost:3000");
});