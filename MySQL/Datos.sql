USE biblioteca;

-- Insertar datos en la tabla LIBRO
INSERT INTO LIBRO (nombre, autor, anio_edicion, titulo, descripcion, editorial) VALUES
('Cien años de soledad', 'Gabriel García Márquez', 1967, 'Cien años de soledad', 'Novela que narra la historia de la familia Buendía en el pueblo ficticio de Macondo', 'Sudamericana'),
('Crimen y castigo', 'Fiódor Dostoyevski', 1866, 'Crimen y castigo', 'Novela psicológica sobre un estudiante que comete un crimen y sus consecuencias morales', 'The Russian Messenger'),
('Física Universitaria', 'Sears y Zemansky', 2016, 'Física Universitaria Vol. 1', 'Libro de texto para cursos introductorios de física', 'Pearson'),
('Cálculo', 'Stewart', 2015, 'Cálculo de una variable', 'Tratamiento completo del cálculo diferencial e integral', 'Cengage Learning');

-- Insertar datos de usuarios
INSERT INTO USUARIO (nombre, correo, rol, contrasena, num_prestamos) VALUES
('Ana Rodríguez', 'ana.rodriguez@profesor.uv.com', 'profesor', 'bib123pass', 0),
('Jazmin Sarmiento', 'jazmin.sarmiento@administrador.uv.com', 'bibliotecario', 'adminpass', 0),
('Pedro Sánchez', 'pedro.sanchez@estudiantes.uv.com', 'alumno', 'pedro789', 0);

-- Insertar datos en la tabla PRESTAMO
INSERT INTO PRESTAMO (id_usuario, fecha, total_prestamos) VALUES
(6, '2024-02-10', 1),  -- Pedro Sánchez (id_usuario 3) con 1 préstamo
(6, '2024-01-20', 2);  -- Pedro Sánchez con 2 préstamos más

-- Insertar datos en la tabla DETALLE_PRESTAMO
-- Asumiendo que los IDs de libros son: 1=Cien años, 2=Crimen, 3=Física, 4=Cálculo
INSERT INTO DETALLE_PRESTAMO (id_prestamo, id_libro) VALUES
(1, 5),  -- Primer préstamo de Pedro: Cien años de soledad
(2, 6),  -- Segundo préstamo de Pedro: Crimen y castigo
(2, 7);  -- Segundo préstamo de Pedro: Física Universitaria (2 libros en el mismo préstamo)

SELECT * FROM LIBRO;
SELECT * FROM PRESTAMO;
SELECT * FROM USUARIO;
SELECT * FROM DETALLE_PRESTAMO;

SELECT id_libro, nombre FROM LIBRO;

-- CONSULTAS
-- CONSULTA: LIBROS MÁS PRESTADOS
SELECT 
    l.nombre AS libro,
    l.autor,
    COUNT(dp.id_libro) AS veces_prestado
FROM LIBRO l
LEFT JOIN DETALLE_PRESTAMO dp ON l.id_libro = dp.id_libro
GROUP BY l.id_libro
ORDER BY veces_prestado DESC;

-- SUARIOS CON MÁS PRÉSTAMOS
SELECT 
    u.nombre,
    u.correo,
    u.rol,
    COUNT(p.id_prestamo) AS total_prestamos_realizados,
    SUM(p.total_prestamos) AS total_libros_prestados
FROM USUARIO u
LEFT JOIN PRESTAMO p ON u.id_usuario = p.id_usuario
GROUP BY u.id_usuario
ORDER BY total_prestamos_realizados DESC;

