const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// =====================================================
// RUTAS DE USUARIOS
// =====================================================
router.get("/usuarios", usuarioController.obtenerUsuarios);
router.get("/usuarios/:id", usuarioController.obtenerUsuarioPorId);
router.post("/usuarios", usuarioController.crearUsuario);
router.put("/usuarios/:id", usuarioController.actualizarUsuario);
router.delete("/usuarios/:id", usuarioController.eliminarUsuario);
router.get("/usuarios/:id/detalle", usuarioController.obtenerDetalleUsuario);

// ✅ LOGIN DE USUARIO (solo alumnos y profesores)
router.post("/loginUsuario", usuarioController.loginUsuario);

module.exports = router;