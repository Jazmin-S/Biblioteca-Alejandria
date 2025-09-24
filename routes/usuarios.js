const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// === RUTAS DE USUARIOS ===
router.get("/usuarios", usuarioController.obtenerUsuarios);
router.post("/usuarios", usuarioController.crearUsuario);
router.put("/usuarios/:id", usuarioController.actualizarUsuario);
router.delete("/usuarios/:id", usuarioController.eliminarUsuario);

module.exports = router;