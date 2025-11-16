const express = require("express");
const router = express.Router();
const infoCtrl = require("../controllers/informacionController");

// 🔍 Verificar estado del servidor
router.get("/status", (req, res) => {
  res.json({
    status: "OK",
    message: "Servidor funcionando desde /informacion/status"
  });
});

// Rutas principales
router.get("/completa/:id", infoCtrl.obtenerDatosCompletos);
router.get("/:id", infoCtrl.obtenerInformacion);
router.get("/", infoCtrl.listarUsuarios);

// Subir foto
router.post("/subir-foto/:id", infoCtrl.uploadFoto, infoCtrl.subirFoto);

module.exports = router;
