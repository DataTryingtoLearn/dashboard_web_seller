import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import bcryptjs from 'bcryptjs';
import { sql, poolPromise } from './db.js';
import { QUERIES } from './sql_queries.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;

const MIA_BASE_URL = "http://127.0.0.1:5001";
const MIA_AUTH = 'Basic RTAyOTg2MzpFMDI5ODYzTU0=';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// --- CONFIGURACIÓN DE IA (Mía Dashboard) ---
const SYSTEM_INSTRUCTION_SQL = `
Eres "Mía", experta en SQL Server para el CRM Mía Dashboard.
Tu única función es generar consultas SQL precisas basadas en el esquema proporcionado.

CONTEXTO DB:
Base de datos: [bbdd_ect_pue_Mia_prepago_R7]
Esquema: [dbo]

TABLAS:
1. [tb_mia_flujo_ventas]: (telefono, fecha_inicio, estado_actual, numero_a_portar, modo_manual, comentarios, id_cliente).
   Estados: 'ABANDONADO', 'PERMITIDO', 'YA_ES_TELCEL', 'FUERAREGION', 'REPEP', 'PORTOUT60', 'SIN_SALDO', 'NUEVO'.
2. [tb_mia_logs_mensajes]: (telefono, mensaje_usuario, respuesta_bot, fecha_registro).
3. [tb_metaCampanias]: (ID, CampaignID, NombreDeLaCampania, InicioDelInforme, GastoCosto, Alcance, Impresiones, Resultados).

REGLAS CRÍTICAS:
- Devuelve SOLO el código SQL plano, sin bloques de código markdown (\`\`\`), sin explicaciones.
- Usa siempre nombres de tabla en formato: [bbdd_ect_pue_Mia_prepago_R7].[dbo].[nombre_tabla].
- Para fechas, usa GETDATE() como referencia si el usuario pide "hoy" o "últimos días".
- Si la consulta no se puede realizar, responde exactamente: ERROR: No tengo acceso.
`;

const SYSTEM_INSTRUCTION_EXPLANATION = `
Eres Mía, asistente del CRM. Analiza los resultados JSON de una consulta SQL y explícalos de forma amigable y profesional.
Reglas: Máximo 3 oraciones, español, sé muy concisa.
`;

const MODELO_IA = "gemini-1.5-flash";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generationConfig = {
    temperature: 0.1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 1000,
};

const sqlModel = genAI.getGenerativeModel({
    model: MODELO_IA,
    systemInstruction: { role: "system", parts: [{ text: SYSTEM_INSTRUCTION_SQL }] },
    generationConfig
}, { apiVersion: "v1" });

const explanationModel = genAI.getGenerativeModel({
    model: MODELO_IA,
    systemInstruction: { role: "system", parts: [{ text: SYSTEM_INSTRUCTION_EXPLANATION }] },
    generationConfig: { ...generationConfig, temperature: 0.7 }
}, { apiVersion: "v1" });

console.log(`Mía IA cargada. Temperatura SQL: 0.1 (Máxima precisión).`);

const getDates = (req) => {
    const { startDate, endDate } = req.query;
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 7));
    return { start, end };
};

const sendResponse = (res, data = null, message = "", success = true) => {
    res.json({ success, data, message });
};

const sendError = (res, error, message = "Error en el servidor", statusCode = 500) => {
    console.error(message, error);
    res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message || message
    });
};

// --- ENDPOINTS DE LEADS (AHORA CON FILTRO DE FECHAS) ---

app.get('/api/leads/count', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { start, end } = getDates(req);

        const result = await pool.request()
            .input('startDate', sql.Date, start)
            .input('endDate', sql.Date, end)
            .query(QUERIES.GET_LEADS_COUNT);

        const total = result.recordset[0]?.total || 0;
        sendResponse(res, { count: total }, "Conteo obtenido correctamente");
    } catch (error) {
        sendError(res, error, 'Error obteniendo conteo de leads');
    }
});

app.get('/api/leads/contacted', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { start, end } = getDates(req);

        const result = await pool.request()
            .input('startDate', sql.Date, start)
            .input('endDate', sql.Date, end)
            .query(QUERIES.GET_CONTACTED_COUNT);

        sendResponse(res, { count: result.recordset[0]?.count || 0 }, "Leads contactados obtenidos");
    } catch (err) {
        sendError(res, err, 'Error en /api/leads/contacted');
    }
});

app.get('/api/leads/conversions', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { start, end } = getDates(req);

        const result = await pool.request()
            .input('startDate', sql.Date, start)
            .input('endDate', sql.Date, end)
            .query(QUERIES.GET_CONVERSIONS_COUNT);

        sendResponse(res, { count: result.recordset[0]?.count || 0 }, "Conversiones obtenidas");
    } catch (err) {
        sendError(res, err, 'Error en /api/leads/conversions');
    }
});

app.get('/api/leads/sales', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { start, end } = getDates(req);

        const result = await pool.request()
            .input('startDate', sql.Date, start)
            .input('endDate', sql.Date, end)
            .query(QUERIES.GET_SALES_COUNT);

        sendResponse(res, { count: result.recordset[0]?.count || 0 }, "Ventas totales obtenidas");
    } catch (err) {
        sendError(res, err, 'Error en /api/leads/sales');
    }
});

app.get('/api/leads/avg-time', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { start, end } = getDates(req);

        const result = await pool.request()
            .input('startDate', sql.Date, start)
            .input('endDate', sql.Date, end)
            .query(QUERIES.GET_AVG_RESPONSE_TIME);

        const gasto = result.recordset[0]?.Promedio || 0;
        const formattedGasto = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(gasto);
        sendResponse(res, { value: formattedGasto }, "Gasto de Meta obtenido");
    } catch (err) {
        sendError(res, err, 'Error en /api/leads/avg-time');
    }
});

app.get('/api/leads/weekly', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { start, end } = getDates(req);

        const result = await pool.request()
            .input('startDate', sql.Date, start)
            .input('endDate', sql.Date, end)
            .query(QUERIES.GET_WEEKLY_LEADS);

        sendResponse(res, result.recordset, "Datos semanales obtenidos");
    } catch (err) {
        sendError(res, err, 'Error en /api/leads/weekly');
    }
});

app.get('/api/leads/recent', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { start, end } = getDates(req);

        const result = await pool.request()
            .input('startDate', sql.Date, start)
            .input('endDate', sql.Date, end)
            .query(QUERIES.GET_HOURLY_LEADS);

        sendResponse(res, result.recordset, "Leads por hora obtenidos");
    } catch (err) {
        sendError(res, err, 'Error en /api/leads/recent');
    }
});

app.get('/api/leads/funnel', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { start, end } = getDates(req);

        const result = await pool.request()
            .input('startDate', sql.Date, start)
            .input('endDate', sql.Date, end)
            .query(QUERIES.GET_FUNNEL_DATA);

        sendResponse(res, result.recordset, "Datos del funnel obtenidos correctamente");
    } catch (err) {
        sendError(res, err, 'Error en /api/leads/funnel');
    }
});

// --- NUEVO ENDPOINT PARA DETALLE DE ESTATUS 360 ---
app.get('/api/leads/status-detail', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { start, end } = getDates(req);

        const result = await pool.request()
            .input('startDate', sql.Date, start)
            .input('endDate', sql.Date, end)
            .query(QUERIES.GET_STATUS_DETAIL);

        sendResponse(res, result.recordset, "Detalle de estatus obtenido");
    } catch (err) {
        sendError(res, err, 'Error en /api/leads/status-detail');
    }
});

// --- FIN ENDPOINTS DE DATOS ---
app.get('/api/leads/:wa_id/conversation', async (req, res) => {
    const { wa_id } = req.params;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('wa_id', sql.VarChar, wa_id)
            .query(QUERIES.GET_CONVERSATION);
        sendResponse(res, result.recordset, "Conversación obtenida");
    } catch (err) {
        sendError(res, err, 'Error en /api/leads/conversation');
    }
});

app.get('/api/leads/chats', async (req, res) => {
    const { searchTerm, startDate, endDate } = req.query;
    try {
        const pool = await poolPromise;
        const request = pool.request();
        let query = QUERIES.GET_CHAT_LIST_BASE;

        if (searchTerm && searchTerm.trim()) {
            query += ` AND v.telefono LIKE @searchTerm`;
            request.input('searchTerm', sql.VarChar, `%${searchTerm.trim()}%`);
        }
        if (startDate) {
            query += ` AND v.ultima_interaccion >= @startDate`;
            request.input('startDate', sql.DateTime, new Date(startDate));
        }
        if (endDate) {
            const endDateTime = new Date(endDate);
            endDateTime.setDate(endDateTime.getDate() + 1);
            query += ` AND v.ultima_interaccion < @endDate`;
            request.input('endDate', sql.DateTime, endDateTime);
        }
        query += QUERIES.GET_CHAT_LIST_GROUP;

        const result = await request.query(query);
        sendResponse(res, result.recordset, "Lista de chats obtenida");
    } catch (err) {
        sendError(res, err, 'Error en /api/leads/chats');
    }
});

app.get('/api/leads/chats/manual', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(QUERIES.GET_MANUAL_CHAT_LIST);
        sendResponse(res, result.recordset, "Lista de chats manuales obtenida");
    } catch (err) {
        sendError(res, err, 'Error en /api/leads/chats/manual');
    }
});

app.post('/api/login', async (req, res) => {
    const { id, password } = req.body;
    if (!id || !password) return sendError(res, new Error('Faltan credenciales'), 'ID y contraseña requeridos', 400);

    const trialUsers = {
        'E029863': { id: 'E0298631', name: 'Admin de Prueba', role: 'admin', permission_level: 8 },
        'E015379': { id: 'E015379', name: 'Usuario de Prueba', role: 'user', permission_level: 1 }
    };

    if (trialUsers[id] && (password === 'password123' || password === id)) {
        return sendResponse(res, {
            user: {
                id: trialUsers[id].id,
                name: trialUsers[id].name,
                role: trialUsers[id].role,
                permission_level: trialUsers[id].permission_level
            }
        }, "Login de prueba exitoso");
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request().input('id', sql.VarChar, id).query(QUERIES.GET_USER_BY_ID);
        const user = result.recordset[0];

        if (!user) return sendError(res, new Error('User not found'), 'Credenciales inválidas', 401);

        const match = await bcryptjs.compare(password, user.password);
        if (!match) return sendError(res, new Error('Invalid password'), 'Credenciales inválidas', 401);

        sendResponse(res, {
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                permission_level: user.permission_level,
                client_id: user.client_id
            }
        }, "Login exitoso");

        pool.request()
            .input('user_id', sql.VarChar, user.id)
            .input('action', sql.VarChar, 'LOGIN')
            .input('details', sql.VarChar, 'Inicio de sesión exitoso')
            .input('ip_address', sql.VarChar, req.ip || '')
            .input('id_cliente', sql.Int, parseInt(user.client_id) || 0)
            .query(QUERIES.INSERT_LOG).catch(console.error);

    } catch (error) {
        sendError(res, error, 'Error en el login');
    }
});

app.get('/api/logs', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(QUERIES.GET_LOGS);
        sendResponse(res, result.recordset, "Logs obtenidos");
    } catch (error) {
        sendError(res, error, 'Error obteniendo logs');
    }
});

app.get('/api/users', async (req, res) => {
    const { client_id, permission_level } = req.query;
    try {
        const pool = await poolPromise;
        if (!pool) return sendError(res, new Error('DB unavailable'), 'Sin conexión a base de datos', 503);
        let query = QUERIES.GET_ALL_USERS;
        const request = pool.request();
        if (permission_level < 8) {
            request.input('client_id', sql.Int, client_id);
            query = QUERIES.GET_USERS_BY_CLIENT;
        }
        const result = await request.query(query);
        sendResponse(res, result.recordset, "Usuarios obtenidos");
    } catch (error) {
        console.error('CRITICAL: Error in /api/users:', error.message);
        sendError(res, error, 'Error obteniendo usuarios');
    }
});

app.post('/api/users', async (req, res) => {
    const { id, name, password, role, permission_level, client_id } = req.body;
    if (!id || !name || !password || !role) return sendError(res, new Error('Missing fields'), 'Faltan campos obligatorios', 400);
    try {
        const pool = await poolPromise;
        const hashedPassword = await bcryptjs.hash(password, 10);
        await pool.request()
            .input('id', sql.VarChar, id)
            .input('name', sql.VarChar, name)
            .input('password', sql.VarChar, hashedPassword)
            .input('role', sql.VarChar, role)
            .input('permission_level', sql.Int, permission_level || 1)
            .input('client_id', sql.Int, client_id || null)
            .query(QUERIES.INSERT_USER);
        sendResponse(res, { userId: id }, "Usuario creado exitosamente");
    } catch (error) {
        if (error.number === 2627 || error.number === 2601) return sendError(res, error, 'El ID de usuario ya existe', 409);
        sendError(res, error, 'Error creando usuario');
    }
});

app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, role, permission_level, client_id } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.VarChar, id)
            .input('name', sql.VarChar, name)
            .input('role', sql.VarChar, role)
            .input('permission_level', sql.Int, permission_level)
            .input('client_id', sql.Int, client_id || null)
            .query(QUERIES.UPDATE_USER);
        sendResponse(res, { id }, "Usuario actualizado correctamente");
    } catch (error) {
        sendError(res, error, 'Error actualizando usuario');
    }
});

app.put('/api/users/:id/password', async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    if (!password) return sendError(res, new Error("Missing password"), "Contraseña requerida", 400);
    try {
        const pool = await poolPromise;
        const hashedPassword = await bcryptjs.hash(password, 10);
        await pool.request().input('id', sql.VarChar, id).input('password', sql.VarChar, hashedPassword).query(QUERIES.UPDATE_PASSWORD);
        sendResponse(res, { id }, "Contraseña actualizada correctamente");
    } catch (error) {
        sendError(res, error, 'Error actualizando contraseña');
    }
});

app.get('/api/clients', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(QUERIES.GET_ALL_CLIENTS);
        sendResponse(res, result.recordset, "Clientes obtenidos");
    } catch (error) {
        console.error('CRITICAL: Error in /api/clients:', error.message);
        sendError(res, error, 'Error obteniendo clientes');
    }
});

app.post('/api/clients', async (req, res) => {
    const { name, admin_id } = req.body;
    if (!admin_id) return sendError(res, new Error("Unauthorized"), "Se requiere ID de administrador", 401);
    try {
        const pool = await poolPromise;
        const userResult = await pool.request().input('id', sql.VarChar, admin_id).query(QUERIES.GET_USER_BY_ID);
        const user = userResult.recordset[0];
        if (!user || user.permission_level < 8) return sendError(res, new Error("Forbidden"), "No tiene permisos", 403);
        const result = await pool.request().input('name', sql.VarChar, name).query(QUERIES.INSERT_CLIENT);
        sendResponse(res, { clientId: result.recordset[0].id }, "Cliente creado correctamente");
    } catch (error) {
        sendError(res, error, 'Error creando cliente');
    }
});

app.post('/api/messages/outbound', async (req, res) => {
    const { wa_id, message } = req.body;
    if (!wa_id || !message) return sendError(res, new Error("Missing params"), "WhatsApp ID and message are required", 400);
    try {
        console.log("Registrando mensaje outbound (Proxy MIA):", { wa_id });

        try {
            const response = await fetch(`${MIA_BASE_URL}/enviar_manual`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true', 'Authorization': MIA_AUTH },
                body: JSON.stringify({ telefono: wa_id, texto: message })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Error de MIA (${response.status}):`, errorText);
                return sendError(res, new Error(errorText), "Error al enviar mensaje vía MIA", response.status);
            }

            console.log("Mensaje enviado exitosamente a MIA");
            sendResponse(res, null, "Mensaje enviado y registrado");
        } catch (fetchError) {
            console.error("Error de conexión con MIA:", fetchError.message);
            sendError(res, fetchError, "Error de conexión con servicio de mensajería");
        }
    } catch (error) { sendError(res, error, 'Error al procesar mensaje outbound'); }
});

app.patch('/api/leads/:wa_id/manual', async (req, res) => {
    const { wa_id } = req.params;
    const { manual } = req.body;
    if (manual === undefined || manual === null) return sendError(res, new Error("Missing manual field"), "El campo 'manual' es requerido", 400);
    try {
        const pool = await poolPromise;
        await pool.request().input('wa_id', sql.VarChar, wa_id).input('manual', sql.Bit, manual ? 1 : 0).query(QUERIES.UPDATE_MANUAL_STATUS);
        sendResponse(res, { wa_id, manual }, "Estado Manual actualizado correctamente");
    } catch (error) { sendError(res, error, 'Error al actualizar estado Manual'); }
});

app.post('/api/reactivar/:wa_id', async (req, res) => {
    const { wa_id } = req.params;
    try {
        const pool = await poolPromise;
        await pool.request().input('wa_id', sql.VarChar, wa_id).input('manual', sql.Bit, 0).query(QUERIES.UPDATE_MANUAL_STATUS);
        try {
            console.log(`Reactivando bot para ${wa_id} en external service...`);
            const response = await fetch(`${MIA_BASE_URL}/api/reactivar/${wa_id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true', 'Authorization': MIA_AUTH }
            });
            if (!response.ok) console.error(`Error de MIA Reactivar (${response.status}):`, await response.text());
            else console.log("Bot reactivado exitosamente en MIA");
        } catch (fetchError) { console.error("Error de conexión con MIA Reactivar:", fetchError.message); }

        sendResponse(res, { wa_id, manual: 0 }, "Bot reactivado correctamente");
    } catch (error) { sendError(res, error, 'Error al reactivar bot'); }
});

app.post('/api/guardar_comentario', async (req, res) => {
    const { telefono, comentario } = req.body;
    if (!telefono) return sendError(res, new Error("Missing telefono"), "Telefono requerido", 400);
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('telefono', sql.VarChar, telefono)
            .input('comentario', sql.VarChar(sql.MAX), comentario)
            .query(QUERIES.UPDATE_COMMENT);
        sendResponse(res, null, "Comentario guardado");
    } catch (error) {
        sendError(res, error, "Error guardando comentario");
    }
});

// --- PROXIES PARA DASHBOARD (Reflejo de Mía - Python) ---

app.get('/api/chats', async (req, res) => {
    try {
        const query = new URLSearchParams(req.query).toString();
        const response = await fetch(`${MIA_BASE_URL}/api/chats?${query}`, {
            headers: { 'Authorization': MIA_AUTH, 'ngrok-skip-browser-warning': 'true' }
        });
        if (!response.ok) throw new Error(`Error Mía: ${response.status}`);
        const data = await response.json();
        res.json(data);
    } catch (e) { sendError(res, e, "Error proxying chats"); }
});

app.get('/api/historial/:telefono', async (req, res) => {
    try {
        const { telefono } = req.params;
        const response = await fetch(`${MIA_BASE_URL}/api/historial/${telefono}`, {
            headers: { 'Authorization': MIA_AUTH, 'ngrok-skip-browser-warning': 'true' }
        });
        const data = await response.json();
        res.json(data);
    } catch (e) { sendError(res, e, "Error proxying historial"); }
});

app.post('/api/enviar_manual', async (req, res) => {
    try {
        const response = await fetch(`${MIA_BASE_URL}/enviar_manual`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': MIA_AUTH, 'ngrok-skip-browser-warning': 'true' },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.json(data);
    } catch (e) { sendError(res, e, "Error proxying manual msg"); }
});

// --- ENDPOINT DE IA (Gemini para métricas) ---
app.post('/api/ai/query', async (req, res) => {
    const { userQuery } = req.body;
    if (!userQuery) return res.status(400).json({ error: "Consulta requerida" });

    try {
        const pool = await poolPromise;

        const resultSql = await sqlModel.generateContent(userQuery);
        let sqlQuery = resultSql.response.text().trim();

        sqlQuery = sqlQuery.replace(/```sql/g, '').replace(/```/g, '').trim();

        if (sqlQuery.includes("ERROR:")) {
            return res.json({ success: false, message: "No tengo acceso a esa información específica." });
        }

        console.log("SQL Ejecutado:", sqlQuery);

        const dataResult = await pool.request().query(sqlQuery);
        const data = dataResult.recordset;

        const explanationPrompt = `Pregunta: "${userQuery}"\nDatos: ${JSON.stringify(data).substring(0, 2000)}`;
        const resultExp = await explanationModel.generateContent(explanationPrompt);
        const explanation = resultExp.response.text().trim();

        res.json({
            success: true,
            explanation,
            data,
            sql: sqlQuery
        });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "Error procesando la consulta" });
    }
});

// --- PROXY PARA WEBHOOKS DE META (WhatsApp Bot) ---
// Captura verificaciones (GET) y mensajes entrantes (POST)
app.all('/webhook', async (req, res) => {
    try {
        console.log(`[Webhook Proxy] ${req.method} recibido. Reenviando a Mía (5001)...`);

        const targetUrl = `${MIA_BASE_URL}/webhook${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`;

        const options = {
            method: req.method,
            headers: { ...req.headers }
        };

        // Eliminar host original para evitar conflictos de proxy
        delete options.headers.host;

        if (req.method !== 'GET' && req.method !== 'HEAD') {
            options.body = JSON.stringify(req.body);
        }

        const response = await fetch(targetUrl, options);
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            res.status(response.status).json(data);
        } else {
            const data = await response.text();
            res.status(response.status).send(data);
        }
    } catch (e) {
        console.error("Error en Webhook Proxy:", e.message);
        res.status(500).send("Error redireccionando Webhook");
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

export default app;

if (!process.env.VERCEL) {
    app.listen(PORT, '127.0.0.1', () => {
        console.log(`Servidor backend corriendo en http://127.0.0.1:${PORT}`);
    });
}