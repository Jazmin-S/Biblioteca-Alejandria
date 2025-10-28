const connection = require('../MySQL/db');
const nodemailer = require('nodemailer');

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

// 🔍 Buscar préstamos por nombre
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
  const ids = req.params.id.split(',');
  const sql = `
    SELECT 
      p.id_prestamo, 
      u.nombre AS usuario, 
      p.fecha AS fecha_prestamo, 
      COALESCE(p.fecha_vencimiento, DATE_ADD(p.fecha, INTERVAL 15 DAY)) AS fecha_vencimiento,
      l.id_libro,
      l.titulo, 
      l.autor
    FROM PRESTAMO p
    INNER JOIN USUARIO u ON p.id_usuario = u.id_usuario
    INNER JOIN DETALLE_PRESTAMO dp ON dp.id_prestamo = p.id_prestamo
    INNER JOIN LIBRO l ON dp.id_libro = l.id_libro
    WHERE p.id_prestamo IN (?)
  `;

  connection.query(sql, [ids], (err, results) => {
    if (err) {
      console.error('❌ Error SQL al obtener detalle:', err);
      return res.status(500).json({ error: 'Error al obtener detalle del préstamo' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Préstamo no encontrado o sin libros asociados' });
    }

    // 🔍 Detección de préstamos con fechas inválidas
    results.forEach(r => {
      const prestamoDate = new Date(r.fecha_prestamo);
      const vencimientoDate = new Date(r.fecha_vencimiento);
      if (vencimientoDate < prestamoDate) {
        console.warn(`⚠️ El préstamo ${r.id_prestamo} tiene fecha de vencimiento anterior al préstamo.`);
        // Marcar el préstamo como "vencido" visualmente
        r.fecha_vencimiento = r.fecha_prestamo;
      }
    });

    const prestamo = results[0];
    console.log("🧠 Resultado detallePrestamo:", results);

    res.json({
      usuario: prestamo.usuario,
      fecha_prestamo: prestamo.fecha_prestamo,
      fecha_vencimiento: prestamo.fecha_vencimiento,
      libros: results.map(l => ({
        id_prestamo: l.id_prestamo,
        id_libro: l.id_libro,
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

// ➕ Registrar nuevo préstamo (con cálculo local correcto)
exports.agregarPrestamo = (req, res) => {
  const { id_usuario, libros, fecha_vencimiento } = req.body;

  if (!id_usuario || !Array.isArray(libros) || libros.length === 0) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  // 📅 Calcular fecha local sin UTC
  let vencimiento;
  if (fecha_vencimiento) {
    vencimiento = fecha_vencimiento;
  } else {
    const hoy = new Date();
    hoy.setDate(hoy.getDate() + 15);
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    vencimiento = `${yyyy}-${mm}-${dd}`;
  }

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

// 🟢 Marcar préstamo como devuelto
exports.marcarComoDevuelto = (req, res) => {
  const id_prestamo = req.params.id;

  if (!id_prestamo) {
    return res.status(400).json({ error: 'Falta el ID del préstamo' });
  }

  const sqlLibros = 'SELECT id_libro FROM DETALLE_PRESTAMO WHERE id_prestamo = ?';
  connection.query(sqlLibros, [id_prestamo], (err, resultados) => {
    if (err) {
      console.error('❌ Error al obtener libros del préstamo:', err);
      return res.status(500).json({ error: 'Error al obtener libros asociados' });
    }

    if (resultados.length === 0) {
      return res.status(404).json({ error: 'No se encontraron libros asociados' });
    }

    const libros = resultados.map(r => r.id_libro);

    const sqlUpdate = `
      UPDATE LIBRO 
      SET ejemplares = ejemplares + 1 
      WHERE id_libro IN (?)
    `;
    connection.query(sqlUpdate, [libros], (err2) => {
      if (err2) {
        console.error('❌ Error al actualizar ejemplares:', err2);
        return res.status(500).json({ error: 'Error al devolver los libros' });
      }

      const sqlDeleteDetalles = 'DELETE FROM DETALLE_PRESTAMO WHERE id_prestamo = ?';
      connection.query(sqlDeleteDetalles, [id_prestamo], (err3) => {
        if (err3) {
          console.error('❌ Error al eliminar detalles del préstamo:', err3);
          return res.status(500).json({ error: 'Error al eliminar detalles' });
        }

        const sqlDeletePrestamo = 'DELETE FROM PRESTAMO WHERE id_prestamo = ?';
        connection.query(sqlDeletePrestamo, [id_prestamo], (err4) => {
          if (err4) {
            console.error('❌ Error al eliminar préstamo:', err4);
            return res.status(500).json({ error: 'Error al eliminar préstamo' });
          }

          res.json({ mensaje: '✅ Préstamo devuelto y eliminado correctamente.' });
        });
      });
    });
  });
};

// 📧 Notificar préstamos próximos a vencer o vencidos
exports.notificarVencimientos = async (req, res) => {
  try {
    const sql = `
      SELECT 
        u.correo,
        u.nombre,
        l.titulo,
        p.fecha,
        p.fecha_vencimiento
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
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
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
          const fechaPrestamo = new Date(l.fechaPrestamo);
          const dias = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
          const estado = fecha < hoy || fecha < fechaPrestamo ? 'Vencido' : 'Por vencer';
          const multa = dias > 3 ? (dias - 3) * 3 : 0;
          return { ...l, estado, multa };
        });

        const porVencer = libros.filter(l => l.estado === 'Por vencer').length;
        const vencidos = libros.filter(l => l.estado === 'Vencido').length;
        const totalMulta = libros.reduce((sum, l) => sum + l.multa, 0);

        const listaLibros = libros.map(l => `
          <li>
            <b>${l.titulo}</b> — 
            ${l.estado === 'Vencido' ? '⚠️ <span style="color:red;">Vencido</span>' : '⏰ Por vencer'} 
            (vence el ${new Date(l.fecha).toLocaleDateString('es-MX')}) 
            ${l.multa > 0 ? `→ Multa: $${l.multa.toFixed(2)}` : ''}
          </li>
        `).join('');

        const mailOptions = {
          from: `"Biblioteca de Alejandría" <${process.env.EMAIL_USER}>`,
          to: correo,
          subject: '📚 Recordatorio de préstamos y multas pendientes',
          html: `
            <h2>📘 Hola ${data.nombre},</h2>
            <p>Este es un recordatorio de tus préstamos:</p>
            <ul>${listaLibros}</ul>
            <hr>
            <p><b>📅 Resumen:</b></p>
            <ul>
              <li>Por vencer: ${porVencer}</li>
              <li>Vencidos: ${vencidos}</li>
              <li>Total estimado de multa: $${totalMulta.toFixed(2)}</li>
            </ul>
            <hr>
            <p>
              Puedes devolver los libros en cualquier momento <b>sin pagar en ese instante</b>, 
              pero recuerda que <b>las multas deberán ser liquidadas antes del fin de semestre</b> 
              para evitar bloqueos en el sistema de préstamos o afectaciones académicas.
            </p>
            <p>Gracias por usar la <b>Biblioteca de Alejandría</b>.</p>
          `
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`✅ Notificación enviada a ${correo}`);
        } catch (error) {
          console.error(`❌ Error enviando correo a ${correo}:`, error);
        }
      }

      res.json({ success: true, message: 'Notificaciones enviadas correctamente.' });
    });
  } catch (error) {
    console.error('❌ Error general al enviar notificaciones:', error);
    res.status(500).json({ success: false, message: 'Error al enviar notificaciones' });
  }
};
