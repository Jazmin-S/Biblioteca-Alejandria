const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// =====================================================
// 👥 RUTAS DE USUARIOS
// =====================================================

// Obtener todos los usuarios (con conteo de libros prestados)
router.get("/usuarios", usuarioController.obtenerUsuarios);

// Obtener un usuario específico por ID
router.get("/usuarios/:id", usuarioController.obtenerUsuarioPorId);

// Crear nuevo usuario
router.post("/usuarios", usuarioController.crearUsuario);

// Actualizar usuario existente
router.put("/usuarios/:id", usuarioController.actualizarUsuario);

// Eliminar usuario (solo si no tiene préstamos)
router.delete("/usuarios/:id", usuarioController.eliminarUsuario);

// Obtener detalle de un usuario con sus préstamos (para el popup)
router.get("/usuarios/:id/detalle", usuarioController.obtenerDetalleUsuario);

module.exports = router;
