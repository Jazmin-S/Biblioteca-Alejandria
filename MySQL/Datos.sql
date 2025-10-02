-- =====================================================
-- 🚀 Datos de inserción
-- =====================================================

-- Categorías
INSERT INTO CATEGORIA (nombre, portada) VALUES
('Cosmos', '/images/categorias/cosmos.jpg'),
('Psicología', '/images/categorias/psicologia.jpg'),
('Matemáticas', '/images/categorias/matematicas.jpg'),
('Medicina', '/images/categorias/medicina.jpg'),
('Economía', '/images/categorias/economia.jpg'),
('Pedagogía', '/images/categorias/pedagogia.jpg');

-- Libros
INSERT INTO LIBRO (nombre, titulo, autor, anio_edicion, descripcion, editorial, id_categoria, portada) VALUES
('Carl Sagan - Cosmos', 'Cosmos', 'Carl Sagan', 1980, 'Un viaje por el universo y la ciencia.', 'Random House', 1, '/images/portadas/cosmos.jpg'),
('Sigmund Freud - La interpretación de los sueños', 'La interpretación de los sueños', 'Sigmund Freud', 1899, 'Obra clásica de la psicología.', 'Alianza Editorial', 2, '/images/portadas/freud.jpg'),
('Álgebra Baldor', 'Álgebra', 'Aurelio Baldor', 1941, 'Libro fundamental de matemáticas.', 'Grupo Patria', 3, '/images/portadas/baldor.jpg'),
('Anatomía Humana', 'Principios de Anatomía', 'Gerard J. Tortora', 2018, 'Referencia esencial en medicina.', 'McGraw-Hill', 4, '/images/portadas/tortora.jpg'),
('Principios de Economía', 'Economía', 'Paul Samuelson', 1992, 'Introducción a la economía moderna.', 'McGraw-Hill', 5, '/images/portadas/samuelson.jpg'),
('Didáctica General', 'Didáctica General', 'César Coll', 2000, 'Fundamentos de la enseñanza y pedagogía.', 'Editorial Paidós', 6, '/images/portadas/didactica.jpg');

-- Usuarios
INSERT INTO USUARIO (nombre, correo, rol, contrasena, num_prestamos) VALUES
('Juan Pérez', 'juan@gmail.com', 'alumno', '12345678', 0),
('María López', 'maria@gmail.com', 'profesor', '12345678', 0),
('Ana Torres', 'ana@gamil.com', 'bibliotecario', '12345678', 0),
('Jazmin Sarmiento', 'jazminsar54@gmail.com', 'bibliotecario', '12345678', 0);

-- Préstamos de ejemplo
INSERT INTO PRESTAMO (id_usuario, fecha, total_prestamos) VALUES
(1, '2025-09-01', 1),
(2, '2025-09-05', 2);

-- Detalle de préstamos
INSERT INTO DETALLE_PRESTAMO (id_prestamo, id_libro) VALUES
(1, 1), -- Juan pidió "Cosmos"
(2, 2), -- María pidió "La interpretación de los sueños"
(2, 3); -- María pidió "Álgebra"

SELECT * FROM USUARIO;
