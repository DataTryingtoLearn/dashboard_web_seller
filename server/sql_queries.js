export const QUERIES = {

    GET_LEADS_COUNT: `
        SELECT COUNT(DISTINCT telefono) AS total 
        FROM [bbdd_ect_pue_Mia_prepago_R7].[dbo].[tb_mia_flujo_ventas] fv
        LEFT JOIN [bbdd_ect_pue_Mia_prepago_R7].[dbo].[tb_numeros_prueba] tnp ON tnp.numero = fv.telefono
        WHERE fv.fecha_inicio BETWEEN @startDate AND @endDate AND tnp.numero IS NULL;
    `,
    GET_CONTACTED_COUNT: `
        SELECT COUNT(DISTINCT fv.telefono) AS count 
        FROM [bbdd_ect_pue_Mia_prepago_R7].[dbo].[tb_mia_flujo_ventas] fv
        LEFT JOIN [bbdd_ect_pue_Mia_prepago_R7].[dbo].[tb_numeros_prueba] tnp ON tnp.numero = fv.telefono
        WHERE fv.fecha_inicio BETWEEN @startDate AND @endDate 
          AND fv.numero_a_portar IS NOT NULL 
          AND tnp.numero IS NULL;
    `,
    GET_CONVERSIONS_COUNT: `
        SELECT COUNT(DISTINCT fv.telefono) AS count
        FROM [bbdd_ect_pue_Mia_prepago_R7].[dbo].[tb_mia_flujo_ventas] fv
        LEFT JOIN bases..Llamadas ll ON fv.numero_a_portar = ll.numero AND ll.fecha BETWEEN @startDate AND @endDate
        LEFT JOIN [bbdd_ect_pue_Mia_prepago_R7].[dbo].[tb_numeros_prueba] tnp ON tnp.numero = fv.telefono
        WHERE ll.usuario = 'E029973' AND tnp.numero IS NULL;
    `,
    GET_SALES_COUNT: `
        SELECT COUNT(DISTINCT ll.celular) AS count
        FROM [bbdd_ect_pue_Mia_prepago_R7].[dbo].[tb_mia_flujo_ventas] fv
        LEFT JOIN Prepago..Ventas ll ON fv.numero_a_portar = ll.celular AND ll.fecha BETWEEN @startDate AND @endDate
        LEFT JOIN [bbdd_ect_pue_Mia_prepago_R7].[dbo].[tb_numeros_prueba] tnp ON tnp.numero = fv.telefono
        WHERE ll.empleado = 'E029973' AND tnp.numero IS NULL;
    `,
    GET_AVG_RESPONSE_TIME: `
        SELECT ISNULL(SUM(GastoCosto), 0) AS Promedio 
        FROM [bbdd_ect_pue_Mia_prepago_R7].[dbo].[tb_MetaCampanias]
        WHERE InicioDelInforme BETWEEN @startDate AND @endDate;
    `,
    GET_WEEKLY_LEADS: `
        SELECT
            CASE 
                WHEN DATENAME(WEEKDAY, fv.fecha_inicio) = 'Monday' THEN 'Lun'
                WHEN DATENAME(WEEKDAY, fv.fecha_inicio) = 'Tuesday' THEN 'Mar'
                WHEN DATENAME(WEEKDAY, fv.fecha_inicio) = 'Wednesday' THEN 'Mié'
                WHEN DATENAME(WEEKDAY, fv.fecha_inicio) = 'Thursday' THEN 'Jue'
                WHEN DATENAME(WEEKDAY, fv.fecha_inicio) = 'Friday' THEN 'Vie'
                WHEN DATENAME(WEEKDAY, fv.fecha_inicio) = 'Saturday' THEN 'Sáb'
                WHEN DATENAME(WEEKDAY, fv.fecha_inicio) = 'Sunday' THEN 'Dom'
                ELSE LEFT(DATENAME(WEEKDAY, fv.fecha_inicio), 3)
            END AS name,
            COUNT(DISTINCT fv.telefono) AS leads,
            COUNT(DISTINCT CASE WHEN fv.numero_a_portar IS NOT NULL THEN fv.telefono ELSE NULL END) AS contacted
        FROM [bbdd_ect_pue_Mia_prepago_R7].[dbo].[tb_mia_flujo_ventas] fv
        LEFT JOIN [bbdd_ect_pue_Mia_prepago_R7].[dbo].[tb_numeros_prueba] tnp ON tnp.numero = fv.telefono
        WHERE fv.fecha_inicio BETWEEN @startDate AND @endDate AND tnp.numero IS NULL
        GROUP BY DATENAME(WEEKDAY, fv.fecha_inicio), DATEPART(WEEKDAY, fv.fecha_inicio)
        ORDER BY MIN(fv.fecha_inicio);
    `,
    GET_HOURLY_LEADS: `
        SELECT 
            DATEPART(HOUR, fv.fecha_inicio) as hour, 
            COUNT(DISTINCT fv.telefono) as count 
        FROM [bbdd_ect_pue_Mia_prepago_R7].[dbo].[tb_mia_flujo_ventas] fv
        LEFT JOIN [bbdd_ect_pue_Mia_prepago_R7].[dbo].[tb_numeros_prueba] tnp ON tnp.numero = fv.telefono
        WHERE fv.fecha_inicio BETWEEN @startDate AND @endDate AND tnp.numero IS NULL
        GROUP BY DATEPART(HOUR, fv.fecha_inicio)
        ORDER BY hour ASC;
    `,

    GET_CONVERSATION: `
        SELECT * FROM (
            SELECT id_log as id, mensaje_usuario as mensaje_texto, fecha_registro as fecha_mensaje, 'in' as sentido, 0 as Manual
            FROM [bbdd_ect_pue_Mia_prepago_R7].[dbo].[tb_mia_logs_mensajes] WITH (NOLOCK)
            WHERE telefono = @wa_id AND mensaje_usuario IS NOT NULL AND mensaje_usuario <> ''
            UNION ALL
            SELECT id_log as id, respuesta_bot as mensaje_texto, DATEADD(MILLISECOND, 500, fecha_registro) as fecha_mensaje, 'out' as sentido, CASE WHEN estado_en_ese_momento='MANUAL' THEN 1 ELSE 0 END as Manual
            FROM [bbdd_ect_pue_Mia_prepago_R7].[dbo].[tb_mia_logs_mensajes] WITH (NOLOCK)
            WHERE telefono = @wa_id AND respuesta_bot IS NOT NULL AND respuesta_bot <> ''
        ) as chat
        ORDER BY id ASC, sentido ASC
    `,
    GET_CHAT_LIST_BASE: `
        SELECT TOP 50
            v.telefono as remitente_wa_id,
            v.ultima_interaccion as last_interaction,
            (SELECT TOP 1 fecha_registro FROM [bbdd_ect_pue_Mia_prepago_R7].[dbo].[tb_mia_logs_mensajes] WHERE telefono = v.telefono AND mensaje_usuario IS NOT NULL ORDER BY fecha_registro DESC) as last_incoming,
            v.estado_actual as estatus,
            v.comentarios as comentarios,
            ISNULL(CAST(v.modo_manual AS INT), 0) as Manual,
            v.numero_a_portar as numero_portar,
            v.fecha_inicio as fecha_estatus,
            CASE WHEN DATEDIFF(HOUR, (SELECT TOP 1 fecha_registro FROM [bbdd_ect_pue_Mia_prepago_R7].[dbo].[tb_mia_logs_mensajes] WHERE telefono = v.telefono AND mensaje_usuario IS NOT NULL ORDER BY fecha_registro DESC), GETDATE()) < 24 THEN 1 ELSE 0 END as ventana_24h
        FROM [bbdd_ect_pue_Mia_prepago_R7].[dbo].[tb_mia_flujo_ventas] v
        WHERE 1=1
    `,
    GET_CHAT_LIST_GROUP: `
        ORDER BY last_interaction DESC
    `,
    GET_MANUAL_CHAT_LIST: `
        SELECT TOP 50
            v.telefono as remitente_wa_id,
            v.ultima_interaccion as last_interaction,
            (SELECT TOP 1 fecha_registro FROM [bbdd_ect_pue_Mia_prepago_R7].[dbo].[tb_mia_logs_mensajes] WHERE telefono = v.telefono AND mensaje_usuario IS NOT NULL ORDER BY fecha_registro DESC) as last_incoming,
            v.estado_actual as estatus,
            v.comentarios as comentarios,
            1 as Manual,
            v.numero_a_portar as numero_portar,
            v.fecha_inicio as fecha_estatus,
            CASE WHEN DATEDIFF(HOUR, (SELECT TOP 1 fecha_registro FROM [bbdd_ect_pue_Mia_prepago_R7].[dbo].[tb_mia_logs_mensajes] WHERE telefono = v.telefono AND mensaje_usuario IS NOT NULL ORDER BY fecha_registro DESC), GETDATE()) < 24 THEN 1 ELSE 0 END as ventana_24h
        FROM [bbdd_ect_pue_Mia_prepago_R7].[dbo].[tb_mia_flujo_ventas] v
        WHERE v.modo_manual = 1
        ORDER BY last_interaction DESC
    `,
    GET_USER_BY_ID: 'SELECT id, name, password, role, permission_level, client_id FROM [bbdd_ect_pue_Mia_prepago_R7].[dbo].[users_main] WHERE id = @id',
    GET_ALL_USERS: 'SELECT id, name, role, permission_level, client_id FROM [bbdd_ect_pue_Mia_prepago_R7].[dbo].[users_main]',
    GET_USERS_BY_CLIENT: 'SELECT id, name, role, permission_level, client_id FROM [bbdd_ect_pue_Mia_prepago_R7].[dbo].[users_main] WHERE client_id = @client_id',
    INSERT_USER: 'INSERT INTO [bbdd_ect_pue_Mia_prepago_R7].[dbo].[users_main] (id, name, password, role, permission_level, client_id) VALUES (@id, @name, @password, @role, @permission_level, @client_id)',
    GET_ALL_CLIENTS: 'SELECT id, name FROM [bbdd_ect_pue_Mia_prepago_R7].[dbo].[Clients]',
    INSERT_CLIENT: 'INSERT INTO [bbdd_ect_pue_Mia_prepago_R7].[dbo].[Clients] (name) OUTPUT INSERTED.id VALUES (@name)',
    UPDATE_USER: 'UPDATE [bbdd_ect_pue_Mia_prepago_R7].[dbo].[users_main] SET name = @name, role = @role, permission_level = @permission_level, client_id = @client_id WHERE id = @id',
    UPDATE_PASSWORD: 'UPDATE [bbdd_ect_pue_Mia_prepago_R7].[dbo].[users_main] SET password = @password WHERE id = @id',
    INSERT_LOG: 'INSERT INTO [bbdd_ect_pue_Mia_prepago_R7].[dbo].[UserLogs] (user_id, action, details, ip_address, id_cliente) VALUES (@user_id, @action, @details, @ip_address, @id_cliente)',
    GET_LOGS: 'SELECT TOP 100 * FROM [bbdd_ect_pue_Mia_prepago_R7].[dbo].[UserLogs] ORDER BY timestamp DESC',
    INSERT_OUTBOUND_MESSAGE: `
        INSERT INTO[bbdd_ect_pue_Mia_prepago_R7].[dbo].[conversaciones](conversacion_id, remitente_wa_id, mensaje_texto, fecha_mensaje, sentido)
VALUES(@wa_id, @wa_id, @mensaje, GETDATE(), 'saliente')
    `,

    INSERT_OUTBOUND_MESSAGE_MANUAL: `
        INSERT INTO[bbdd_ect_pue_Mia_prepago_R7].[dbo].[conversaciones](conversacion_id, remitente_wa_id, mensaje_texto, fecha_mensaje, sentido, modo_manual)
VALUES(@target_id, @target_wa_id, @target_mensaje, GETDATE(), 'saliente', 1);

UPDATE[bbdd_ect_pue_Mia_prepago_R7].[dbo].[tb_mia_flujo_ventas] 
        SET modo_manual = 1 
        WHERE telefono = @target_wa_id;
`,
    UPDATE_MANUAL_STATUS: `
        UPDATE [bbdd_ect_pue_Mia_prepago_R7].[dbo].[tb_mia_flujo_ventas] 
        SET modo_manual = @manual 
        WHERE telefono = @wa_id
    `,
    UPDATE_COMMENT: `
        UPDATE [bbdd_ect_pue_Mia_prepago_R7].[dbo].[tb_mia_flujo_ventas] 
        SET comentarios = @comentario 
        WHERE telefono = @telefono
    `,
    GET_FUNNEL_DATA: `
SELECT *
    FROM[bbdd_ect_pue_Mia_prepago_R7].[dbo].[vw_Meta_FunnelDiario]
        WHERE InicioDelInforme BETWEEN @startDate AND @endDate
        ORDER BY InicioDelInforme DESC
    `,
    GET_STATUS_DETAIL: `
        SELECT * 
        FROM [bbdd_ect_pue_Mia_prepago_R7].[dbo].[vw_Mia_FunnelEstatusDiario]
        WHERE Fecha BETWEEN @startDate AND @endDate
        ORDER BY Fecha DESC
    `
};
