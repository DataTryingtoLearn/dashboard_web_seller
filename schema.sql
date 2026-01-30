-- =====================================================
-- SQL Schema for Sophia Dashboard Application
-- =====================================================
-- This schema includes tables from multiple databases:
-- - web_react_dashboard: User management and authentication
-- - bbdd_sophia: Vacancy management and messaging
-- =====================================================

-- =====================================================
-- DATABASE: web_react_dashboard
-- =====================================================

-- Table: users_main (User Management & Authentication)
CREATE TABLE web_react_dashboard..users_main (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL, -- Hashed with bcrypt
    role VARCHAR(50) NOT NULL, -- 'admin', 'user', 'analyst'
    permission_level INT DEFAULT 1, -- 1, 3, 6, 8 (Super Admin)
    client_id INT NULL, -- Foreign key to Clients table
    fecha_registro DATETIME DEFAULT GETDATE()
);

-- Table: Clients (Multitenancy Support)
CREATE TABLE Clients (
    id INT PRIMARY KEY IDENTITY(1,1),
    name VARCHAR(255) NOT NULL,
    fecha_registro DATETIME DEFAULT GETDATE()
);

-- Table: UserLogs (Audit Trail)
CREATE TABLE UserLogs (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'LOGIN', 'LOGOUT', 'CREATE_USER', etc.
    details VARCHAR(255),
    ip_address VARCHAR(50),
    id_cliente INT NULL, -- Client ID for multitenancy tracking
    timestamp DATETIME DEFAULT GETDATE()
);

-- =====================================================
-- DATABASE: bbdd_sophia (Vacancy Module)
-- =====================================================

-- Table: Vacantes (Job Vacancies)
CREATE TABLE Vacantes (
    id INT PRIMARY KEY IDENTITY(1,1),
    client_id INT NOT NULL, -- Multitenancy
    nombre VARCHAR(255) NOT NULL,
    fecha_creacion DATETIME DEFAULT GETDATE(),
    estado VARCHAR(50) DEFAULT 'Abierta', -- 'Abierta', 'Cerrada', 'Pausada'
    CONSTRAINT FK_Vacantes_Clients FOREIGN KEY (client_id) REFERENCES Clients(id)
);

-- Table: CondicionesGenerales (Vacancy Conditions)
CREATE TABLE CondicionesGenerales (
    id INT PRIMARY KEY IDENTITY(1,1),
    vacante_id INT NOT NULL,
    sueldo DECIMAL(18, 2),
    bono DECIMAL(18, 2),
    horarios VARCHAR(MAX),
    beneficios VARCHAR(MAX),
    requisitos VARCHAR(MAX),
    documentacion VARCHAR(MAX),
    CONSTRAINT FK_Condiciones_Vacantes FOREIGN KEY (vacante_id) REFERENCES Vacantes(id) ON DELETE CASCADE
);

-- Table: FAQ_Dinamico (Dynamic FAQ for Vacancies)
CREATE TABLE FAQ_Dinamico (
    id INT PRIMARY KEY IDENTITY(1,1),
    vacante_id INT NOT NULL,
    pregunta VARCHAR(MAX) NOT NULL,
    respuesta VARCHAR(MAX) NOT NULL,
    palabras_clave VARCHAR(MAX),
    CONSTRAINT FK_FAQ_Vacantes FOREIGN KEY (vacante_id) REFERENCES Vacantes(id) ON DELETE CASCADE
);

-- Table: mensajes_out (Outbound Messages)
CREATE TABLE bbdd_sophia..mensajes_out (
    id INT PRIMARY KEY IDENTITY(1,1),
    remitente_wa_id VARCHAR(50) NOT NULL, -- WhatsApp ID of recipient
    mensaje_texto VARCHAR(MAX) NOT NULL,
    fecha_mensaje DATETIME DEFAULT GETDATE(),
    estado VARCHAR(50) DEFAULT 'PENDIENTE', -- 'PENDIENTE', 'ENVIADO', 'FALLIDO'
    Manual BIT DEFAULT 0, -- 0 = Automatic, 1 = Manual
    fecha_envio DATETIME NULL,
    error_mensaje VARCHAR(MAX) NULL
);

-- Create index for better query performance
CREATE INDEX IX_mensajes_out_wa_id ON bbdd_sophia..mensajes_out(remitente_wa_id);
CREATE INDEX IX_mensajes_out_fecha ON bbdd_sophia..mensajes_out(fecha_mensaje DESC);

-- =====================================================
-- REFERENCE TABLES (Already exist in bbdd_sophia)
-- =====================================================
-- These tables are referenced but managed externally:
--
-- Table: conversaciones (Inbound/Outbound Message History)
-- Columns: remitente_wa_id, mensaje_texto, fecha_mensaje, sentido ('in'/'out')
--
-- Table: tb_citas (Appointments/Conversions)
-- Columns: id, remitente_wa_id, fecha_mensaje, ...
--
-- =====================================================

GO
