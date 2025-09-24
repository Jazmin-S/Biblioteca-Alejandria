const express = require('express');
const bcrypt = require('bcryptjs'); // aunque tu contraseña es en texto plano, lo dejamos por si quieres usarlo
const nodemailer = require('nodemailer');
const path = require('path');
const cors = require('cors');

// Importar la conexión desde db.js
const db = require('./MySQL/db');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Servir archivos estáticos

// Configuración de Nodemailer (modo prueba)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'test@example.com', // No necesario en modo prueba
        pass: 'password'
    },
    logger: true,
    debug: true
});

// === RUTA: Verificar correo en BD ===
app.post('/api/verificar-correo', (req, res) => {
    const { correo } = req.body;
    if (!correo) return res.status(400).json({ error: 'Correo requerido' });

    const query = 'SELECT id_usuario FROM USUARIO WHERE correo = ?';
    db.execute(query, [correo], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error del servidor' });
        if (results.length > 0) res.json({ existe: true, mensaje: 'Correo encontrado' });
        else res.json({ existe: false, mensaje: 'Correo no registrado' });
    });
});

// === RUTA: Actualizar contraseña ===
app.post('/api/actualizar-contrasena', (req, res) => {
    const { correo, nuevaContrasena } = req.body;

    if (!correo || !nuevaContrasena) {
        return res.status(400).json({ success: false, message: 'Datos incompletos' });
    }

    const query = 'UPDATE USUARIO SET contrasena = ? WHERE correo = ?';
    db.execute(query, [nuevaContrasena, correo], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Error del servidor' });

        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

        console.log(`✅ Contraseña actualizada para: ${correo}`);
        res.json({ success: true });
    });
});

// === RUTA: Login ===
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Faltan campos' });

    const query = 'SELECT id_usuario, correo, contrasena, nombre FROM USUARIO WHERE correo = ?';
    db.execute(query, [email], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Error del servidor' });
        if (results.length === 0) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

        const usuario = results[0];

        // Comparación de texto plano
        if (password !== usuario.contrasena) {
            return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
        }

        res.json({
            success: true,
            usuario: {
                id: usuario.id_usuario,
                correo: usuario.correo,
                nombre: usuario.nombre
            }
        });
    });
});

// Ruta para la página de recuperación
app.get('/recuperar-contraseña.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'recuperar-contraseña.html'));
});

// Ruta raíz
app.get('/', (req, res) => {
    res.send('Servidor de Biblioteca de Alejandría funcionando ✅');
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ mensaje: '✅ Servidor funcionando correctamente', timestamp: new Date() });
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📧 Ruta de verificación: http://localhost:${PORT}/api/verificar-correo`);
    console.log(`🔧 Ruta de actualización de contraseña: http://localhost:${PORT}/api/actualizar-contrasena`);
});
