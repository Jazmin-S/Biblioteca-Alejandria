const express = require('express');
const router = express.Router();

const usuarioRoutes = require('./usuarios');
const authRoutes = require('./auth');
const emailRoutes = require('./email');
const registroAdminRoutes = require('./registroadmin');
const registroUsuarioRoutes = require('./registroUsuarioRoutes');
const librosRoutes = require('./libros');
const categoriasRoutes = require('./categorias');
const informacionRoutes = require('./informacion');
const prestamosRoutes = require('./prestamos');
const informesRoutes = require('./informes');

// Se usan las rutas correspondientes
router.use(usuarioRoutes);
router.use(authRoutes);
router.use(emailRoutes);
router.use('/registroadmin', registroAdminRoutes);
router.use(registroUsuarioRoutes);  // ✅ Aquí se aplica /registroUsuario
router.use(librosRoutes);
router.use(categoriasRoutes);
router.use(informacionRoutes);
router.use('/prestamos', prestamosRoutes);
router.use('/informes', informesRoutes);

module.exports = router;
