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
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://127.0.0.1:3000', 
    'http://127.0.0.1:3001',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middleware para logging de requests (para debug)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =======================
// 🔗 RUTAS API
// =======================
const routes = require('./routes');
app.use('/api', routes);

// =======================
// 🌐 Archivos estáticos
// =======================
app.use('/html', express.static(path.join(__dirname, 'html')));
app.use('/htmlAdmin', express.static(path.join(__dirname, 'html', 'htmlAdmin')));
app.use('/htmlLibros', express.static(path.join(__dirname, 'html', 'htmlLibros')));
app.use('/htmlUser', express.static(path.join(__dirname, 'html', 'htmlUser')));

app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/javaScript', express.static(path.join(__dirname, 'javaScript')));
app.use('/jsAdmin', express.static(path.join(__dirname, 'jsAdmin')));
app.use('/jsUser', express.static(path.join(__dirname, 'jsUser')));
app.use('/Images', express.static(path.join(__dirname, 'Images')));

// =======================
// 🩺 Health check
// =======================
app.get('/api/status', (req, res) => {
  res.json({ 
    ok: true, 
    time: Date.now(),
    message: 'Servidor funcionando correctamente',
    origin: req.headers.origin
  });
});

// =======================
// 🚀 Página raíz
// =======================
app.get('/', (req, res) => {
  res.send('🚀 Servidor de Biblioteca funcionando correctamente');
});

// =======================
// ❌ Manejo de errores
// =======================
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error('❌ Error general:', err);
  res.status(500).json({ error: err.message });
});

// =======================
// ▶️ Inicializar servidor
// =======================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Health check disponible en http://localhost:${PORT}/api/status`);
});