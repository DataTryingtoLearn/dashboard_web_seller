import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { sql, poolPromise } from './db.js';
import { QUERIES } from './sql_queries.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

const sendResponse = (res, data = null, message = "", success = true) => {
    res.json({
        success,
        data,
        message
    });
};
const sendError = (res, error, message = "Error en el servidor", statusCode = 500) => {
    console.error(message, error);
    res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message || message
    });
};
app.get('/api/leads/count', async (req, res) => {
    try {
        const pool = await poolPromise;
        if (!pool) return sendError(res, new Error('Database not available'), 'Error de conexión', 503);

        const result = await pool.request().query(QUERIES.GET_LEADS_COUNT);
        const total = result.recordset[0]?.total || 0;

        sendResponse(res, { count: total }, "Conteo obtenido correctamente");
    } catch (error) {
        sendError(res, error, 'Error obteniendo conteo de leads');
    }
});

app.get('/api/leads/contacted', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(QUERIES.GET_CONTACTED_COUNT);
        sendResponse(res, { count: result.recordset[0].count }, "Leads contactados obtenidos");
    } catch (err) {
        sendError(res, err, 'Error en /api/leads/contacted');
    }
});


app.get('/api/leads/conversions', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(QUERIES.GET_CONVERSIONS_COUNT);
        sendResponse(res, { count: result.recordset[0].count }, "Conversiones obtenidas");
    } catch (err) {
        sendError(res, err, 'Error en /api/leads/conversions');
    }
});

app.get('/api/leads/avg-time', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(QUERIES.GET_AVG_RESPONSE_TIME);
        const promedio = result.recordset[0].Promedio || 0;
        sendResponse(res, { value: `${promedio}m` }, "Tiempo promedio calculado");
    } catch (err) {
        sendError(res, err, 'Error en /api/leads/avg-time');
    }
});

app.get('/api/leads/weekly', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(QUERIES.GET_WEEKLY_LEADS);
        sendResponse(res, result.recordset, "Datos semanales obtenidos");
    } catch (err) {
        sendError(res, err, 'Error en /api/leads/weekly');
    }
});

app.get('/api/leads/recent', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(QUERIES.GET_RECENT_ACTIVITY);
        sendResponse(res, result.recordset, "Actividad reciente obtenida");
    } catch (err) {
        sendError(res, err, 'Error en /api/leads/recent');
    }
});

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
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(QUERIES.GET_CHAT_LIST);
        sendResponse(res, result.recordset, "Lista de chats obtenida");
    } catch (err) {
        sendError(res, err, 'Error en /api/leads/chats');
    }
});


app.post('/api/login', async (req, res) => {
    const { id, password } = req.body;

    if (!id || !password) {
        return sendError(res, new Error('Faltan credenciales'), 'ID y contraseña requeridos', 400);
    }


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
        const result = await pool.request()
            .input('id', sql.VarChar, id)
            .query(QUERIES.GET_USER_BY_ID);

        const user = result.recordset[0];

        if (!user) {
            return sendError(res, new Error('User not found'), 'Credenciales inválidas', 401);
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return sendError(res, new Error('Invalid password'), 'Credenciales inválidas', 401);
        }

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
        sendError(res, error, 'Error obteniendo usuarios');
    }
});

app.post('/api/users', async (req, res) => {
    const { id, name, password, role, permission_level, client_id } = req.body;
    if (!id || !name || !password || !role) {
        return sendError(res, new Error('Missing fields'), 'Faltan campos obligatorios', 400);
    }
    try {
        const pool = await poolPromise;
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

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
        if (error.number === 2627 || error.number === 2601) {
            return sendError(res, error, 'El ID de usuario ya existe', 409);
        }
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
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await pool.request()
            .input('id', sql.VarChar, id)
            .input('password', sql.VarChar, hashedPassword)
            .query(QUERIES.UPDATE_PASSWORD);

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
        sendError(res, error, 'Error obteniendo clientes');
    }
});

app.post('/api/clients', async (req, res) => {
    const { name, admin_id } = req.body;

    if (!admin_id) {
        return sendError(res, new Error("Unauthorized"), "Se requiere ID de administrador", 401);
    }

    try {
        const pool = await poolPromise;

        const userResult = await pool.request()
            .input('id', sql.VarChar, admin_id)
            .query(QUERIES.GET_USER_BY_ID);

        const user = userResult.recordset[0];

        if (!user || user.permission_level < 8) {
            return sendError(res, new Error("Forbidden"), "No tiene permisos para crear clientes. Se requiere Nivel 8.", 403);
        }

        const result = await pool.request()
            .input('name', sql.VarChar, name)
            .query(QUERIES.INSERT_CLIENT);
        const clientId = result.recordset[0].id;
        sendResponse(res, { clientId }, "Cliente creado correctamente");
    } catch (error) {
        sendError(res, error, 'Error creando cliente');
    }
});

app.post('/api/messages/outbound', async (req, res) => {
    const { wa_id, message } = req.body;

    if (!wa_id || !message) {
        return sendError(res, new Error("Missing params"), "WhatsApp ID and message are required", 400);
    }

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('wa_id', sql.VarChar, wa_id)
            .input('mensaje', sql.VarChar(sql.MAX), message)
            .query(QUERIES.INSERT_OUTBOUND_MESSAGE);

        sendResponse(res, null, "Mensaje outbound registrado correctamente");
    } catch (error) {
        sendError(res, error, 'Error al registrar mensaje outbound');
    }
});

app.patch('/api/messages/manual/:id', async (req, res) => {
    const { id } = req.params;
    const { manual } = req.body;

    if (manual === undefined || manual === null) {
        return sendError(res, new Error("Missing manual field"), "El campo 'manual' es requerido (0 o 1)", 400);
    }

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, parseInt(id))
            .input('manual', sql.Bit, manual ? 1 : 0)
            .query(QUERIES.UPDATE_MANUAL_STATUS);

        sendResponse(res, { id, manual }, "Estado Manual actualizado correctamente");
    } catch (error) {
        sendError(res, error, 'Error al actualizar estado Manual');
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

export default app;

if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor backend corriendo en http://0.0.0.0:${PORT}`);
    });
}
