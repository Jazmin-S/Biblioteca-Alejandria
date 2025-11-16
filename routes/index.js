// routes/index.js
const express = require("express");

const loginUsuarioRoutes = require("./loginUsuarioRoutes"); // 👈 NUEVO

const usuarioRoutes = require("./usuarios");
const authRoutes = require("./auth");
const emailRoutes = require("./email");
const registroAdminRoutes = require("./registroadmin");
const registroUsuarioRoutes = require("./registroUsuarioRoutes");
const librosRoutes = require("./libros");
const categoriasRoutes = require("./categorias");
const prestamosRoutes = require("./prestamos");
const informesRoutes = require("./informes");
const infoRoutes = require("./info");
const informacionRoutes = require("./informacion");

const router = express.Router();

// 👉 Primero el login de USUARIO con bcrypt
router.use(loginUsuarioRoutes);          // POST /loginUsuario  → /api/loginUsuario

// Luego el resto de rutas
router.use(usuarioRoutes);
router.use(authRoutes);
router.use(emailRoutes);
router.use("/registroadmin", registroAdminRoutes);
router.use(registroUsuarioRoutes);
router.use(librosRoutes);
router.use(categoriasRoutes);
router.use("/info", infoRoutes);
router.use("/prestamos", prestamosRoutes);
router.use("/informes", informesRoutes);
router.use("/informacion", informacionRoutes);

module.exports = router;
