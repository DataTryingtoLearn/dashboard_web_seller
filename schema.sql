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
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users_main' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE web_react_dashboard..users_main (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL, -- Hashed with bcrypt
        role VARCHAR(50) NOT NULL, -- 'admin', 'user', 'analyst'
        permission_level INT DEFAULT 1, -- 1, 3, 6, 8 (Super Admin)
        client_id INT NULL, -- Foreign key to Clients table
        fecha_registro DATETIME DEFAULT GETDATE()
    );
END

-- Initial Super Admin User (password: password123)
IF NOT EXISTS (SELECT * FROM web_react_dashboard..users_main WHERE id = 'E029863')
BEGIN
    INSERT INTO web_react_dashboard..users_main (id, name, password, role, permission_level, client_id)
    VALUES ('E029863', 'Super Admin', '$2b$10$IjWw2dWIFM8kJvs9TfboXem1cjcCaWvsQgVR1Kr4xPZROTzsvLt/q', 'admin', 8, NULL);
END

-- Table: Clients (Multitenancy Support)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Clients' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE Clients (
        id INT PRIMARY KEY IDENTITY(1,1),
        name VARCHAR(255) NOT NULL,
        fecha_registro DATETIME DEFAULT GETDATE()
    );
END

-- Table: UserLogs (Audit Trail)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserLogs' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE UserLogs (
        id INT PRIMARY KEY IDENTITY(1,1),
        user_id VARCHAR(50) NOT NULL,
        action VARCHAR(50) NOT NULL, -- 'LOGIN', 'LOGOUT', 'CREATE_USER', etc.
        details VARCHAR(255),
        ip_address VARCHAR(50),
        id_cliente INT NULL, -- Client ID for multitenancy tracking
        timestamp DATETIME DEFAULT GETDATE()
    );
END

-- =====================================================
-- DATABASE: bbdd_sophia (Vacancy Module)
-- =====================================================

-- Table: Vacantes (Job Vacancies)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Vacantes' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE Vacantes (
        id INT PRIMARY KEY IDENTITY(1,1),
        client_id INT NOT NULL, -- Multitenancy
        nombre VARCHAR(255) NOT NULL,
        fecha_creacion DATETIME DEFAULT GETDATE(),
        estado VARCHAR(50) DEFAULT 'Abierta', -- 'Abierta', 'Cerrada', 'Pausada'
        CONSTRAINT FK_Vacantes_Clients FOREIGN KEY (client_id) REFERENCES Clients(id)
    );
END

-- Table: CondicionesGenerales (Vacancy Conditions)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CondicionesGenerales' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
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
END

-- Table: FAQ_Dinamico (Dynamic FAQ for Vacancies)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FAQ_Dinamico' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE FAQ_Dinamico (
        id INT PRIMARY KEY IDENTITY(1,1),
        vacante_id INT NOT NULL,
        pregunta VARCHAR(MAX) NOT NULL,
        respuesta VARCHAR(MAX) NOT NULL,
        palabras_clave VARCHAR(MAX),
        CONSTRAINT FK_FAQ_Vacantes FOREIGN KEY (vacante_id) REFERENCES Vacantes(id) ON DELETE CASCADE
    );
END

-- Table: mensajes_out (Outbound Messages)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'mensajes_out' AND schema_id = SCHEMA_ID('dbo')) -- Checks in current DB, usually bbdd_sophia context
BEGIN
    -- Only creating if specifically needed here, though referenced as bbdd_sophia..mensajes_out
    CREATE TABLE mensajes_out (
        id INT PRIMARY KEY IDENTITY(1,1),
        remitente_wa_id VARCHAR(50) NOT NULL, -- WhatsApp ID of recipient
        mensaje_texto VARCHAR(MAX) NOT NULL,
        fecha_mensaje DATETIME DEFAULT GETDATE(),
        estado VARCHAR(50) DEFAULT 'PENDIENTE', -- 'PENDIENTE', 'ENVIADO', 'FALLIDO'
        Manual BIT DEFAULT 0, -- 0 = Automatic, 1 = Manual
        fecha_envio DATETIME NULL,
        error_mensaje VARCHAR(MAX) NULL
    );
END

-- Create index for better query performance checking existence first
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_mensajes_out_wa_id' AND object_id = OBJECT_ID('mensajes_out'))
BEGIN
    CREATE INDEX IX_mensajes_out_wa_id ON mensajes_out(remitente_wa_id);
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_mensajes_out_fecha' AND object_id = OBJECT_ID('mensajes_out'))
BEGIN
    CREATE INDEX IX_mensajes_out_fecha ON mensajes_out(fecha_mensaje DESC);
END

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
