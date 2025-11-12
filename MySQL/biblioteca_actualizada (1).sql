CREATE DATABASE  IF NOT EXISTS `biblioteca` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `biblioteca`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: biblioteca
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `portada` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES (2,'Psicología','/images/portadas/1759388824168.webp'),(3,'Matemáticas','/images/portadas/1759388689616.avif'),(4,'Medicina','/images/portadas/1759388730230.webp'),(5,'Economía','/images/portadas/1759388652463.jpeg'),(6,'Pedagogía','/images/portadas/1759388812077.jpeg'),(14,'Filosofia','/images/portadas/1759388892803.jpg'),(15,'Pólitica','/images/portadas/1760167846601.jpg'),(17,'Ingeniería en Sistemas','/images/portadas/1762930005489.webp'),(18,'Derecho','/images/portadas/1762930078928.jpeg'),(19,'Arte y Diseño','/images/portadas/1762930127861.webp'),(20,'Ciencias Ambientales','/images/portadas/1762930159338.jpg'),(21,'Historia','/images/portadas/1762930193890.jpg'),(22,'Administración','/images/portadas/1762930247905.jpg');
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_prestamo`
--

DROP TABLE IF EXISTS `detalle_prestamo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_prestamo` (
  `id_detalle` int NOT NULL AUTO_INCREMENT,
  `id_prestamo` int DEFAULT NULL,
  `id_libro` int DEFAULT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `id_prestamo` (`id_prestamo`),
  KEY `id_libro` (`id_libro`),
  CONSTRAINT `detalle_prestamo_ibfk_1` FOREIGN KEY (`id_prestamo`) REFERENCES `prestamo` (`id_prestamo`),
  CONSTRAINT `detalle_prestamo_ibfk_2` FOREIGN KEY (`id_libro`) REFERENCES `libro` (`id_libro`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_prestamo`
--

LOCK TABLES `detalle_prestamo` WRITE;
/*!40000 ALTER TABLE `detalle_prestamo` DISABLE KEYS */;
INSERT INTO `detalle_prestamo` VALUES (14,12,14),(20,17,14),(22,19,3),(24,21,11),(26,23,11),(27,24,11),(30,27,11),(31,28,11);
/*!40000 ALTER TABLE `detalle_prestamo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `libro`
--

DROP TABLE IF EXISTS `libro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `libro` (
  `id_libro` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `autor` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `anio_edicion` int NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `editorial` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_categoria` int DEFAULT NULL,
  `portada` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ejemplares` int DEFAULT '1',
  PRIMARY KEY (`id_libro`),
  KEY `id_categoria` (`id_categoria`),
  CONSTRAINT `libro_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `libro`
--

LOCK TABLES `libro` WRITE;
/*!40000 ALTER TABLE `libro` DISABLE KEYS */;
INSERT INTO `libro` VALUES (1,'Carl Sagan - Cosmos','Cosmos','Carl Sagan',1980,'Un viaje por el universo y la ciencia.','Random House',14,'/images/portadas/1759387591117.jpg',8),(2,'Sigmund Freud - La interpretación de los sueños','La interpretación de los sueños','Sigmund Freud',1899,'Obra clásica de la psicología.','Alianza Editorial',2,'/images/portadas/1759387624985.jpg',8),(3,'Álgebra Baldor','Álgebra','Aurelio Baldor',1941,'Libro fundamental de matemáticas.','Grupo Patria',3,'/images/portadas/1759387126110.jpg',4),(11,'Principios de Economía','Economía','Paul Samuelson',1992,'Introducción a la economía moderna.','McGraw-Hill',5,'/images/portadas/1759387279821.jpeg',8),(12,'Didáctica General','Didáctica General','César Coll',2000,'Fundamentos de la enseñanza y pedagogía.','Editorial Paidós',6,'/images/portadas/1759387222243.png',7),(13,'Crítica de la razón pura','Kritik der reinen Vernunft','Immanuel Kant',1781,'La Crítica de la razón pura es la obra fundamental de Immanuel Kant y una de las más influyentes en la historia de la filosofía.\r\nEn ella, Kant analiza los límites y las capacidades del conocimiento humano. Esta obra inaugura el idealismo trascendental, una corriente que transformó la filosofía moderna y sirvió de base a autores posteriores como Hegel, Schopenhauer y Heidegger.','Fondo de Cultura Económica',14,'/images/portadas/1760167144857.jpg',11),(14,'La Musica ','Musica','Carl Sagan',2000,'Un libro.','Random House',14,'/images/portadas/1760399123437.jpg',7),(15,'Pensar rápido, pensar despacio','Pensar rápido, pensar despacio','Daniel Kahneman',2011,'Un análisis sobre cómo el cerebro toma decisiones y los sesgos cognitivos que afectan nuestro pensamiento.','Debate',2,'/images/portadas/1762902343306.gif',5),(16,'12 reglas para vivir','12 reglas para vivir','Jordan B. Peterson',2018,'Consejos psicológicos y filosóficos para dar sentido a la vida moderna.','Planeta',2,'/images/portadas/1762928058870.jpg',7),(17,'Cálculo de una variable','Cálculo de una variable','James Stewart ',2016,'Texto esencial para aprender cálculo diferencial e integral.','Cengage Learning',3,'/images/portadas/1762928217610.jpg',8),(18,'Introducción al Álgebra Lineal','Álgebra Lineal','Gilbert Strang',2013,'Obra clara y práctica para aprender los fundamentos del álgebra lineal.','Wellesley-Cambridge Press',3,'/images/portadas/1762928308712.jpg',9),(19,'Tratado de Fisiología Médica','Fisiología Médica','Guyton y Hall',2020,'Referencia principal para estudiantes de medicina sobre la fisiología humana.','Elsevier',4,'/images/portadas/1762929103189.jpg',10),(20,'Robbins y Cotran Patología estructural y funcional','Patología estructural y funcional','Robbins',2018,'Guía completa sobre los procesos patológicos y su relevancia clínica.','Elsevier',4,'/images/portadas/1762929198433.jpeg',10),(21,'El capital','El capital','Karl Marx',1867,'Análisis profundo del sistema capitalista y sus implicaciones sociales y económicas.','Siglo XXI Editores',5,'/images/portadas/1762929276505.jpg',10),(22,'Psicología y Pedagogía','Psicología y Pedagogía','Jean Piaget',1969,'Reflexión sobre el desarrollo cognitivo y su relación con el aprendizaje.','Paidós',6,'/images/portadas/1762929369617.jpg',8),(23,'Pedagogía del oprimido','Pedagogía del oprimido','Paulo Freire',1970,'Obra clave de la educación crítica que propone una enseñanza liberadora.','Siglo XXI Editores',6,'/images/portadas/1762929432108.jpg',10),(24,'Ética a Nicómaco','Ética a Nicómaco','Aristóteles',350,'Obra clásica que reflexiona sobre la virtud y la felicidad humana.','\'Gredos',14,'/images/portadas/1762929496457.jpg',14),(25,'Así habló Zaratustra','Así habló Zaratustra','Friedrich Nietzsche',1883,'Texto filosófico que introduce el concepto del superhombre y la muerte de Dios.','Alianza Editorial',14,'/images/portadas/1762929569082.jpeg',14),(26,'Segundo tratado sobre el gobierno civil','Segundo tratado sobre el gobierno civil','John Locke',1689,'Análisis sobre la libertad, la propiedad y el contrato social.','Alianza Editorial',15,'/images/portadas/1762929673233.jpg',15),(27,'Los orígenes del totalitarismo','Los orígenes del totalitarismo','Hannah Arendt',1951,'Investigación sobre los regímenes totalitarios del siglo XX.','Taurus',15,'/images/portadas/1762929739503.jpg',15),(28,'Código limpio: Manual de estilo para el desarrollo ágil de software','Código limpio','Robert C. Martin',2008,'Guía fundamental sobre buenas prácticas en programación y mantenimiento de código limpio.','Prentice Hall',17,'/images/portadas/1762930452656.jpg',16),(29,'Introducción a los algoritmos','Introducción a los algoritmos','Thomas H. Cormen',2009,'El clásico CLRS: libro de referencia en algoritmos y estructuras de datos.','MIT Press',17,'/images/portadas/1762930525442.jpg',16),(30,'Redes de computadoras','Redes de computadoras','Andrew S. Tanenbaum',2011,'Libro clave para aprender sobre redes, protocolos y arquitectura de comunicación.','Pearson',17,'/images/portadas/1762930595231.jpg',16),(31,'Teoría general del derecho','Teoría general del derecho','Norberto Bobbio',1997,'Introducción clara a los conceptos fundamentales del derecho moderno.','Editorial Trotta',18,'/images/portadas/1762930680160.jpg',17),(32,'Teoría pura del derecho','Teoría pura del derecho','Hans Kelsen',1960,'Obra central en la filosofía del derecho, donde se desarrolla la noción de norma jurídica.','Editorial Porrúa',18,'/images/portadas/1762930760815.gif',17),(33,'El arte del color','El arte del color','Johannes Itten',1961,'Teoría esencial sobre el uso del color en el arte y el diseño moderno.','Ediciones Paidós',19,'/images/portadas/1762930834038.jpg',19),(34,'Fundamentos del diseño','Fundamentos del diseño','Wucius Wong',1993,'Base teórica para la composición visual, estructura y forma en diseño gráfico.','GG Diseño',19,'/images/portadas/1762930929604.jpg',19),(35,'Primavera silenciosa','Primavera silenciosa','Rachel Carson',1962,'Obra que impulsó el movimiento ecologista moderno denunciando el uso de pesticidas.','ditorial Crítica',20,'/images/portadas/1762931012178.jpeg',21),(36,'Colapso: por qué unas sociedades perduran y otras desaparecen','Colapso','Jared Diamond',2005,'Estudio sobre las causas ambientales y sociales que han llevado al colapso de civilizaciones.','Debate',20,'/images/portadas/1762931089695.jpg',21),(37,'Sapiens: De animales a dioses','Sapiens','Yuval Noah Harari',2014,'Recorrido histórico sobre la evolución del ser humano y las sociedades.','Debate',21,'/images/portadas/1762931179795.jpg',23),(38,'La era de la revolución 1789–1848','La era de la revolución','Eric Hobsbawm',1962,'Análisis de los cambios sociales, económicos y políticos que marcaron el inicio de la era moderna.','Crítica',21,'/images/portadas/1762931260360.webp',23),(39,'Fundamentos de administración\'','Fundamentos de administración\'','Koontz y Weihrich',2012,'Una referencia esencial que explica los principios, funciones y procesos administrativos con un enfoque moderno.','McGraw-Hill',22,'/images/portadas/1762931390470.jpg',18),(40,'La práctica de la administración','La práctica de la administración','Peter Drucker ',1954,'Obra fundamental que define los principios de la administración moderna, el liderazgo y la efectividad organizacional.','HarperCollins',22,'/images/portadas/1762931484206.jpg',18);
/*!40000 ALTER TABLE `libro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prestamo`
--

DROP TABLE IF EXISTS `prestamo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prestamo` (
  `id_prestamo` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `fecha` date NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `total_prestamos` int DEFAULT '0',
  `entregado` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id_prestamo`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `prestamo_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prestamo`
--

LOCK TABLES `prestamo` WRITE;
/*!40000 ALTER TABLE `prestamo` DISABLE KEYS */;
INSERT INTO `prestamo` VALUES (12,2,'2025-10-23','2025-11-07',1,0),(17,1,'2025-10-23','2025-11-07',1,0),(19,7,'2025-10-23','2025-07-10',1,1),(21,2,'2025-10-23','2025-11-07',1,0),(23,2,'2025-10-28','2025-10-29',1,0),(24,12,'2025-11-04','2025-11-19',1,0),(27,12,'2025-11-09','2025-11-10',1,0),(28,16,'2025-11-09','2025-11-10',1,0);
/*!40000 ALTER TABLE `prestamo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` enum('alumno','profesor','bibliotecario') COLLATE utf8mb4_unicode_ci DEFAULT 'alumno',
  `contrasena` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `num_prestamos` int DEFAULT '0',
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'Juan Lopez','juan@gmail.com','alumno','12345678',0),(2,'María López','maria@gmail.com','profesor','12345678',0),(7,'Jazmin Sarmiento','jazminsar54@gmail.com','bibliotecario','$2a$10$..9H32sLI9RQCGD4XrwHDOQtKJDEu/7gx1sqkJ35BshNJiXHWLjrO',0),(12,'Gael','gaelmorales70@gmail.com','bibliotecario','Gael123.',0),(15,'Isai','Isai@gmail.com','bibliotecario','$2a$10$whUH.mqW.EQjgr9.W4PyI.fuKx8xUoYi3nE1jt.H84cAUMFZ1ha5C',0),(16,'Noel','Noel@gmail.com','bibliotecario','$2a$10$MOFVr7WnDVNabNBei1CPSuUdkWjXrCf7Hw6eSLnLetuKxN5hUoCD.',0),(17,'Israel','israel@gmail.com','alumno','$2a$10$ig80TPm/4X1Wdb4AA.II5.KyrEE4/sgmuv.jfzUYKwjXPBGNY88FS',0),(18,'Joel','joel@gmail.com','profesor','$2a$10$hqNa3ST/4geR9IRradUdy.pU8/EXxkKRoeBVrxPQC5etLA68H2r.C',0);
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-12 14:20:19
