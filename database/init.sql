-- ============================================
-- RoomStay - Base de datos MySQL (XAMPP)
-- ============================================

CREATE DATABASE IF NOT EXISTS roomstay
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE roomstay;

-- Tabla: roles
CREATE TABLE IF NOT EXISTS roles (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(20) NOT NULL UNIQUE,
  description VARCHAR(100) NULL,
  createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Insertar roles por defecto
INSERT INTO roles (name, description) VALUES
  ('user',  'Usuario (Cliente) - Busca y reserva habitaciones'),
  ('host',  'Hospedador (Anfitrión) - Publica y gestiona sus propiedades'),
  ('admin', 'Administrador - Gestiona habitaciones, usuarios y reportes')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Tabla: usuarios
-- NOTA: 'role' es VARCHAR(20) (no ENUM) para poder ser referenciado
-- como FOREIGN KEY hacia roles.name (mismo tipo de dato requerido por MySQL).
CREATE TABLE IF NOT EXISTS usuarios (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  firstName       VARCHAR(50)  NOT NULL,
  lastName        VARCHAR(50)  NOT NULL,
  documentType    VARCHAR(20)  NOT NULL,
  documentNumber  VARCHAR(20)  NOT NULL UNIQUE,
  address         VARCHAR(100) NOT NULL,
  phone           VARCHAR(20)  NOT NULL,
  email           VARCHAR(100) NOT NULL UNIQUE,
  password        VARCHAR(255) NOT NULL,
  role            VARCHAR(20) NOT NULL DEFAULT 'user',
  estado          VARCHAR(10) NOT NULL DEFAULT 'activo',
  createdAt       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_document (documentNumber),
  INDEX idx_role (role),
  INDEX idx_estado (estado),
  CONSTRAINT chk_usuario_estado CHECK (estado IN ('activo', 'inactivo')),
  CONSTRAINT fk_usuario_role FOREIGN KEY (role) REFERENCES roles(name) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Tabla: habitaciones
CREATE TABLE IF NOT EXISTS habitaciones (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  hostId      INT UNSIGNED   NULL,
  titulo      VARCHAR(150)   NOT NULL,
  descripcion TEXT           NOT NULL,
  precio      DECIMAL(12,2)  NOT NULL,
  ubicacion   VARCHAR(100)   NOT NULL,
  capacidad   INT UNSIGNED   NOT NULL DEFAULT 1,
  tipo        VARCHAR(50)    NOT NULL,
  servicios   JSON           NULL,
  imageUrl    VARCHAR(500)   NOT NULL,
  disponible  TINYINT(1)     DEFAULT 1,
  createdAt   DATETIME       DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tipo (tipo),
  INDEX idx_precio (precio),
  INDEX idx_host (hostId),
  CONSTRAINT fk_habitacion_host FOREIGN KEY (hostId) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabla: reservaciones
CREATE TABLE IF NOT EXISTS reservaciones (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  userId         INT UNSIGNED NOT NULL,
  habitacionId   INT UNSIGNED NOT NULL,
  fechaIngreso   DATE         NOT NULL,
  fechaSalida    DATE         NOT NULL,
  huespedes      INT UNSIGNED NOT NULL DEFAULT 1,
  precioNoche    DECIMAL(12,2) NOT NULL,
  totalNoches    INT UNSIGNED NOT NULL,
  total          DECIMAL(12,2) NOT NULL,
  estado         ENUM('pendiente', 'confirmada', 'pagada', 'cancelada', 'completada') DEFAULT 'pendiente',
  notas          VARCHAR(500) NULL,
  createdAt      DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updatedAt      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (userId),
  INDEX idx_habitacion (habitacionId),
  INDEX idx_fechas (fechaIngreso, fechaSalida),
  INDEX idx_estado (estado),
  CONSTRAINT fk_reserva_usuario    FOREIGN KEY (userId)       REFERENCES usuarios(id)     ON DELETE CASCADE,
  CONSTRAINT fk_reserva_habitacion FOREIGN KEY (habitacionId) REFERENCES habitaciones(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla: contactos (mensajes del formulario)
CREATE TABLE IF NOT EXISTS contactos (
  id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre    VARCHAR(100) NOT NULL,
  email     VARCHAR(100) NOT NULL,
  telefono  VARCHAR(20)  NULL,
  asunto    VARCHAR(100) NOT NULL,
  mensaje   TEXT         NOT NULL,
  userId    INT UNSIGNED NULL,
  createdAt DATETIME     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_user (userId),
  CONSTRAINT fk_contacto_user FOREIGN KEY (userId) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tabla: recuperacion_contrasenas
CREATE TABLE IF NOT EXISTS recuperacion_contrasenas (
  id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email     VARCHAR(100) NOT NULL,
  token     VARCHAR(255) NOT NULL UNIQUE,
  usado     TINYINT(1)   DEFAULT 0,
  expiresAt DATETIME     NOT NULL,
  createdAt DATETIME     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_token (token)
) ENGINE=InnoDB;

-- Tabla: favoritos
CREATE TABLE IF NOT EXISTS favoritos (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  userId       INT UNSIGNED NOT NULL,
  habitacionId INT UNSIGNED NOT NULL,
  createdAt    DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_habitacion (userId, habitacionId),
  CONSTRAINT fk_fav_user FOREIGN KEY (userId) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_fav_habitacion FOREIGN KEY (habitacionId) REFERENCES habitaciones(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla: ventas
CREATE TABLE IF NOT EXISTS ventas (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  numeroVenta   VARCHAR(30) NOT NULL UNIQUE,
  userId        INT UNSIGNED NOT NULL,
  reservationId INT UNSIGNED NULL,
  hostId        INT UNSIGNED NULL,
  fechaVenta    DATE NOT NULL,
  subTotal      DECIMAL(12,2) NOT NULL DEFAULT 0,
  descuento     DECIMAL(12,2) NOT NULL DEFAULT 0,
  impuestos     DECIMAL(12,2) NOT NULL DEFAULT 0,
  total         DECIMAL(12,2) NOT NULL,
  metodoPago    VARCHAR(30) NOT NULL DEFAULT 'transferencia',
  estado        ENUM('pendiente','completada','cancelada','reembolsada') DEFAULT 'completada',
  observaciones VARCHAR(500) NULL,
  createdBy     INT UNSIGNED NULL,
  createdAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_numero (numeroVenta),
  INDEX idx_user (userId),
  INDEX idx_reservation (reservationId),
  INDEX idx_host (hostId),
  INDEX idx_fecha (fechaVenta),
  INDEX idx_estado (estado),
  CONSTRAINT fk_venta_user FOREIGN KEY (userId) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_venta_reserva FOREIGN KEY (reservationId) REFERENCES reservaciones(id) ON DELETE SET NULL,
  CONSTRAINT fk_venta_host FOREIGN KEY (hostId) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tabla: detalle_ventas
CREATE TABLE IF NOT EXISTS detalle_ventas (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  saleId         INT UNSIGNED NOT NULL,
  habitacionId   INT UNSIGNED NULL,
  descripcion    VARCHAR(250) NOT NULL,
  tipo           VARCHAR(30) NOT NULL DEFAULT 'habitacion',
  cantidad       INT UNSIGNED NOT NULL DEFAULT 1,
  precioUnitario DECIMAL(12,2) NOT NULL,
  descuento      DECIMAL(12,2) NOT NULL DEFAULT 0,
  impuesto       DECIMAL(12,2) NOT NULL DEFAULT 0,
  subtotal       DECIMAL(12,2) NOT NULL,
  total          DECIMAL(12,2) NOT NULL,
  INDEX idx_sale (saleId),
  INDEX idx_habitacion (habitacionId),
  CONSTRAINT fk_detalle_venta FOREIGN KEY (saleId) REFERENCES ventas(id) ON DELETE CASCADE,
  CONSTRAINT fk_detalle_habitacion FOREIGN KEY (habitacionId) REFERENCES habitaciones(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tabla: facturas
CREATE TABLE IF NOT EXISTS facturas (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  numeroFactura    VARCHAR(30) NOT NULL UNIQUE,
  saleId           INT UNSIGNED NOT NULL,
  userId           INT UNSIGNED NOT NULL,
  fechaEmision     DATE NOT NULL,
  fechaVencimiento DATE NULL,
  subTotal         DECIMAL(12,2) NOT NULL DEFAULT 0,
  descuento        DECIMAL(12,2) NOT NULL DEFAULT 0,
  impuestos        DECIMAL(12,2) NOT NULL DEFAULT 0,
  total            DECIMAL(12,2) NOT NULL,
  estado           ENUM('pendiente','pagada','vencida','anulada') DEFAULT 'pagada',
  notas            VARCHAR(500) NULL,
  createdAt        DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_numero (numeroFactura),
  INDEX idx_sale (saleId),
  INDEX idx_user (userId),
  INDEX idx_fecha (fechaEmision),
  INDEX idx_estado (estado),
  CONSTRAINT fk_factura_venta FOREIGN KEY (saleId) REFERENCES ventas(id) ON DELETE CASCADE,
  CONSTRAINT fk_factura_user FOREIGN KEY (userId) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla: detalle_facturas
CREATE TABLE IF NOT EXISTS detalle_facturas (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoiceId      INT UNSIGNED NOT NULL,
  descripcion    VARCHAR(250) NOT NULL,
  cantidad       INT UNSIGNED NOT NULL DEFAULT 1,
  precioUnitario DECIMAL(12,2) NOT NULL,
  descuento      DECIMAL(12,2) NOT NULL DEFAULT 0,
  impuesto       DECIMAL(12,2) NOT NULL DEFAULT 0,
  subtotal       DECIMAL(12,2) NOT NULL,
  total          DECIMAL(12,2) NOT NULL,
  INDEX idx_invoice (invoiceId),
  CONSTRAINT fk_detalle_factura FOREIGN KEY (invoiceId) REFERENCES facturas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla: pqr (Peticiones, Quejas, Reclamos, Sugerencias)
CREATE TABLE IF NOT EXISTS pqr (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  numeroRadicado VARCHAR(30) NOT NULL UNIQUE,
  userId         INT UNSIGNED NOT NULL,
  tipo           ENUM('peticion','queja','reclamo','sugerencia') NOT NULL,
  titulo         VARCHAR(150) NOT NULL,
  descripcion    TEXT NOT NULL,
  estado         ENUM('pendiente','en_proceso','respondida','cerrada') DEFAULT 'pendiente',
  prioridad      VARCHAR(20) NOT NULL DEFAULT 'media',
  reservationId  INT UNSIGNED NULL,
  respuesta      TEXT NULL,
  answeredBy     INT UNSIGNED NULL,
  fechaRespuesta DATETIME NULL,
  createdAt      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_numero (numeroRadicado),
  INDEX idx_user (userId),
  INDEX idx_tipo (tipo),
  INDEX idx_estado (estado),
  INDEX idx_reservation (reservationId),
  CONSTRAINT fk_pqr_user FOREIGN KEY (userId) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_pqr_reserva FOREIGN KEY (reservationId) REFERENCES reservaciones(id) ON DELETE SET NULL,
  CONSTRAINT fk_pqr_admin FOREIGN KEY (answeredBy) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tabla: conversaciones (chatbot)
CREATE TABLE IF NOT EXISTS conversaciones (
  id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  userId    INT UNSIGNED NULL,
  sessionId VARCHAR(100) NOT NULL UNIQUE,
  titulo    VARCHAR(150) NULL,
  estado    VARCHAR(20) NOT NULL DEFAULT 'activa',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (userId),
  INDEX idx_session (sessionId),
  CONSTRAINT fk_conv_user FOREIGN KEY (userId) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tabla: mensajes (chatbot)
CREATE TABLE IF NOT EXISTS mensajes (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  conversationId INT UNSIGNED NOT NULL,
  remitente      ENUM('usuario','bot','sistema') NOT NULL,
  contenido      TEXT NOT NULL,
  tokensUsados   INT NULL,
  modelo         VARCHAR(50) NULL,
  esError        TINYINT(1) DEFAULT 0,
  createdAt      DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_conversation (conversationId),
  CONSTRAINT fk_msg_conv FOREIGN KEY (conversationId) REFERENCES conversaciones(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- Usuarios de prueba
-- Los 3 hashes de abajo fueron generados y verificados con bcryptjs
-- (10 salt rounds), y SÍ corresponden realmente a sus contraseñas.
-- Se insertan ANTES que las habitaciones porque el admin es
-- usado como hostId (@admin_id) en el seed de habitaciones.
-- ============================================

-- 1) Administrador
-- Email: admin@roomstay.com | Password: Admin123@
INSERT INTO usuarios (firstName, lastName, documentType, documentNumber, address, phone, email, password, role)
VALUES (
  'Administrador', 'RoomStay',
  'CC', '1234567890',
  'Calle 123 #45-67, Bogotá',
  '3001234567',
  'admin@roomstay.com',
  '$2b$10$0BCsC9JcPLHSely4YRnjWuuPttilqxRFlMPwMwOlKwieyvgUL3gyC',
  'admin'
);

-- 2) Usuario normal (solo reserva)
-- Email: usuario@roomstay.com | Password: User123@
INSERT INTO usuarios (firstName, lastName, documentType, documentNumber, address, phone, email, password, role)
VALUES (
  'Camila', 'Restrepo',
  'CC', '1098765432',
  'Carrera 45 #12-30, Medellín',
  '3109876543',
  'usuario@roomstay.com',
  '$2b$10$f11isojrFzJONej4/esQm.W7Zww7C3agwet76oQIAR9hJNRW.apN.',
  'user'
);

-- 3) Hospedador (publica y gestiona propiedades)
-- Email: hospedador@roomstay.com | Password: Host123@
INSERT INTO usuarios (firstName, lastName, documentType, documentNumber, address, phone, email, password, role)
VALUES (
  'Julián', 'Gómez',
  'CC', '1122334455',
  'Avenida 6 #23-10, Cali',
  '3201122334',
  'hospedador@roomstay.com',
  '$2b$10$S7xsUNdjwFknPIzbrRPd4eMpSE8Pj4kAsSyYakAstSmUKAd1i0HK.',
  'host'
);

SET @admin_id = (SELECT id FROM usuarios WHERE email='admin@roomstay.com' LIMIT 1);

-- ============================================
-- DATOS INICIALES: 10 habitaciones (igual que frontend)
-- ============================================

INSERT INTO habitaciones (hostId, titulo, descripcion, precio, ubicacion, capacidad, tipo, servicios, imageUrl, disponible) VALUES
(@admin_id,
  'Habitación Moderna Centro',
  'Acogedora habitación con diseño contemporáneo en el corazón de la ciudad, cerca de transporte y restaurantes.',
  85000, 'Bogotá, Chapinero', 2, 'Individual',
  '["WiFi","Baño privado","TV","Aire acondicionado"]',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
  1
),
(@admin_id,
  'Suite Ejecutiva Premium',
  'Amplia suite con zona de trabajo, cama king size y vistas panorámicas a la ciudad. Ideal para profesionales.',
  180000, 'Medellín, El Poblado', 2, 'Suite',
  '["WiFi","Escritorio","Spa","Desayuno","Gimnasio"]',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
  1
),
(@admin_id,
  'Loft Estilo Industrial',
  'Espacio abierto con techos altos, detalles de ladrillo y diseño industrial único. Para amantes del arte.',
  120000, 'Cali, San Antonio', 3, 'Loft',
  '["WiFi","Cocina","Terraza","Pet friendly"]',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
  1
),
(@admin_id,
  'Habitación Familiar',
  'Ideal para familias, con dos camas dobles y espacio amplio. Cerca de parques y atracciones.',
  140000, 'Cartagena, Getsemaní', 4, 'Familiar',
  '["WiFi","TV","Nevera","Aire acondicionado","Desayuno"]',
  'https://images.unsplash.com/photo-1617104678098-de229db51175?auto=format&fit=crop&w=1200&q=80',
  1
),
(@admin_id,
  'Estudio con Balcón',
  'Encantador estudio con balcón privado, cocina equipada y ambiente tranquilo. Perfecto para estancias largas.',
  95000, 'Barranquilla, El Prado', 2, 'Estudio',
  '["WiFi","Cocina","Balcón","Lavadora"]',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
  1
),
(@admin_id,
  'Habitación Económica',
  'Opción económica y cómoda con lo esencial. Excelente ubicación cerca al transporte público.',
  55000, 'Bucaramanga, Cabecera', 1, 'Económica',
  '["WiFi","Baño compartido","Lockers"]',
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
  1
),
(@admin_id,
  'Villa con Piscina',
  'Exclusiva villa privada con piscina, jardín tropical y 3 habitaciones. Para vacaciones inolvidables.',
  450000, 'Santa Marta, Rodadero', 6, 'Villa',
  '["Piscina","WiFi","Parrilla","Jardín","Cocina completa","Garaje"]',
  'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=80',
  1
),
(@admin_id,
  'Apartamento Amoblado',
  'Apartamento completo amoblado con todos los servicios. Como estar en casa, pero mejor.',
  160000, 'Pereira, Armenia', 4, 'Apartamento',
  '["WiFi","Cocina","Sala","Comedor","Lavadora","Garaje"]',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
  1
),
(@admin_id,
  'Habitación Boutique',
  'Diseño único y personalizado en habitación boutique. Detalles de lujo y atención exclusiva.',
  210000, 'Manizales, Palermo', 2, 'Boutique',
  '["WiFi","Jacuzzi","Desayuno gourmet","Room service","Vista"]',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
  1
),
(@admin_id,
  'Cabaña en la Montaña',
  'Escapa a la naturaleza en nuestra cabaña de madera. Chimenea, vistas y paz total.',
  135000, 'Guatapé, Antioquia', 3, 'Cabaña',
  '["Chimenea","WiFi","Cocina","Vista a la represa","Parrilla"]',
  'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
  1
);