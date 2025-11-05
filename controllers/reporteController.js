const connection = require('../MySQL/db');

// Función para ejecutar una consulta como promesa (para usar con Promise.all)
function queryAsync(sql) {
  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

// 📈 Generar el reporte de estadísticas
exports.generarReporte = async (req, res) => {
  try {
    // Definimos todas las consultas que necesitamos
    const queries = {
      // 1. Estadísticas de Libros
      stats_libros: `SELECT COUNT(*) AS total_libros, SUM(ejemplares) AS total_ejemplares FROM LIBRO`,
      
      // 2. Estadísticas de Usuarios
      stats_usuarios: `SELECT COUNT(*) AS total_usuarios FROM USUARIO`,
      
      // 3. Estadísticas de Préstamos Activos
      stats_activos: `SELECT COUNT(*) AS prestamos_activos FROM PRESTAMO WHERE (entregado = 0 OR entregado IS NULL)`,
      
      // 4. Lista de Préstamos Vencidos (para cálculo y lista)
      lista_vencidos: `
        SELECT 
          p.id_prestamo, u.nombre, p.fecha_vencimiento, 
          DATEDIFF(CURDATE(), p.fecha_vencimiento) AS dias_retraso, 
          COUNT(l.id_libro) AS numero_libros,
          GROUP_CONCAT(l.titulo SEPARATOR '; ') AS libros 
        FROM PRESTAMO p
        JOIN USUARIO u ON p.id_usuario = u.id_usuario
        JOIN DETALLE_PRESTAMO dp ON p.id_prestamo = dp.id_prestamo
        JOIN LIBRO l ON dp.id_libro = l.id_libro
        WHERE (p.entregado = 0 OR p.entregado IS NULL) AND p.fecha_vencimiento < CURDATE()
        GROUP BY p.id_prestamo, u.nombre, p.fecha_vencimiento
        ORDER BY dias_retraso DESC
      `,
      
      // 5. Lista de Préstamos Activos (Vigentes)
      lista_activos: `
        SELECT 
          p.id_prestamo, u.nombre, p.fecha_vencimiento, 
          GROUP_CONCAT(l.titulo SEPARATOR '; ') AS libros 
        FROM PRESTAMO p
        JOIN USUARIO u ON p.id_usuario = u.id_usuario
        JOIN DETALLE_PRESTAMO dp ON p.id_prestamo = dp.id_prestamo
        JOIN LIBRO l ON dp.id_libro = l.id_libro
        WHERE (p.entregado = 0 OR p.entregado IS NULL) AND p.fecha_vencimiento >= CURDATE()
        GROUP BY p.id_prestamo, u.nombre, p.fecha_vencimiento
        ORDER BY p.fecha_vencimiento ASC
      `,

      // 6. Lista de Todos los Usuarios (Usa 'correo')
      lista_usuarios: `SELECT nombre, correo FROM USUARIO ORDER BY nombre ASC`,
      
      // 7. Lista de Usuarios Deudores (Usa 'correo')
      lista_deudores: `
        SELECT DISTINCT u.nombre, u.correo 
        FROM USUARIO u
        JOIN PRESTAMO p ON u.id_usuario = p.id_usuario
        WHERE (p.entregado = 0 OR p.entregado IS NULL) AND p.fecha_vencimiento < CURDATE()
        ORDER BY u.nombre ASC
      `,

      // 8. ❗ NUEVO: Lista de Libros Disponibles
      lista_libros_disponibles: `
        SELECT titulo, autor, ejemplares 
        FROM LIBRO 
        WHERE ejemplares > 0 
        ORDER BY titulo ASC
      `,
      
      // 9. ❗ NUEVO: Lista de Categorías
      lista_categorias: `SELECT nombre FROM CATEGORIA ORDER BY nombre ASC`
    };

    // Ejecutamos todas las consultas en paralelo
    const [
      [stats_libros],
      [stats_usuarios],
      [stats_activos],
      lista_vencidos,
      lista_activos,
      lista_usuarios,
      lista_deudores,
      lista_libros_disponibles, // ❗ NUEVO
      lista_categorias           // ❗ NUEVO
    ] = await Promise.all([
      queryAsync(queries.stats_libros),
      queryAsync(queries.stats_usuarios),
      queryAsync(queries.stats_activos),
      queryAsync(queries.lista_vencidos),
      queryAsync(queries.lista_activos),
      queryAsync(queries.lista_usuarios),
      queryAsync(queries.lista_deudores),
      queryAsync(queries.lista_libros_disponibles), // ❗ NUEVO
      queryAsync(queries.lista_categorias)          // ❗ NUEVO
    ]);

    // Cálculo de adeudos totales (basado en la lista_vencidos)
    let montoTotalAdeudos = 0;
    lista_vencidos.forEach(p => {
      if (p.dias_retraso > 3) {
        const multaPorLibro = (p.dias_retraso - 3) * 3;
        montoTotalAdeudos += (multaPorLibro * p.numero_libros);
      }
    });

    // Consolidar todo en un solo objeto
    const reporte = {
      // Estadísticas
      total_libros: stats_libros.total_libros || 0,
      total_ejemplares: stats_libros.total_ejemplares || 0,
      total_usuarios: stats_usuarios.total_usuarios || 0,
      prestamos_activos: (stats_activos.prestamos_activos || 0) + lista_vencidos.length,
      prestamos_vencidos: lista_vencidos.length || 0,
      monto_total_adeudos: montoTotalAdeudos.toFixed(2),
      
      // Listas
      lista_vencidos: lista_vencidos,
      lista_activos: lista_activos,
      lista_usuarios: lista_usuarios,
      lista_deudores: lista_deudores,
      lista_libros_disponibles: lista_libros_disponibles, // ❗ NUEVO
      lista_categorias: lista_categorias               // ❗ NUEVO
    };

    res.json(reporte);

  } catch (err) {
    console.error('❌ Error al generar reporte:', err);
    res.status(500).json({ error: 'Error al generar el reporte' });
  }
};