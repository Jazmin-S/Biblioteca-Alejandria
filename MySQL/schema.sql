--- CREACION DE TABLAS 

CREATE DATABASE IF NOT EXISTS biblioteca CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE biblioteca;

CREATE TABLE LIBRO (
    id_libro INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    autor VARCHAR(100),
    anio_edicion INT,
    titulo VARCHAR(150),
    descripcion TEXT,
    editorial VARCHAR(100)
);

CREATE TABLE USUARIO (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    rol ENUM('alumno','profesor','bibliotecario') DEFAULT 'alumno',
    contrasena VARCHAR(255) NOT NULL,
    num_prestamos INT DEFAULT 0
);

CREATE TABLE PRESTAMO (
    id_prestamo INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    fecha DATE NOT NULL,
    total_prestamos INT,
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
);

CREATE TABLE DETALLE_PRESTAMO (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_prestamo INT,
    id_libro INT,
    FOREIGN KEY (id_prestamo) REFERENCES PRESTAMO(id_prestamo),
    FOREIGN KEY (id_libro) REFERENCES LIBRO(id_libro)
);


