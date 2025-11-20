// controllers/informacionController.js
const db = require("../MySQL/db");

// =============================
// CARGAR INFORMACIÓN COMPLETA
// =============================
exports.obtenerDatosCompletos = (req, res) => {
  const { id } = req.params;

  const queryUsuario = `
    SELECT 
      id_usuario,
      nombre,
      correo,
      rol,
      foto,
      descripcion,
      num_prestamos
    FROM usuario
    WHERE id_usuario = ?
  `;

  const queryPrestamos = `
    SELECT 
      p.id_prestamo,
      p.fecha,
      p.fecha_vencimiento,
      IF(p.fecha_vencimiento < CURDATE(), 'Vencido', 'Activo') AS estado,
      DATEDIFF(CURDATE(), p.fecha_vencimiento) AS dias_vencido,
      GROUP_CONCAT(l.titulo SEPARATOR ', ') AS libros
    FROM prestamo p
    LEFT JOIN detalle_prestamo dp ON p.id_prestamo = dp.id_prestamo
    LEFT JOIN libro l ON dp.id_libro = l.id_libro
    WHERE p.id_usuario = ?
    GROUP BY p.id_prestamo
  `;

  db.query(queryUsuario, [id], (err, userRes) => {
    if (err) return res.status(500).json({ error: "Error obteniendo usuario" });

    if (userRes.length === 0)
      return res.status(404).json({ error: "Usuario no encontrado" });

    const usuario = userRes[0];

    db.query(queryPrestamos, [id], (err, prestRes) => {
      if (err)
        return res.status(500).json({ error: "Error obteniendo préstamos" });

      // Calcular deuda
      let deuda = 0;
      prestRes.forEach((p) => {
        if (p.estado === "Vencido" && p.dias_vencido > 0) {
          deuda += p.dias_vencido * 3;
        }
      });

      res.json({
        usuario: { ...usuario, deudaTotal: deuda },
        prestamos: prestRes,
      });
    });
  });
};

// =============================
// GUARDAR DESCRIPCIÓN
// =============================
exports.guardarDescripcion = (req, res) => {
  const { id } = req.params;
  const { descripcion } = req.body;

  const query = "UPDATE usuario SET descripcion = ? WHERE id_usuario = ?";

  db.query(query, [descripcion, id], (err) => {
    if (err) return res.status(500).json({ error: "Error al guardar descripción" });
    res.json({ mensaje: "Descripción actualizada" });
  });
};

// =============================
// GUARDAR FOTO
// =============================
exports.guardarFoto = (req, res) => {
  const id = req.params.id;

  if (!req.file)
    return res.status(400).json({ error: "No se recibió imagen" });

  const rutaFoto = `/Images/${req.file.filename}`;

  const query = "UPDATE usuario SET foto = ? WHERE id_usuario = ?";

  db.query(query, [rutaFoto, id], (err) => {
    if (err) return res.status(500).json({ error: "Error al guardar foto" });

    res.json({ mensaje: "Foto actualizada", ruta: rutaFoto });
  });
};
