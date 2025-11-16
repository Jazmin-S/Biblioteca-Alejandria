const db = require('../MySQL/db');

// ==================== CONTROLADOR DE INFORMES ====================
const informesController = {
  // Solo para probar rápido que la ruta responde
  generarInformes: (req, res) => {
    res.json({ ok: true, mensaje: '✅ API de informes funcionando' });
  },

  // ==================== RESUMEN (KPIs + tablas de resumen) ====================
  // GET /api/informes/resumen?year=YYYY&month=MM
  generarResumenSolo: (req, res) => {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const month = parseInt(req.query.month, 10) || (new Date().getMonth() + 1);

    const data = {
      kpis: {
        usuarios_totales: 0,
        libros_totales: 0,
        prestamos_mes: 0,
      },
      prestamos_por_dia: [],
      top_libros: [],
    };

    // ---- 1) KPIs ----
    const qKpis = `
      SELECT
        (SELECT COUNT(*) FROM USUARIO) AS usuarios_totales,
        (SELECT COUNT(*) FROM LIBRO)   AS libros_totales,
        (SELECT COUNT(*) FROM PRESTAMO
         WHERE YEAR(fecha) = ? AND MONTH(fecha) = ?) AS prestamos_mes
    `;

    db.query(qKpis, [year, month], (err, rows) => {
      if (err) {
        console.error('❌ Error al obtener KPIs de informes:', err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }

      if (rows.length > 0) {
        data.kpis = rows[0];
      }

      // ---- 2) Préstamos por día ----
      const qPrestamosDia = `
        SELECT
          DATE(p.fecha)              AS dia,
          u.nombre                   AS usuario,
          l.titulo                   AS libro,
          COUNT(dp.id_libro)         AS cantidad
        FROM PRESTAMO p
        JOIN USUARIO u           ON p.id_usuario = u.id_usuario
        JOIN DETALLE_PRESTAMO dp ON dp.id_prestamo = p.id_prestamo
        JOIN LIBRO l             ON dp.id_libro = l.id_libro
        WHERE YEAR(p.fecha) = ? AND MONTH(p.fecha) = ?
        GROUP BY DATE(p.fecha), u.nombre, l.titulo
        ORDER BY dia ASC
      `;

      db.query(qPrestamosDia, [year, month], (err2, rows2) => {
        if (err2) {
          console.error('❌ Error al obtener préstamos por día:', err2);
          return res.status(500).json({ error: 'Error en la base de datos' });
        }

        data.prestamos_por_dia = rows2 || [];

        // ---- 3) Top de libros ----
        const qTopLibros = `
          SELECT
            l.titulo,
            l.autor,
            COUNT(dp.id_libro) AS total
          FROM DETALLE_PRESTAMO dp
          JOIN PRESTAMO p ON dp.id_prestamo = p.id_prestamo
          JOIN LIBRO l    ON dp.id_libro = l.id_libro
          WHERE YEAR(p.fecha) = ? AND MONTH(p.fecha) = ?
          GROUP BY l.id_libro
          ORDER BY total DESC
          LIMIT 5
        `;

        db.query(qTopLibros, [year, month], (err3, rows3) => {
          if (err3) {
            console.error('❌ Error al obtener top de libros:', err3);
            return res.status(500).json({ error: 'Error en la base de datos' });
          }

          data.top_libros = rows3 || [];
          // ✅ Respuesta final del resumen
          res.json(data);
        });
      });
    });
  },

  // ==================== USUARIOS ====================
  // GET /api/informes/usuarios?year=YYYY&month=MM
  informeUsuarios: (req, res) => {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const month = parseInt(req.query.month, 10) || (new Date().getMonth() + 1);

    const query = `
      SELECT
        u.id_usuario,
        u.nombre,
        u.correo,
        u.rol,
        COUNT(p.id_prestamo) AS prestamos_mes
      FROM USUARIO u
      LEFT JOIN PRESTAMO p
        ON p.id_usuario = u.id_usuario
       AND YEAR(p.fecha) = ?
       AND MONTH(p.fecha) = ?
      GROUP BY u.id_usuario
      ORDER BY u.id_usuario ASC
    `;

    db.query(query, [year, month], (err, results) => {
      if (err) {
        console.error('❌ Error al listar usuarios:', err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      res.json(results);
    });
  },

  // ==================== PRÉSTAMOS DEL MES ====================
  // GET /api/informes/prestamos?year=YYYY&month=MM
  informePrestamos: (req, res) => {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const month = parseInt(req.query.month, 10) || (new Date().getMonth() + 1);

    const query = `
      SELECT
        p.id_prestamo,
        DATE(p.fecha)              AS fecha,
        DATE(p.fecha_vencimiento) AS fecha_vencimiento,
        u.nombre                   AS usuario,
        COALESCE(COUNT(dp.id_libro), 0) AS libros,
        MONTH(p.fecha)             AS mes_prestamo,
        p.entregado
      FROM PRESTAMO p
      JOIN USUARIO u           ON p.id_usuario = u.id_usuario
      LEFT JOIN DETALLE_PRESTAMO dp ON dp.id_prestamo = p.id_prestamo
      WHERE YEAR(p.fecha) = ? AND MONTH(p.fecha) = ?
      GROUP BY p.id_prestamo
      ORDER BY p.fecha ASC
   `;

    db.query(query, [year, month], (err, results) => {
      if (err) {
        console.error('❌ Error al listar préstamos:', err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      res.json(results);
    });
  },

  // ==================== LIBROS (CATÁLOGO) ====================
  // GET /api/informes/libros
  informeLibros: (req, res) => {
    const query = `
      SELECT
        l.id_libro,
        l.titulo,
        l.autor,
        c.nombre AS categoria,
        l.ejemplares,
        COALESCE(COUNT(dp.id_prestamo), 0) AS total_prestamos
      FROM LIBRO l
      LEFT JOIN CATEGORIA c      ON l.id_categoria = c.id_categoria
      LEFT JOIN DETALLE_PRESTAMO dp ON dp.id_libro = l.id_libro
      GROUP BY l.id_libro
      ORDER BY l.id_libro DESC
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error('❌ Error al listar libros:', err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      res.json(results);
    });
  },

  // ==================== PRÉSTAMOS VENCIDOS GLOBAL ====================
  // GET /api/informes/vencidos-global
  informeVencidosGlobal: (req, res) => {
    const query = `
      SELECT
        p.id_prestamo,
        DATE(p.fecha)              AS fecha,
        DATE(p.fecha_vencimiento) AS fecha_vencimiento,
        u.nombre                   AS usuario,
        COALESCE(COUNT(dp.id_libro), 0) AS libros,
        MONTH(p.fecha)             AS mes_prestamo,
        p.entregado
      FROM PRESTAMO p
      JOIN USUARIO u           ON p.id_usuario = u.id_usuario
      LEFT JOIN DETALLE_PRESTAMO dp ON dp.id_prestamo = p.id_prestamo
      WHERE p.entregado = 0
        AND p.fecha_vencimiento < CURDATE()
      GROUP BY p.id_prestamo
      ORDER BY p.fecha_vencimiento ASC
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error('❌ Error al listar vencidos globales:', err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      res.json(results);
    });
  },
};

module.exports = informesController;
