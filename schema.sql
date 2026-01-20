-- SQL Script for Sophia Vacancy Module
-- Database: bbdd_sophia

-- 0. Table: Clients
CREATE TABLE Clients (
    id INT PRIMARY KEY IDENTITY(1,1),
    name VARCHAR(255) NOT NULL,
    fecha_registro DATETIME DEFAULT GETDATE()
);

-- 1. Table: Vacantes
CREATE TABLE Vacantes (
    id INT PRIMARY KEY IDENTITY(1,1),
    client_id INT NOT NULL, -- Multitenancy
    nombre VARCHAR(255) NOT NULL,
    fecha_creacion DATETIME DEFAULT GETDATE(),
    estado VARCHAR(50) DEFAULT 'Abierta', -- 'Abierta', 'Cerrada', 'Pausada'
    CONSTRAINT FK_Vacantes_Clients FOREIGN KEY (client_id) REFERENCES Clients(id)
);

-- 2. Table: CondicionesGenerales
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

-- 3. Table: FAQ_Dinamico
CREATE TABLE FAQ_Dinamico (
    id INT PRIMARY KEY IDENTITY(1,1),
    vacante_id INT NOT NULL,
    pregunta VARCHAR(MAX) NOT NULL,
    respuesta VARCHAR(MAX) NOT NULL,
    palabras_clave VARCHAR(MAX),
    CONSTRAINT FK_FAQ_Vacantes FOREIGN KEY (vacante_id) REFERENCES Vacantes(id) ON DELETE CASCADE
);
GO
