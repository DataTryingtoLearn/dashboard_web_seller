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

// Configuración de Middlewares
app.use(cors());
app.use(express.json());

// Serve Static Files (Frontend)
app.use(express.static(path.join(__dirname, '../dist')));

// Helper para respuestas estandarizadas
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

// --- Endpoint para conteo de leads ---
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

// --- DUMMY ENDPOINTS FOR DASHBOARD ---

// Contactados
app.get('/api/leads/contacted', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(QUERIES.GET_CONTACTED_COUNT);
        sendResponse(res, { count: result.recordset[0].count }, "Leads contactados obtenidos");
    } catch (err) {
        sendError(res, err, 'Error en /api/leads/contacted');
    }
});

// Conversiones
app.get('/api/leads/conversions', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(QUERIES.GET_CONVERSIONS_COUNT);
        sendResponse(res, { count: result.recordset[0].count }, "Conversiones obtenidas");
    } catch (err) {
        sendError(res, err, 'Error en /api/leads/conversions');
    }
});

// Tiempo Promedio
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

// Gráfico Semanal
app.get('/api/leads/weekly', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(QUERIES.GET_WEEKLY_LEADS);
        sendResponse(res, result.recordset, "Datos semanales obtenidos");
    } catch (err) {
        sendError(res, err, 'Error en /api/leads/weekly');
    }
});

// Actividad Reciente
app.get('/api/leads/recent', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(QUERIES.GET_RECENT_ACTIVITY);
        sendResponse(res, result.recordset, "Actividad reciente obtenida");
    } catch (err) {
        sendError(res, err, 'Error en /api/leads/recent');
    }
});

// --- AUTH ENDPOINT ---
app.post('/api/login', async (req, res) => {
    const { id, password } = req.body;

    if (!id || !password) {
        return sendError(res, new Error('Faltan credenciales'), 'ID y contraseña requeridos', 400);
    }

    // Usuarios de prueba
    const trialUsers = {
        'E029863': { id: 'E029863', name: 'Admin de Prueba', role: 'admin' },
        'E015379': { id: 'E015379', name: 'Usuario de Prueba', role: 'user' }
    };

    if (trialUsers[id] && (password === 'password123' || password === id)) {
        return sendResponse(res, {
            user: {
                id: trialUsers[id].id,
                name: trialUsers[id].name,
                role: trialUsers[id].role
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

    } catch (error) {
        sendError(res, error, 'Error en el login');
    }
});

// --- ENPOINTS DE USUARIOS ---
app.get('/api/users', async (req, res) => {
    const { client_id, permission_level } = req.query;

    try {
        const pool = await poolPromise;
        if (!pool) return sendError(res, new Error('DB unavailable'), 'Sin conexión a base de datos', 503);

        let query = QUERIES.GET_ALL_USERS;
        const request = pool.request();

        if (permission_level < 8) {
            request.input('client_id', sql.Int, client_id);
            // Assuming GET_USERS_BY_CLIENT is "SELECT ... WHERE client_id = @client_id"
            // But we need to make sure we use the right query based on condition
            // In my sql_queries.js, I had GET_USERS_BY_CLIENT
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

// --- ENDPOINTS DE CLIENTES ---
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
    const { name } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('name', sql.VarChar, name)
            .query(QUERIES.INSERT_CLIENT);
        sendResponse(res, null, "Cliente creado correctamente");
    } catch (error) {
        sendError(res, error, 'Error creando cliente');
    }
});

// --- ENDPOINTS DE VACANTES (SOPHIA) ---
app.post('/api/vacantes', async (req, res) => {
    let { nombre, sueldo, bono, horarios, beneficios, requisitos, documentacion, client_id } = req.body;

    if (!nombre || !client_id) {
        return sendError(res, new Error('Missing name or client_id'), 'Nombre y client_id obligatorios', 400);
    }

    sueldo = (sueldo && sueldo !== "") ? parseFloat(sueldo) : null;
    bono = (bono && bono !== "") ? parseFloat(bono) : null;

    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const vacanteResult = await transaction.request()
                .input('nombre', sql.VarChar, nombre)
                .input('client_id', sql.Int, client_id)
                .query(QUERIES.INSERT_VACANTE);

            const vacanteId = vacanteResult.recordset[0].id;

            await transaction.request()
                .input('vacante_id', sql.Int, vacanteId)
                .input('sueldo', sql.Decimal(18, 2), sueldo)
                .input('bono', sql.Decimal(18, 2), bono)
                .input('horarios', sql.VarChar(sql.MAX), horarios || null)
                .input('beneficios', sql.VarChar(sql.MAX), beneficios || null)
                .input('requisitos', sql.VarChar(sql.MAX), requisitos || null)
                .input('documentacion', sql.VarChar(sql.MAX), documentacion || null)
                .query(QUERIES.INSERT_CONDICIONES);

            await transaction.commit();
            sendResponse(res, { vacanteId }, "Vacante creada exitosamente");

        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (error) {
        sendError(res, error, 'Error creando vacante');
    }
});

app.put('/api/vacantes/:id/faq', async (req, res) => {
    const vacanteId = req.params.id;
    const { faqs } = req.body;

    if (!Array.isArray(faqs)) {
        return sendError(res, new Error('Invalid FAQs'), 'Se requiere array de FAQs', 400);
    }

    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            await transaction.request()
                .input('vacante_id', sql.Int, vacanteId)
                .query(QUERIES.DELETE_FAQ_BY_VACANTE);

            for (const item of faqs) {
                await transaction.request()
                    .input('vacante_id', sql.Int, vacanteId)
                    .input('pregunta', sql.VarChar(sql.MAX), item.pregunta)
                    .input('respuesta', sql.VarChar(sql.MAX), item.respuesta)
                    .input('palabras_clave', sql.VarChar(sql.MAX), item.palabras_clave)
                    .query(QUERIES.INSERT_FAQ);
            }

            await transaction.commit();
            sendResponse(res, null, "FAQs actualizadas correctamente");

        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (error) {
        sendError(res, error, 'Error actualizando FAQs');
    }
});

app.get('/api/vacantes/:id/full', async (req, res) => {
    const vacanteId = req.params.id;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('vacante_id', sql.Int, vacanteId)
            .query(QUERIES.GET_FULL_VACANCY);

        const vacancy = result.recordset[0];
        if (!vacancy) {
            return sendError(res, new Error('Not found'), 'Vacante no encontrada', 404);
        }

        if (vacancy.faqs) {
            vacancy.faqs = JSON.parse(vacancy.faqs);
        } else {
            vacancy.faqs = [];
        }

        sendResponse(res, vacancy, "Información completa de vacante obtenida");

    } catch (error) {
        sendError(res, error, 'Error obteniendo detalle de vacante');
    }
});

// Root Route Fallback for SPA (Must be last)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

export default app;

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
    });
}
