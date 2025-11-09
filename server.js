// =======================
// 📚 Biblioteca de Alejandría - Servidor principal
// =======================
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// =======================
// 🧩 Middleware
// =======================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =======================
// 🔗 RUTAS API  ✅ DEBE IR ANTES DE LOS ESTÁTICOS
// =======================
const routes = require('./routes');
app.use('/api', routes);

// =======================
// 🌐 Archivos estáticos (HTML, CSS, JS, imágenes)
// =======================
app.use('/html', express.static(path.join(__dirname, 'html')));
app.use('/htmlAdmin', express.static(path.join(__dirname, 'html', 'htmlAdmin')));
app.use('/htmlLibros', express.static(path.join(__dirname, 'html', 'htmlLibros')));
app.use('/htmlUser', express.static(path.join(__dirname, 'html', 'htmlUser')));

app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/javaScript', express.static(path.join(__dirname, 'javaScript')));
app.use('/jsAdmin', express.static(path.join(__dirname, 'jsAdmin')));
app.use('/Images', express.static(path.join(__dirname, 'Images')));

// =======================
// 🧾 Logger de peticiones
// =======================
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.path}`);
  next();
});

// =======================
// 🩺 Health check
// =======================
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Servidor funcionando correctamente'
  });
});

// =======================
// 🚀 Página raíz
// =======================
app.get('/', (req, res) => {
  res.send('🚀 Servidor de Biblioteca de Alejandría funcionando correctamente ✅');
});

// =======================
// ❌ Manejo de errores
// =======================
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.get('/api/ping', (req, res) => res.json({ ok: true, time: Date.now() }));

app.use((error, req, res, next) => {
  console.error('❌ Error del servidor:', error);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: error.message
  });
});

// =======================
// ▶️ Iniciar servidor
// =======================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en: http://127.0.0.1:${PORT}`);
  console.log('📁 Rutas modularizadas cargadas correctamente');
});
