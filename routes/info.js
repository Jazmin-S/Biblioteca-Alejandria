// routes/info.js
const express = require("express");
const multer = require("multer");
const path = require("path");

const infoController = require("../controllers/informacionController");
const router = express.Router();

// CONFIGURAR MULTER PARA FOTO
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../Images"));
  },
  filename: (req, file, cb) => {
    cb(null, `user_${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// =============================
// RUTAS DEL PERFIL
// =============================

// Obtener TODA la info (admin y usuario)
router.get("/completa/:id", infoController.obtenerDatosCompletos);

// Guardar descripción
router.put("/descripcion/:id", infoController.guardarDescripcion);

// Guardar foto
router.put("/foto/:id", upload.single("foto"), infoController.guardarFoto);

module.exports = router;
