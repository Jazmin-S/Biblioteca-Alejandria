// routes/info.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../MySQL/db");

const router = express.Router();

// ==========================
// 📸 Configuración de multer
// ==========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "Images"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `user_${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

// ==========================
// 📤 Subir foto del usuario
// ==========================
router.post("/upload-foto/:id", upload.single("foto"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se recibió ninguna imagen" });
  }

  const imagePath = `/Images/${req.file.filename}`;
  const userId = req.params.id;

  const sql = "UPDATE usuario SET foto = ? WHERE id_usuario = ?";

  db.query(sql, [imagePath, userId], (err) => {
    if (err) {
      console.error("❌ Error al subir la imagen:", err);
      return res.status(500).json({ error: "Error al guardar la imagen en la base de datos" });
    }

    console.log(`✅ Imagen guardada: ${imagePath}`);
    res.json({ mensaje: "Imagen subida correctamente", path: imagePath });
  });
});

// ==========================
// 📋 Obtener información del usuario
// ==========================
router.get("/informacion/:id", (req, res) => {
  const sql = `
    SELECT 
      nombre, 
      correo, 
      rol, 
      num_prestamos, 
      foto,
      descripcion,
      deudaTotal
    FROM usuario 
    WHERE id_usuario = ?
  `;

  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      console.error("❌ Error al obtener información del usuario:", err);
      return res.status(500).json({ error: "Error al obtener información del usuario" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(results[0]);
  });
});

// ==========================
// ✏️ Guardar descripción personal (CORREGIDO)
// ==========================
router.put("/descripcion/:id", (req, res) => {
  const { id } = req.params;
  const { descripcion } = req.body;

  console.log(`📝 Guardando descripción para usuario ${id}:`, descripcion);

  // Permitir descripción vacía
  if (descripcion === undefined || descripcion === null) {
    return res.status(400).json({ error: "La descripción no puede ser nula" });
  }

  const descripcionTrimmed = descripcion ? descripcion.trim() : '';

  const sql = "UPDATE usuario SET descripcion = ? WHERE id_usuario = ?";
  
  console.log(`🔍 Ejecutando SQL: ${sql} con valores: [${descripcionTrimmed}, ${id}]`);

  db.query(sql, [descripcionTrimmed, id], (err, result) => {
    if (err) {
      console.error("❌ Error en la consulta SQL:", err);
      return res.status(500).json({ error: "Error en la base de datos al guardar la descripción" });
    }

    console.log(`✅ Descripción actualizada para usuario ${id}. Filas afectadas:`, result.affectedRows);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ 
      mensaje: "Descripción actualizada correctamente",
      affectedRows: result.affectedRows 
    });
  });
});

// ==========================
// 🔍 Ruta de prueba
// ==========================
router.get("/test", (req, res) => {
  res.json({ mensaje: "Ruta info funcionando correctamente" });
});

module.exports = router;