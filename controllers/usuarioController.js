const db = require('../MySQL/db');

const usuarioController = {
    // Obtener todos los usuarios
    obtenerUsuarios: (req, res) => {
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
        
    },

    // Crear nuevo usuario
    crearUsuario: (req, res) => {
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
    },

    // Actualizar usuario
    actualizarUsuario: (req, res) => {
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
            sql = "UPDATE USUARIO SET nombre = ?, correo = ?, contrasena = ?, rol = ? WHERE id_usuario = ?";
            params = [nombre, correo, contrasena, rol, id];
        } else {
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
    },

    // Eliminar usuario
    eliminarUsuario: (req, res) => {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({ 
                success: false, 
                message: "ID de usuario válido requerido" 
            });
        }

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
    },
        
    // Obtener detalle de un usuario con sus préstamos (pal modal)
    obtenerDetalleUsuario: (req, res) => {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({ 
                success: false, 
                message: "ID de usuario válido requerido" 
            });
        }

        //Consulta para datos del usuario
        const sqlUsuario = `
            SELECT id_usuario, nombre, correo, rol, num_prestamos
            FROM USUARIO
            WHERE id_usuario = ?;
        `;

        // Consulta para libros prestados por el usuario
        const sqlPrestamos = `
            SELECT 
                p.id_prestamo,
                p.fecha AS fecha_prestamo,
                l.titulo,
                l.autor,
                c.nombre AS categoria
            FROM PRESTAMO p
            JOIN DETALLE_PRESTAMO dp ON p.id_prestamo = dp.id_prestamo
            JOIN LIBRO l ON dp.id_libro = l.id_libro
            LEFT JOIN CATEGORIA c ON l.id_categoria = c.id_categoria
            WHERE p.id_usuario = ?
            ORDER BY p.fecha DESC;
        `;

        // Ejecutar las dos consultas en orden
        db.query(sqlUsuario, [id], (err, usuarioResults) => {
            if (err) {
                console.error("Error al obtener usuario:", err);
                return res.status(500).json({ 
                    success: false, 
                    message: "Error al obtener los datos del usuario" 
                });
            }

            if (usuarioResults.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Usuario no encontrado" 
                });
            }

            db.query(sqlPrestamos, [id], (err, prestamosResults) => {
                if (err) {
                    console.error("Error al obtener préstamos:", err);
                    return res.status(500).json({ 
                        success: false, 
                        message: "Error al obtener los préstamos del usuario" 
                    });
                }

                res.json({ 
                    success: true,
                    usuario: usuarioResults[0],
                    prestamos: prestamosResults 
                });
            });
        });
    },

    // Obtener un usuario por ID (para llenar el formulario de edición)
    obtenerUsuarioPorId: (req, res) => {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de usuario válido requerido"
            });
        }

        const sql = "SELECT * FROM USUARIO WHERE id_usuario = ?";

        db.query(sql, [id], (err, results) => {
            if (err) {
                console.error("Error al obtener usuario:", err);
                return res.status(500).json({
                    success: false,
                    message: "Error al obtener usuario"
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Usuario no encontrado"
                });
            }

            res.json({
                success: true,
                usuario: results[0]
            });
        });
    },


};

module.exports = usuarioController;