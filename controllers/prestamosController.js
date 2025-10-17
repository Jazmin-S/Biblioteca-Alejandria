const db = require('../MySQL/db');

const prestamosController = {

  // =====================================================
  // 📚 Obtener todos los préstamos
  // =====================================================
  obtenerPrestamos: (req, res) => {
    const sql = `
      SELECT 
        p.id_prestamo,
        u.nombre AS usuario,
        p.total_prestamos AS num_prestamos,
        p.fecha AS fecha_prestamo,
        DATE_ADD(p.fecha, INTERVAL 7 DAY) AS fecha_vencimiento,
        CASE 
          WHEN CURDATE() > DATE_ADD(p.fecha, INTERVAL 7 DAY) THEN 'Vencido'
          ELSE 'Activo'
        END AS estado,
        COALESCE(SUM(dp.monto_libro), 0) AS total_pagar
      FROM PRESTAMO p
      JOIN USUARIO u ON p.id_usuario = u.id_usuario
      LEFT JOIN DETALLE_PRESTAMO dp ON p.id_prestamo = dp.id_prestamo
      GROUP BY p.id_prestamo
      ORDER BY p.fecha DESC;
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error("Error al obtener préstamos:", err);
        return res.status(500).json({
          success: false,
          message: "Error al obtener préstamos de la base de datos"
        });
      }

      res.json({
        success: true,
        prestamos: results,
        total: results.length
      });
    });
  },

  // =====================================================
  // 🧩 Crear nuevo préstamo
  // =====================================================
  crearPrestamo: (req, res) => {
    const { id_usuario, fecha, libros, total_prestamos } = req.body;

    if (!id_usuario || !fecha || !total_prestamos) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos obligatorios: usuario, fecha o total de préstamos."
      });
    }

    // Insertar préstamo principal
    const sqlPrestamo = `
      INSERT INTO PRESTAMO (id_usuario, fecha, total_prestamos)
      VALUES (?, ?, ?)
    `;

    db.query(sqlPrestamo, [id_usuario, fecha, total_prestamos], (err, result) => {
      if (err) {
        console.error("Error al registrar préstamo:", err);
        return res.status(500).json({
          success: false,
          message: "Error al registrar el préstamo."
        });
      }

      const idPrestamo = result.insertId;

      // Si hay libros, insertarlos en DETALLE_PRESTAMO
      if (libros && libros.length > 0) {
        const sqlDetalle = `
          INSERT INTO DETALLE_PRESTAMO (id_prestamo, id_libro, monto_libro)
          VALUES ?
        `;
        const valores = libros.map(libro => [idPrestamo, libro.id_libro, libro.monto_libro || 0]);

        db.query(sqlDetalle, [valores], (err2) => {
          if (err2) {
            console.error("Error al insertar detalle:", err2);
            return res.status(500).json({
              success: false,
              message: "Error al registrar los libros del préstamo."
            });
          }

          res.status(201).json({
            success: true,
            message: "Préstamo registrado exitosamente con libros.",
            id_prestamo: idPrestamo
          });
        });
      } else {
        // Si no hay libros, solo confirmamos el préstamo
        res.status(201).json({
          success: true,
          message: "Préstamo registrado exitosamente.",
          id_prestamo: idPrestamo
        });
      }
    });
  },

  // =====================================================
  // 🧾 Obtener préstamo por ID
  // =====================================================
  obtenerPrestamoPorId: (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de préstamo válido requerido"
      });
    }

    const sqlPrestamo = `
      SELECT 
        p.id_prestamo, 
        u.nombre AS usuario,
        p.fecha AS fecha_prestamo,
        DATE_ADD(p.fecha, INTERVAL 7 DAY) AS fecha_vencimiento,
        CASE 
          WHEN CURDATE() > DATE_ADD(p.fecha, INTERVAL 7 DAY) THEN 'Vencido'
          ELSE 'Activo'
        END AS estado,
        p.total_prestamos
      FROM PRESTAMO p
      JOIN USUARIO u ON p.id_usuario = u.id_usuario
      WHERE p.id_prestamo = ?;
    `;

    const sqlDetalle = `
      SELECT 
        dp.id_libro, 
        l.titulo, 
        dp.monto_libro
      FROM DETALLE_PRESTAMO dp
      JOIN LIBRO l ON dp.id_libro = l.id_libro
      WHERE dp.id_prestamo = ?;
    `;

    db.query(sqlPrestamo, [id], (err, prestamoResults) => {
      if (err) {
        console.error("Error al obtener préstamo:", err);
        return res.status(500).json({
          success: false,
          message: "Error al obtener préstamo"
        });
      }

      if (prestamoResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Préstamo no encontrado"
        });
      }

      db.query(sqlDetalle, [id], (err2, detalleResults) => {
        if (err2) {
          console.error("Error al obtener detalle:", err2);
          return res.status(500).json({
            success: false,
            message: "Error al obtener detalle del préstamo"
          });
        }

        res.json({
          success: true,
          prestamo: prestamoResults[0],
          detalle: detalleResults
        });
      });
    });
  },

  // =====================================================
  // 🗑️ Eliminar préstamo
  // =====================================================
  eliminarPrestamo: (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de préstamo válido requerido"
      });
    }

    const sqlEliminarDetalle = "DELETE FROM DETALLE_PRESTAMO WHERE id_prestamo = ?";
    const sqlEliminarPrestamo = "DELETE FROM PRESTAMO WHERE id_prestamo = ?";

    db.query(sqlEliminarDetalle, [id], (err) => {
      if (err) {
        console.error("Error al eliminar detalle:", err);
        return res.status(500).json({
          success: false,
          message: "Error al eliminar detalle del préstamo"
        });
      }

      db.query(sqlEliminarPrestamo, [id], (err2, result) => {
        if (err2) {
          console.error("Error al eliminar préstamo:", err2);
          return res.status(500).json({
            success: false,
            message: "Error al eliminar préstamo"
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: "Préstamo no encontrado"
          });
        }

        res.json({
          success: true,
          message: "Préstamo eliminado correctamente"
        });
      });
    });
  }

};

module.exports = prestamosController;
