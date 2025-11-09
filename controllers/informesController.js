const connection = require('../MySQL/db');

function queryAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

function rangoMes(year, month) {
  const m = String(month).padStart(2, '0');
  
  // ✅ SOLUCIÓN DEFINITIVA: Usar solo año y mes, dejar que MySQL maneje las fechas
  return [year, month];
}

// ========== ENDPOINTS CORREGIDOS ==========
exports.generarResumenSolo = async (req, res) => {
  try {
    const { year, month } = req.query;
    console.log(`🎯 SOLICITUD RESUMEN: year=${year}, month=${month}`);
    
    if (!year || !month) return res.status(400).json({ error: 'Faltan parámetros' });

    const [y, m] = rangoMes(year, month);
    console.log(`📅 Buscando por año=${y}, mes=${m}`);

    // Consultas básicas
    const usuariosResult = await queryAsync(`SELECT COUNT(*) AS total FROM usuario`);
    const librosResult = await queryAsync(`SELECT COUNT(*) AS total FROM libro`);
    
    // ✅ CONSULTA CORREGIDA - Buscar por año y mes directamente
    const prestamosResult = await queryAsync(
      `SELECT COUNT(*) AS total FROM prestamo WHERE YEAR(fecha) = ? AND MONTH(fecha) = ?`, 
      [y, m]
    );
    
    const usuarios_totales = usuariosResult[0]?.total || 0;
    const libros_totales = librosResult[0]?.total || 0;
    const prestamos_mes = prestamosResult[0]?.total || 0;
    
    console.log(`📊 KPIs: usuarios=${usuarios_totales}, libros=${libros_totales}, prestamos=${prestamos_mes}`);

    // ✅ PRÉSTAMOS POR DÍA - Corregido
    const prestamos_por_dia = await queryAsync(
      `SELECT DATE(fecha) AS dia, COUNT(*) AS total 
       FROM prestamo 
       WHERE YEAR(fecha) = ? AND MONTH(fecha) = ?
       GROUP BY DATE(fecha) 
       ORDER BY DATE(fecha)`, 
      [y, m]
    );

    console.log(`📅 Días con préstamos:`, prestamos_por_dia);

    // ✅ TOP LIBROS - Corregido
    const top_libros = await queryAsync(
      `SELECT l.titulo, l.autor, COUNT(*) AS total 
       FROM detalle_prestamo dp 
       JOIN prestamo p ON p.id_prestamo = dp.id_prestamo 
       JOIN libro l ON l.id_libro = dp.id_libro 
       WHERE YEAR(p.fecha) = ? AND MONTH(p.fecha) = ?
       GROUP BY l.id_libro 
       ORDER BY total DESC 
       LIMIT 5`, 
      [y, m]
    );

    console.log(`📚 Top libros:`, top_libros);

    const response = {
      kpis: {
        usuarios_totales,
        libros_totales,
        prestamos_mes
      },
      prestamos_por_dia,
      top_libros
    };

    console.log('✅ RESPONSE RESUMEN:', JSON.stringify(response, null, 2));
    res.json(response);
    
  } catch (err) {
    console.error('❌ Error resumen:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.informePrestamos = async (req, res) => {
  try {
    const { year, month } = req.query;
    console.log(`🎯 SOLICITUD PRÉSTAMOS: year=${year}, month=${month}`);
    
    if (!year || !month) return res.status(400).json({ error: 'Faltan parámetros' });

    const [y, m] = rangoMes(year, month);
    console.log(`📅 Buscando préstamos por año=${y}, mes=${m}`);

    // ✅ CONSULTA CORREGIDA - Buscar por año y mes
    const rows = await queryAsync(
      `SELECT 
        p.id_prestamo, 
        p.fecha, 
        p.fecha_vencimiento,
        u.nombre AS usuario,
        (SELECT COUNT(*) FROM detalle_prestamo WHERE id_prestamo = p.id_prestamo) AS libros
       FROM prestamo p
       LEFT JOIN usuario u ON u.id_usuario = p.id_usuario
       WHERE YEAR(p.fecha) = ? AND MONTH(p.fecha) = ?
       ORDER BY p.fecha DESC`, 
      [y, m]
    );

    console.log(`✅ PRÉSTAMOS ENCONTRADOS: ${rows.length}`);
    
    if (rows.length > 0) {
      console.log('📋 DETALLES PRÉSTAMOS:');
      rows.forEach(p => {
        console.log(`   - ID: ${p.id_prestamo}, Fecha: ${p.fecha}, Usuario: ${p.usuario}, Libros: ${p.libros}`);
      });
    } else {
      console.log('ℹ️ No se encontraron préstamos en este rango');
    }
    
    res.json(rows);
    
  } catch (err) {
    console.error('❌ Error préstamos:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.informeUsuarios = async (req, res) => {
  try {
    const { year, month } = req.query;
    console.log(`🎯 SOLICITUD USUARIOS: year=${year}, month=${month}`);
    
    if (!year || !month) return res.status(400).json({ error: 'Faltan parámetros' });

    const [y, m] = rangoMes(year, month);

    const rows = await queryAsync(
      `SELECT 
        u.id_usuario, 
        u.nombre, 
        u.correo, 
        u.rol,
        COUNT(p.id_prestamo) AS prestamos_mes
       FROM usuario u
       LEFT JOIN prestamo p ON p.id_usuario = u.id_usuario AND YEAR(p.fecha) = ? AND MONTH(p.fecha) = ?
       GROUP BY u.id_usuario
       ORDER BY prestamos_mes DESC, u.nombre ASC`, 
      [y, m]
    );

    console.log(`✅ USUARIOS ENCONTRADOS: ${rows.length}`);
    res.json(rows);
    
  } catch (err) {
    console.error('❌ Error usuarios:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.informeLibros = async (req, res) => {
  try {
    const { year, month } = req.query;
    console.log(`🎯 SOLICITUD LIBROS: year=${year}, month=${month}`);
    
    if (!year || !month) return res.status(400).json({ error: 'Faltan parámetros' });

    const [y, m] = rangoMes(year, month);

    const rows = await queryAsync(
      `SELECT 
        l.id_libro, 
        l.titulo, 
        l.autor, 
        c.nombre AS categoria,
        l.ejemplares,
        (SELECT COUNT(*) FROM detalle_prestamo dp JOIN prestamo p ON p.id_prestamo = dp.id_prestamo WHERE dp.id_libro = l.id_libro AND YEAR(p.fecha) = ? AND MONTH(p.fecha) = ?) AS prestamos_mes
       FROM libro l
       LEFT JOIN categoria c ON c.id_categoria = l.id_categoria
       ORDER BY prestamos_mes DESC, l.titulo ASC`, 
      [y, m]
    );

    console.log(`✅ LIBROS ENCONTRADOS: ${rows.length}`);
    res.json(rows);
    
  } catch (err) {
    console.error('❌ Error libros:', err);
    res.status(500).json({ error: err.message });
  }
};

// Endpoint raíz
exports.generarInformes = async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) return res.status(400).json({ error: 'Faltan parámetros: year y month' });

    const [y, m] = rangoMes(year, month);

    console.log(`📊 Generando informe completo para año=${y}, mes=${m}`);

    const [
      usuarios,
      prestamos,
      libros,
      prestamos_por_dia,
      top_libros
    ] = await Promise.all([
      queryAsync(
        `SELECT u.id_usuario, u.nombre, u.correo, u.rol, COUNT(p.id_prestamo) AS prestamos_mes
         FROM usuario u
         LEFT JOIN prestamo p ON p.id_usuario = u.id_usuario AND YEAR(p.fecha) = ? AND MONTH(p.fecha) = ?
         GROUP BY u.id_usuario
         ORDER BY prestamos_mes DESC, u.nombre ASC`, 
        [y, m]
      ),
      queryAsync(
        `SELECT p.id_prestamo, p.fecha, p.fecha_vencimiento, u.nombre AS usuario,
                (SELECT COUNT(*) FROM detalle_prestamo WHERE id_prestamo = p.id_prestamo) AS libros
         FROM prestamo p
         LEFT JOIN usuario u ON u.id_usuario = p.id_usuario
         WHERE YEAR(p.fecha) = ? AND MONTH(p.fecha) = ?
         ORDER BY p.fecha DESC`, 
        [y, m]
      ),
      queryAsync(
        `SELECT l.id_libro, l.titulo, l.autor, c.nombre AS categoria, l.ejemplares,
                (SELECT COUNT(*) FROM detalle_prestamo dp JOIN prestamo p ON p.id_prestamo = dp.id_prestamo WHERE dp.id_libro = l.id_libro AND YEAR(p.fecha) = ? AND MONTH(p.fecha) = ?) AS prestamos_mes
         FROM libro l
         LEFT JOIN categoria c ON c.id_categoria = l.id_categoria
         ORDER BY prestamos_mes DESC, l.titulo ASC`, 
        [y, m]
      ),
      queryAsync(
        `SELECT DATE(fecha) AS dia, COUNT(*) AS total
         FROM prestamo
         WHERE YEAR(fecha) = ? AND MONTH(fecha) = ?
         GROUP BY DATE(fecha)
         ORDER BY DATE(fecha)`, 
        [y, m]
      ),
      queryAsync(
        `SELECT l.titulo, l.autor, COUNT(*) AS total
         FROM detalle_prestamo dp
         JOIN prestamo p ON p.id_prestamo = dp.id_prestamo
         JOIN libro l ON dp.id_libro = l.id_libro
         WHERE YEAR(p.fecha) = ? AND MONTH(p.fecha) = ?
         GROUP BY l.id_libro
         ORDER BY total DESC
         LIMIT 5`, 
        [y, m]
      )
    ]);

    // Obtener totales
    const usuariosResult = await queryAsync(`SELECT COUNT(*) AS total_usuarios FROM usuario`);
    const librosResult = await queryAsync(`SELECT COUNT(*) AS total_libros FROM libro`);
    const prestamosResult = await queryAsync(`SELECT COUNT(*) AS total_prestamos FROM prestamo WHERE YEAR(fecha) = ? AND MONTH(fecha) = ?`, [y, m]);

    console.log(`✅ Informe completo generado: ${prestamos.length} préstamos`);

    res.json({
      resumen: {
        total_usuarios: usuariosResult[0]?.total_usuarios || 0,
        total_libros: librosResult[0]?.total_libros || 0,
        total_prestamos_mes: prestamosResult[0]?.total_prestamos || 0
      },
      prestamos_por_dia,
      top_libros,
      usuarios,
      libros,
      prestamos
    });
  } catch (err) {
    console.error('❌ Error al generar informes:', err);
    res.status(500).json({ error: 'Error al generar los informes' });
  }
};