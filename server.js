const express = require('express');
const bcrypt = require('bcryptjs');
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
app.use(express.static(__dirname));

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'test@example.com',
        pass: 'password'
    },
    logger: true,
    debug: true
});

// === RUTA: Obtener todos los usuarios ===
app.get("/api/usuarios", (req, res) => {
    const sql = `
        SELECT 
            u.id_usuario, 
            u.nombre, 
            u.correo, 
            u.rol,
            COUNT(p.id_prestamo) as prestamos
        FROM USUARIO u
        LEFT JOIN PRESTAMO p ON u.id_usuario = p.id_usuario
        GROUP BY u.id_usuario
        ORDER BY u.nombre
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error al obtener usuarios:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Error al obtener usuarios de la base de datos" 
            });
        }
        res.json({ 
            success: true, 
            usuarios: results,
            total: results.length 
        });
    });
});

// === RUTA: Crear nuevo usuario ===
app.post("/api/usuarios", (req, res) => {
    const { nombre, correo, contrasena, rol } = req.body;

    if (!nombre || !correo || !contrasena || !rol) {
        return res.status(400).json({ 
            success: false, 
            message: "Todos los campos son obligatorios: nombre, correo, contraseña, rol" 
        });
    }

    // Verificar si el correo ya existe
    const checkSql = "SELECT id_usuario FROM USUARIO WHERE correo = ?";
    db.query(checkSql, [correo], (err, results) => {
        if (err) {
            console.error("Error al verificar correo:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Error al verificar el correo electrónico" 
            });
        }

        if (results.length > 0) {
            return res.status(409).json({ 
                success: false, 
                message: "El correo electrónico ya está registrado" 
            });
        }

        // Insertar nuevo usuario
        const insertSql = "INSERT INTO USUARIO (nombre, correo, contrasena, rol) VALUES (?, ?, ?, ?)";
        db.query(insertSql, [nombre, correo, contrasena, rol], (err, result) => {
            if (err) {
                console.error("Error al insertar usuario:", err);
                return res.status(500).json({ 
                    success: false, 
                    message: "Error al registrar el usuario en la base de datos" 
                });
            }
            
            res.status(201).json({ 
                success: true, 
                message: "Usuario registrado exitosamente", 
                id: result.insertId 
            });
        });
    });
});

// === RUTA: Actualizar usuario ===
app.put("/api/usuarios/:id", (req, res) => {
    const { id } = req.params;
    const { nombre, correo, contrasena, rol } = req.body;

    if (!nombre || !correo || !rol) {
        return res.status(400).json({ 
            success: false, 
            message: "Los campos nombre, correo y rol son obligatorios" 
        });
    }

    let sql, params;
    
    if (contrasena) {
        // Actualizar con contraseña
        sql = "UPDATE USUARIO SET nombre = ?, correo = ?, contrasena = ?, rol = ? WHERE id_usuario = ?";
        params = [nombre, correo, contrasena, rol, id];
    } else {
        // Actualizar sin cambiar contraseña
        sql = "UPDATE USUARIO SET nombre = ?, correo = ?, rol = ? WHERE id_usuario = ?";
        params = [nombre, correo, rol, id];
    }

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error("Error al actualizar usuario:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Error al actualizar el usuario en la base de datos" 
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Usuario no encontrado" 
            });
        }
        
        res.json({ 
            success: true, 
            message: "Usuario actualizado correctamente" 
        });
    });
});

// === RUTA: Eliminar usuario === CORREGIDO
app.delete("/api/usuarios/:id", (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ 
            success: false, 
            message: "ID de usuario válido requerido" 
        });
    }

    // ✅ CORRECCIÓN: Se eliminó "AND estado = 'activo'" porque la columna no existe
    const checkPrestamosSql = "SELECT id_prestamo FROM PRESTAMO WHERE id_usuario = ?";
    
    db.query(checkPrestamosSql, [id], (err, results) => {
        if (err) {
            console.error("Error al verificar préstamos:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Error al verificar préstamos del usuario" 
            });
        }

        if (results.length > 0) {
            return res.status(409).json({ 
                success: false, 
                message: "No se puede eliminar el usuario porque tiene préstamos asociados" 
            });
        }

        // Eliminar usuario
        const deleteSql = "DELETE FROM USUARIO WHERE id_usuario = ?";
        db.query(deleteSql, [id], (err, result) => {
            if (err) {
                console.error("Error al eliminar usuario:", err);
                return res.status(500).json({ 
                    success: false, 
                    message: "Error al eliminar el usuario de la base de datos" 
                });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Usuario no encontrado" 
                });
            }
            
            res.json({ 
                success: true, 
                message: "Usuario eliminado correctamente" 
            });
        });
    });
});

// === RUTAS EXISTENTES (mantenerlas) ===
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

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Faltan campos' });

    const query = 'SELECT id_usuario, correo, contrasena, nombre, rol FROM USUARIO WHERE correo = ?';
    db.execute(query, [email], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Error del servidor' });
        if (results.length === 0) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

        const usuario = results[0];

        if (password !== usuario.contrasena) {
            return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
        }

        res.json({
            success: true,
            usuario: {
                id: usuario.id_usuario,
                correo: usuario.correo,
                nombre: usuario.nombre,
                rol: usuario.rol
            }
        });
    });
});

// Rutas de archivos estáticos
app.get('/recuperar-contraseña.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'recuperar-contraseña.html'));
});

app.get('/', (req, res) => {
    res.send('Servidor de Biblioteca de Alejandría funcionando ✅');
});

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
    console.log(`🔧 Ruta de actualización de contraseña: http://localhost:${PORT}/api/actualizar-contraseña`);
    console.log(`👥 Ruta de usuarios: http://localhost:${PORT}/api/usuarios`);
    console.log(`➕ Ruta de agregar usuarios: POST http://localhost:${PORT}/api/usuarios`);
    console.log(`✏️  Ruta de editar usuarios: PUT http://localhost:3000/api/usuarios/:id`);
    console.log(`🗑️  Ruta de eliminar usuarios: DELETE http://localhost:3000/api/usuarios/:id`);
});