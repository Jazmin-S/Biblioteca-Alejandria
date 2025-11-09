const connection = require('../MySQL/db');
const nodemailer = require('nodemailer');

/* -------------------------------------------
   📚 OBTENER TODOS LOS PRÉSTAMOS AGRUPADOS
-------------------------------------------- */
exports.obtenerPrestamos = (req, res) => {
  const sql = `
    SELECT 
      u.id_usuario,
      u.nombre AS usuario,
      DATE_FORMAT(p.fecha, '%Y-%m-%d') AS fecha_prestamo,
      DATE_FORMAT(
        COALESCE(MAX(p.fecha_vencimiento), DATE_ADD(MAX(p.fecha), INTERVAL 15 DAY)),
        '%Y-%m-%d'
      ) AS fecha_vencimiento,
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

/* -------------------------------------------
   🔍 BUSCAR PRÉSTAMOS POR NOMBRE
-------------------------------------------- */
exports.buscarPrestamos = (req, res) => {
  const nombre = req.query.nombre || '';
  const sql = `
    SELECT 
      u.id_usuario,
      u.nombre AS usuario,
      DATE_FORMAT(p.fecha, '%Y-%m-%d') AS fecha_prestamo,
      DATE_FORMAT(
        COALESCE(MAX(p.fecha_vencimiento), DATE_ADD(MAX(p.fecha), INTERVAL 15 DAY)),
        '%Y-%m-%d'
      ) AS fecha_vencimiento,
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

/* -------------------------------------------
   📖 DETALLE DEL PRÉSTAMO
-------------------------------------------- */
exports.detallePrestamo = (req, res) => {
  const ids = req.params.id.split(',');
  const sql = `
    SELECT 
      p.id_prestamo, 
      u.nombre AS usuario, 
      DATE_FORMAT(p.fecha, '%Y-%m-%d') AS fecha_prestamo, 
      DATE_FORMAT(
        COALESCE(p.fecha_vencimiento, DATE_ADD(p.fecha, INTERVAL 15 DAY)),
        '%Y-%m-%d'
      ) AS fecha_vencimiento,
      l.id_libro,
      l.titulo, 
      l.autor
    FROM PRESTAMO p
    INNER JOIN USUARIO u ON p.id_usuario = u.id_usuario
    INNER JOIN DETALLE_PRESTAMO dp ON dp.id_prestamo = p.id_prestamo
    INNER JOIN LIBRO l ON dp.id_libro = l.id_libro
    WHERE p.id_prestamo IN (?)
    ORDER BY p.fecha DESC, p.id_prestamo DESC
  `;

  connection.query(sql, [ids], (err, results) => {
    if (err) {
      console.error('❌ Error SQL al obtener detalle:', err);
      return res.status(500).json({ error: 'Error al obtener detalle del préstamo' });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Préstamo no encontrado o sin libros asociados' });
    }

    const first = results[0];
    res.json({
      usuario: first.usuario,
      fecha_prestamo: first.fecha_prestamo,
      fecha_vencimiento: first.fecha_vencimiento,
      libros: results.map(r => ({
        id_prestamo: r.id_prestamo,
        id_libro: r.id_libro,
        titulo: r.titulo,
        autor: r.autor,
        fecha_vencimiento: r.fecha_vencimiento
      }))
    });
  });
};

/* -------------------------------------------
   ✅ VALIDAR SI USUARIO TIENE PRÉSTAMOS VENCIDOS
-------------------------------------------- */
exports.validarPrestamoUsuario = (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT 
      DATE_FORMAT(COALESCE(fecha_vencimiento, DATE_ADD(fecha, INTERVAL 15 DAY)), '%Y-%m-%d') AS fecha_vencimiento
    FROM PRESTAMO 
    WHERE id_usuario = ?
      AND EXISTS (SELECT 1 FROM DETALLE_PRESTAMO dp WHERE dp.id_prestamo = PRESTAMO.id_prestamo);
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

/* -------------------------------------------
   ➕ REGISTRAR NUEVO PRÉSTAMO
-------------------------------------------- */
exports.agregarPrestamo = (req, res) => {
  const { id_usuario, libros, fecha_vencimiento } = req.body;

  if (!id_usuario || !Array.isArray(libros) || libros.length === 0) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  let vencimiento = fecha_vencimiento || null;
  if (!vencimiento) {
    const hoy = new Date();
    hoy.setDate(hoy.getDate() + 15);
    vencimiento = hoy.toISOString().split('T')[0];
  }

  const sqlPrestamo = `
    INSERT INTO PRESTAMO (id_usuario, fecha, fecha_vencimiento, total_prestamos)
    VALUES (?, CURDATE(), ?, ?);
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

/* -------------------------------------------
   🔁 DEVOLUCIONES (REUSABLE)
-------------------------------------------- */
function procesarDevolucion(id_prestamo, cb) {
  const sqlLibros = 'SELECT id_libro FROM DETALLE_PRESTAMO WHERE id_prestamo = ?';
  connection.query(sqlLibros, [id_prestamo], (err, resultados) => {
    if (err) return cb(err);
    if (resultados.length === 0) return cb({ code: 404, message: 'No se encontraron libros asociados' });

    const libros = resultados.map(r => r.id_libro);

    const sqlUpdate = `
      UPDATE LIBRO 
      SET ejemplares = ejemplares + 1 
      WHERE id_libro IN (?)
    `;
    connection.query(sqlUpdate, [libros], (err2) => {
      if (err2) return cb(err2);

      const sqlDeleteDetalles = 'DELETE FROM DETALLE_PRESTAMO WHERE id_prestamo = ?';
      connection.query(sqlDeleteDetalles, [id_prestamo], (err3) => {
        if (err3) return cb(err3);

        const sqlDeletePrestamo = 'DELETE FROM PRESTAMO WHERE id_prestamo = ?';
        connection.query(sqlDeletePrestamo, [id_prestamo], (err4) => {
          if (err4) return cb(err4);
          cb(null);
        });
      });
    });
  });
}

/* -------------------------------------------
   🟡 ENTREGADO Y 🟢 FINALIZADO
-------------------------------------------- */
exports.entregadoSinPago = (req, res) => {
  const id_prestamo = req.params.id;
  if (!id_prestamo) return res.status(400).json({ error: 'Falta el ID del préstamo' });

  procesarDevolucion(id_prestamo, (err) => {
    if (err) {
      if (err.code === 404) return res.status(404).json({ error: err.message });
      console.error('❌ Error al devolver (entregado):', err);
      return res.status(500).json({ error: 'Error al devolver los libros' });
    }
    res.json({ mensaje: '📗 Entregado: libro devuelto. La deuda queda pendiente de pago.' });
  });
};

exports.finalizarConPago = (req, res) => {
  const id_prestamo = req.params.id;
  if (!id_prestamo) return res.status(400).json({ error: 'Falta el ID del préstamo' });

  procesarDevolucion(id_prestamo, (err) => {
    if (err) {
      if (err.code === 404) return res.status(404).json({ error: err.message });
      console.error('❌ Error al devolver (finalizar):', err);
      return res.status(500).json({ error: 'Error al finalizar el préstamo' });
    }
    res.json({ mensaje: '💰 Finalizado: libro devuelto y deuda liquidada.' });
  });
};

/* -------------------------------------------
   ✉️ NOTIFICACIONES DE VENCIMIENTO
-------------------------------------------- */
exports.notificarVencimientos = async (req, res) => {
  try {
    const sql = `
      SELECT 
        u.correo,
        u.nombre,
        l.titulo,
        DATE_FORMAT(p.fecha, '%Y-%m-%d') AS fecha,
        DATE_FORMAT(p.fecha_vencimiento, '%Y-%m-%d') AS fecha_vencimiento
      FROM PRESTAMO p
      INNER JOIN USUARIO u ON p.id_usuario = u.id_usuario
      INNER JOIN DETALLE_PRESTAMO dp ON dp.id_prestamo = p.id_prestamo
      INNER JOIN LIBRO l ON dp.id_libro = l.id_libro
      WHERE DATE(p.fecha_vencimiento) <= DATE_ADD(CURDATE(), INTERVAL 2 DAY);
    `;
    connection.query(sql, async (err, results) => {
      if (err) {
        console.error('❌ Error al consultar vencimientos:', err);
        return res.status(500).json({ success: false, message: 'Error al obtener vencimientos' });
      }

      if (results.length === 0) {
        return res.json({ success: true, message: 'No hay préstamos próximos a vencer.' });
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
      });

      const usuarios = {};
      results.forEach(r => {
        if (!usuarios[r.correo]) usuarios[r.correo] = { nombre: r.nombre, libros: [] };
        usuarios[r.correo].libros.push({ titulo: r.titulo, fecha: r.fecha_vencimiento, fechaPrestamo: r.fecha });
      });

      for (const [correo, data] of Object.entries(usuarios)) {
        const hoy = new Date();
        const libros = data.libros.map(l => {
          const fecha = new Date(l.fecha);
          const dias = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
          const estado = fecha < hoy ? 'Vencido' : 'Por vencer';
          const multa = dias > 3 ? (dias - 3) * 3 : 0;
          return { ...l, estado, multa };
        });

        const totalMulta = libros.reduce((sum, l) => sum + l.multa, 0);
        const listaLibros = libros.map(l => `
          <li><b>${l.titulo}</b> — ${l.estado} (vence ${l.fecha}) ${l.multa ? `→ Multa $${l.multa}` : ''}</li>
        `).join('');

        const mailOptions = {
          from: `"Biblioteca" <${process.env.EMAIL_USER}>`,
          to: correo,
          subject: 'Recordatorio de préstamos',
          html: `
            <h3>Hola ${data.nombre}</h3>
            <p>Estos son tus préstamos:</p>
            <ul>${listaLibros}</ul>
            <p>Total multa estimada: $${totalMulta}</p>
          `
        };
        try {
          await transporter.sendMail(mailOptions);
        } catch (e) {
          console.error(`❌ Error enviando correo a ${correo}:`, e);
        }
      }

      res.json({ success: true, message: 'Notificaciones enviadas correctamente.' });
    });
  } catch (e) {
    console.error('❌ Error general:', e);
    res.status(500).json({ success: false, message: 'Error al enviar notificaciones' });
  }
};
