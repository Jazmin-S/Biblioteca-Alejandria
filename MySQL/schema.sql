-- 🔥 Borrar base de datos existente
DROP DATABASE IF EXISTS biblioteca;

-- 📌 Crear base de datos
CREATE DATABASE biblioteca CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE biblioteca;

-- 📌 Crear tabla de Categorías
CREATE TABLE CATEGORIA (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  portada VARCHAR(255) DEFAULT NULL
);

-- 📌 Crear tabla de Libros
CREATE TABLE LIBRO (
  id_libro INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  autor VARCHAR(255) NOT NULL,
  anio_edicion INT NOT NULL,
  descripcion TEXT,
  editorial VARCHAR(255),
  id_categoria INT,
  portada VARCHAR(255),
  FOREIGN KEY (id_categoria) REFERENCES CATEGORIA(id_categoria)
);

-- 📌 Crear tabla de Usuarios
CREATE TABLE USUARIO (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    rol ENUM('alumno','profesor','bibliotecario') DEFAULT 'alumno',
    contrasena VARCHAR(255) NOT NULL,
    num_prestamos INT DEFAULT 0
);

-- 📌 Crear tabla de Préstamos
CREATE TABLE PRESTAMO (
    id_prestamo INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    fecha DATE NOT NULL,
    total_prestamos INT,
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
);

-- 📌 Crear tabla de Detalle de Préstamos
CREATE TABLE DETALLE_PRESTAMO (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_prestamo INT,
    id_libro INT,
    FOREIGN KEY (id_prestamo) REFERENCES PRESTAMO(id_prestamo),
    FOREIGN KEY (id_libro) REFERENCES LIBRO(id_libro)
);
