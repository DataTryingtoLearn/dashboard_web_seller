export const QUERIES = {
    // Lead Counts & Stats
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
            COUNT(*) AS leads
        FROM bbdd_sophia..conversaciones
        WHERE fecha_mensaje >= DATEADD(DAY, -7, CONVERT(date, GETDATE()))
        GROUP BY DATENAME(WEEKDAY, fecha_mensaje), DATEPART(WEEKDAY, fecha_mensaje)
        ORDER BY MIN(fecha_mensaje);
    `,
    GET_RECENT_ACTIVITY: `
        SELECT 
            mensaje_texto AS message, 
            FORMAT(fecha_mensaje, 'HH:mm') AS time
        FROM bbdd_sophia..conversaciones
        WHERE fecha_mensaje >= DATEADD(DAY, -7, CONVERT(date, GETDATE()))
        ORDER BY fecha_mensaje DESC;
    `,

    // Auth & Users
    GET_USER_BY_ID: 'SELECT id, name, password, role FROM web_react_dashboard..users_main WHERE id = @id',
    GET_ALL_USERS: 'SELECT id, name, role, permission_level, client_id FROM web_react_dashboard..users_main',
    GET_USERS_BY_CLIENT: 'SELECT id, name, role, permission_level, client_id FROM web_react_dashboard..users_main WHERE client_id = @client_id',
    INSERT_USER: 'INSERT INTO web_react_dashboard..users_main (id, name, password, role, permission_level, client_id) VALUES (@id, @name, @password, @role, @permission_level, @client_id)',

    // Clients
    GET_ALL_CLIENTS: 'SELECT id, name FROM Clients',
    INSERT_CLIENT: 'INSERT INTO Clients (name) VALUES (@name)',

    // Vacancies
    INSERT_VACANTE: 'INSERT INTO Vacantes (nombre, client_id) OUTPUT INSERTED.id VALUES (@nombre, @client_id)',
    INSERT_CONDICIONES: `
        INSERT INTO CondicionesGenerales (vacante_id, sueldo, bono, horarios, beneficios, requisitos, documentacion)
        VALUES (@vacante_id, @sueldo, @bono, @horarios, @beneficios, @requisitos, @documentacion)
    `,
    DELETE_FAQ_BY_VACANTE: 'DELETE FROM FAQ_Dinamico WHERE vacante_id = @vacante_id',
    INSERT_FAQ: `
        INSERT INTO FAQ_Dinamico (vacante_id, pregunta, respuesta, palabras_clave)
        VALUES (@vacante_id, @pregunta, @respuesta, @palabras_clave)
    `,
    GET_FULL_VACANCY: `
        SELECT 
            v.id, v.nombre, v.fecha_creacion, v.estado,
            c.sueldo, c.bono, c.horarios, c.beneficios, c.requisitos, c.documentacion,
            (SELECT pregunta, respuesta, palabras_clave FROM FAQ_Dinamico WHERE vacante_id = v.id FOR JSON PATH) as faqs
        FROM Vacantes v
        LEFT JOIN CondicionesGenerales c ON v.id = c.vacante_id
        WHERE v.id = @vacante_id
    `
};
