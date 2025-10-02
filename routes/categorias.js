// routes/categorias.js
const express = require("express");
const router = express.Router();
const db = require("../MySQL/db");
const path = require("path");
const multer = require("multer");

// === Configuración de multer para manejar portadas ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../images/portadas"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// === LISTAR TODAS LAS CATEGORÍAS ===
router.get("/categorias", (req, res) => {
  db.query("SELECT * FROM CATEGORIA ORDER BY nombre", (err, results) => {
    if (err) {
      console.error("❌ Error al obtener categorías:", err);
      return res.status(500).json({ error: "Error en la base de datos" });
    }
    res.json(results);
  });
});

// === AGREGAR UNA CATEGORÍA ===
router.post("/categorias", upload.single("portada"), (req, res) => {
  const { nombre } = req.body;
  const portada = req.file ? "/images/portadas/" + req.file.filename : null;

  if (!nombre) {
    return res.status(400).json({ error: "El nombre de la categoría es obligatorio" });
  }

  db.query(
    "INSERT INTO CATEGORIA (nombre, portada) VALUES (?, ?)",
    [nombre, portada],
    (err, result) => {
      if (err) {
        console.error("❌ Error al agregar categoría:", err);
        return res.status(500).json({ error: "Error en la base de datos" });
      }
      res.status(201).json({ success: true, id_categoria: result.insertId });
    }
  );
});

// === EDITAR UNA CATEGORÍA ===
router.put("/categorias/:id", upload.single("portada"), (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  const portada = req.file ? "/images/portadas/" + req.file.filename : null;

  if (!nombre) {
    return res.status(400).json({ error: "El nombre no puede estar vacío" });
  }

  db.query(
    "UPDATE CATEGORIA SET nombre = ?, portada = COALESCE(?, portada) WHERE id_categoria = ?",
    [nombre, portada, id],
    (err, result) => {
      if (err) {
        console.error("❌ Error al editar categoría:", err);
        return res.status(500).json({ error: "Error en la base de datos" });
      }
      res.json({ success: true, mensaje: "✏️ Categoría actualizada correctamente" });
    }
  );
});

// === ELIMINAR UNA CATEGORÍA ===
router.delete("/categorias/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM CATEGORIA WHERE id_categoria = ?", [id], (err, result) => {
    if (err) {
      console.error("❌ Error al eliminar categoría:", err);
      return res.status(500).json({ error: "Error en la base de datos" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }
    res.json({ success: true, mensaje: "🗑️ Categoría eliminada correctamente" });
  });
});

module.exports = router;
