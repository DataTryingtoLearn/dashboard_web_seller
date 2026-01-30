export const QUERIES = {

    GET_LEADS_COUNT: 'SELECT COUNT(distinct remitente_wa_id) as total FROM bbdd_sophia..conversaciones where fecha_mensaje >= CONVERT(date, GETDATE() - 7) ;',
    GET_CONTACTED_COUNT: `
        SELECT COUNT(*) AS count 
        FROM bbdd_sophia..conversaciones 
        WHERE fecha_mensaje >= CONVERT(date, GETDATE() - 7)
    `,
    GET_CONVERSIONS_COUNT: `
        SELECT COUNT(*) AS count 
        FROM bbdd_sophia..tb_citas 
        WHERE fecha_mensaje >= CONVERT(date, GETDATE() - 7)
    `,
    GET_AVG_RESPONSE_TIME: `
        WITH mensajes AS (
            SELECT 
                remitente_wa_id,
                fecha_mensaje,
                LAG(fecha_mensaje) OVER (
                    PARTITION BY remitente_wa_id
                    ORDER BY fecha_mensaje
                ) AS fechaAnterior
            FROM bbdd_sophia..conversaciones
            WHERE fecha_mensaje >= CONVERT(date, GETDATE() - 7)
        )
        SELECT 
            AVG(DATEDIFF(MINUTE, fechaAnterior, fecha_mensaje)) AS Promedio
        FROM mensajes
        WHERE fechaAnterior IS NOT NULL;
    `,
    GET_WEEKLY_LEADS: `
        SELECT
            LEFT(DATENAME(WEEKDAY, fecha_mensaje), 3) AS name,
            COUNT(distinct remitente_wa_id) AS leads
        FROM bbdd_sophia..conversaciones
        WHERE fecha_mensaje >= DATEADD(DAY, -7, CONVERT(date, GETDATE()))
        GROUP BY DATENAME(WEEKDAY, fecha_mensaje), DATEPART(WEEKDAY, fecha_mensaje)
        ORDER BY MIN(fecha_mensaje);
    `,
    GET_RECENT_ACTIVITY: `
        SELECT 
            TOP 10
            remitente_wa_id,
            mensaje_texto AS message, 
            FORMAT(fecha_mensaje, 'HH:mm') AS time
        FROM bbdd_sophia..conversaciones
        WHERE fecha_mensaje >= DATEADD(DAY, -7, CONVERT(date, GETDATE()))
        ORDER BY fecha_mensaje DESC;
    `,
    GET_CONVERSATION: `
        SELECT 
            NULL as id,
            mensaje_texto, 
            fecha_mensaje, 
            sentido,
            NULL as Manual
        FROM bbdd_sophia..conversaciones 
        WHERE remitente_wa_id = @wa_id AND sentido IN ('in', 'IN')
        
        UNION ALL
        
        SELECT 
            id,
            mensaje_texto, 
            fecha_mensaje, 
            'out' as sentido,
            Manual
        FROM bbdd_sophia..mensajes_out 
        WHERE remitente_wa_id = @wa_id
        
        ORDER BY fecha_mensaje ASC
    `,
    GET_CHAT_LIST: `
        SELECT TOP 50
            remitente_wa_id,
            MAX(fecha_mensaje) as last_interaction,
            MAX(CASE WHEN sentido IN ('in', 'IN') THEN fecha_mensaje ELSE NULL END) as last_incoming
        FROM bbdd_sophia..conversaciones
        GROUP BY remitente_wa_id
        ORDER BY last_interaction DESC
    `,


    GET_USER_BY_ID: 'SELECT id, name, password, role, permission_level, client_id FROM web_react_dashboard..users_main WHERE id = @id',
    GET_ALL_USERS: 'SELECT id, name, role, permission_level, client_id FROM web_react_dashboard..users_main',
    GET_USERS_BY_CLIENT: 'SELECT id, name, role, permission_level, client_id FROM web_react_dashboard..users_main WHERE client_id = @client_id',
    INSERT_USER: 'INSERT INTO web_react_dashboard..users_main (id, name, password, role, permission_level, client_id) VALUES (@id, @name, @password, @role, @permission_level, @client_id)',


    GET_ALL_CLIENTS: 'SELECT id, name FROM Clients',
    INSERT_CLIENT: 'INSERT INTO Clients (name) OUTPUT INSERTED.id VALUES (@name)',


    UPDATE_USER: 'UPDATE web_react_dashboard..users_main SET name = @name, role = @role, permission_level = @permission_level, client_id = @client_id WHERE id = @id',
    UPDATE_PASSWORD: 'UPDATE web_react_dashboard..users_main SET password = @password WHERE id = @id',

    INSERT_LOG: 'INSERT INTO UserLogs (user_id, action, details, ip_address, id_cliente) VALUES (@user_id, @action, @details, @ip_address, @id_cliente)',
    GET_LOGS: 'SELECT TOP 100 * FROM UserLogs ORDER BY timestamp DESC',

    INSERT_OUTBOUND_MESSAGE: `
        INSERT INTO bbdd_sophia..mensajes_out (remitente_wa_id, mensaje_texto, fecha_mensaje, estado)
        VALUES (@wa_id, @mensaje, GETDATE(), 'PENDIENTE')
    `,

    UPDATE_MANUAL_STATUS: `
        UPDATE bbdd_sophia..mensajes_out 
        SET Manual = @manual 
        WHERE id = @id
    `
};
