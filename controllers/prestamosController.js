const connection = require('../MySQL/db');

// 📚 Obtener todos los préstamos agrupados por usuario y fecha
exports.obtenerPrestamos = (req, res) => {
  const sql = `
    SELECT 
      u.id_usuario,
      u.nombre AS usuario,
      DATE(p.fecha) AS fecha_prestamo,
      COALESCE(MAX(p.fecha_vencimiento), DATE_ADD(MAX(p.fecha), INTERVAL 15 DAY)) AS fecha_vencimiento,
      SUM(p.total_prestamos) AS numero_prestamos,
      GROUP_CONCAT(p.id_prestamo) AS ids_prestamos
    FROM PRESTAMO p
    INNER JOIN USUARIO u ON p.id_usuario = u.id_usuario
    GROUP BY u.id_usuario, u.nombre, DATE(p.fecha)
    ORDER BY MAX(p.fecha) DESC;
  `;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener préstamos agrupados:', err);
      return res.status(500).json({ error: 'Error al obtener préstamos' });
    }
    res.json(results || []);
  });
};

// 🔍 Buscar préstamos por nombre (agrupados por día)
exports.buscarPrestamos = (req, res) => {
  const nombre = req.query.nombre || '';
  const sql = `
    SELECT 
      u.id_usuario,
      u.nombre AS usuario,
      DATE(p.fecha) AS fecha_prestamo,
      COALESCE(MAX(p.fecha_vencimiento), DATE_ADD(MAX(p.fecha), INTERVAL 15 DAY)) AS fecha_vencimiento,
      SUM(p.total_prestamos) AS numero_prestamos,
      GROUP_CONCAT(p.id_prestamo) AS ids_prestamos
    FROM PRESTAMO p
    INNER JOIN USUARIO u ON p.id_usuario = u.id_usuario
    WHERE u.nombre LIKE ?
    GROUP BY u.id_usuario, u.nombre, DATE(p.fecha)
    ORDER BY MAX(p.fecha) DESC;
  `;

  connection.query(sql, [`%${nombre}%`], (err, results) => {
    if (err) {
      console.error('❌ Error en búsqueda agrupada:', err);
      return res.status(500).json({ error: 'Error al buscar préstamos' });
    }
    res.json(results || []);
  });
};

// 📖 Detalle del préstamo (permite múltiples ids)
exports.detallePrestamo = (req, res) => {
  const ids = req.params.id.split(','); // puede recibir varios IDs (agrupados)
  const sql = `
    SELECT 
      p.id_prestamo, 
      u.nombre AS usuario, 
      p.fecha AS fecha_prestamo, 
      COALESCE(p.fecha_vencimiento, DATE_ADD(p.fecha, INTERVAL 15 DAY)) AS fecha_vencimiento,
      l.titulo, 
      l.autor
    FROM PRESTAMO p
    INNER JOIN USUARIO u ON p.id_usuario = u.id_usuario
    INNER JOIN DETALLE_PRESTAMO dp ON dp.id_prestamo = p.id_prestamo
    INNER JOIN LIBRO l ON dp.id_libro = l.id_libro
    WHERE p.id_prestamo IN (?);
  `;

  connection.query(sql, [ids], (err, results) => {
    if (err) {
      console.error('❌ Error SQL al obtener detalle:', err);
      return res.status(500).json({ error: 'Error al obtener detalle del préstamo' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Préstamo no encontrado o sin libros asociados' });
    }

    const prestamo = results[0];
    res.json({
      usuario: prestamo.usuario,
      fecha_prestamo: prestamo.fecha_prestamo,
      fecha_vencimiento: prestamo.fecha_vencimiento,
      libros: results.map(l => ({
        titulo: l.titulo,
        autor: l.autor
      }))
    });
  });
};

// ✅ Validar si el usuario tiene préstamo vencido
exports.validarPrestamoUsuario = (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT COALESCE(fecha_vencimiento, DATE_ADD(fecha, INTERVAL 15 DAY)) AS fecha_vencimiento
    FROM PRESTAMO 
    WHERE id_usuario = ?;
  `;

  connection.query(sql, [id], (err, results) => {
    if (err) {
      console.error('❌ Error al validar usuario:', err);
      return res.status(500).json({ error: 'Error al validar usuario' });
    }

    const hoy = new Date();
    const tieneVencido = results.some(r => new Date(r.fecha_vencimiento) < hoy);
    res.json({ tieneVencido });
  });
};

// ➕ Registrar nuevo préstamo
exports.agregarPrestamo = (req, res) => {
  const { id_usuario, libros, fecha_vencimiento } = req.body;

  if (!id_usuario || !Array.isArray(libros) || libros.length === 0) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  const vencimiento = fecha_vencimiento || new Date(Date.now() + 15*24*60*60*1000)
    .toISOString().split('T')[0];

  const sqlPrestamo = `
    INSERT INTO PRESTAMO (id_usuario, fecha, fecha_vencimiento, total_prestamos)
    VALUES (?, NOW(), ?, ?);
  `;

  connection.query(sqlPrestamo, [id_usuario, vencimiento, libros.length], (err, result) => {
    if (err) {
      console.error('❌ Error al crear préstamo:', err);
      return res.status(500).json({ error: 'Error al crear préstamo' });
    }

    const idPrestamo = result.insertId;
    const detalle = libros.map(idLibro => [idPrestamo, idLibro]);
    const sqlDetalle = `INSERT INTO DETALLE_PRESTAMO (id_prestamo, id_libro) VALUES ?;`;

    connection.query(sqlDetalle, [detalle], (err2) => {
      if (err2) {
        console.error('❌ Error al registrar detalle del préstamo:', err2);
        return res.status(500).json({ error: 'Error al registrar detalle del préstamo' });
      }

      res.json({ mensaje: '✅ Préstamo agregado correctamente', id_prestamo: idPrestamo });
    });
  });
};
