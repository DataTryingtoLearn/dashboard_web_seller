-- =====================================================
-- Migration Scripts for Sophia Dashboard
-- =====================================================
-- These scripts help migrate existing databases or add
-- missing columns to existing tables
-- =====================================================

-- =====================================================
-- SCRIPT 1: Add Manual column to existing mensajes_out
-- =====================================================
-- Run this if mensajes_out already exists but doesn't have Manual column

USE bbdd_sophia;
GO

-- Check if Manual column exists, if not add it
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('mensajes_out') 
    AND name = 'Manual'
)
BEGIN
    ALTER TABLE mensajes_out 
    ADD Manual BIT DEFAULT 0;
    
    PRINT 'Column Manual added successfully to mensajes_out';
END
ELSE
BEGIN
    PRINT 'Column Manual already exists in mensajes_out';
END
GO

-- =====================================================
-- SCRIPT 2: Add id_cliente to UserLogs if missing
-- =====================================================

USE web_react_dashboard;
GO

IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('UserLogs') 
    AND name = 'id_cliente'
)
BEGIN
    ALTER TABLE UserLogs 
    ADD id_cliente INT NULL;
    
    PRINT 'Column id_cliente added successfully to UserLogs';
END
ELSE
BEGIN
    PRINT 'Column id_cliente already exists in UserLogs';
END
GO

-- =====================================================
-- SCRIPT 3: Add indexes for better performance
-- =====================================================

USE bbdd_sophia;
GO

-- Index on mensajes_out for wa_id lookups
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_mensajes_out_wa_id')
BEGIN
    CREATE INDEX IX_mensajes_out_wa_id ON mensajes_out(remitente_wa_id);
    PRINT 'Index IX_mensajes_out_wa_id created';
END

-- Index on mensajes_out for date sorting
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_mensajes_out_fecha')
BEGIN
    CREATE INDEX IX_mensajes_out_fecha ON mensajes_out(fecha_mensaje DESC);
    PRINT 'Index IX_mensajes_out_fecha created';
END

-- Index on conversaciones for better chat list performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_conversaciones_wa_id_fecha')
BEGIN
    CREATE INDEX IX_conversaciones_wa_id_fecha ON conversaciones(remitente_wa_id, fecha_mensaje DESC);
    PRINT 'Index IX_conversaciones_wa_id_fecha created';
END
GO

-- =====================================================
-- SCRIPT 4: Sample data for testing (OPTIONAL)
-- =====================================================

USE web_react_dashboard;
GO

-- Insert sample client (if not exists)
IF NOT EXISTS (SELECT * FROM Clients WHERE name = 'Cliente Demo')
BEGIN
    INSERT INTO Clients (name) VALUES ('Cliente Demo');
    PRINT 'Sample client created';
END
GO

-- =====================================================
-- SCRIPT 5: Verify table structures
-- =====================================================

-- Check users_main structure
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users_main'
ORDER BY ORDINAL_POSITION;

-- Check mensajes_out structure
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM bbdd_sophia.INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'mensajes_out'
ORDER BY ORDINAL_POSITION;

-- =====================================================
-- SCRIPT 6: Data cleanup (OPTIONAL - USE WITH CAUTION)
-- =====================================================

-- Remove old outbound messages (older than 90 days)
-- UNCOMMENT TO USE:
-- DELETE FROM bbdd_sophia..mensajes_out 
-- WHERE fecha_mensaje < DATEADD(DAY, -90, GETDATE());

-- Remove old user logs (older than 180 days)
-- UNCOMMENT TO USE:
-- DELETE FROM UserLogs 
-- WHERE timestamp < DATEADD(DAY, -180, GETDATE());

GO
