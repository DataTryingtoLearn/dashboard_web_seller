import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { sql, poolPromise } from './db.js';
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

// --- Endpoint para conteo de leads ---
app.get('/api/leads/count', async (req, res) => {
    console.log("--> Petición recibida: Obteniendo conteo de leads...");
    try {
        const pool = await poolPromise;
        if (!pool) {
            return res.status(503).json({ success: false, message: 'Database connection not available' });
        }
        const result = await pool.request().query('SELECT COUNT(distinct remitente_wa_id) as total FROM bbdd_sophia..conversaciones where fecha_mensaje >= CONVERT(date, GETDATE() - 7) ;');

        const total = result.recordset[0]?.total || 0;

        console.log('Resultado de la consulta:', total);

        res.json({
            success: true,
            count: total
        });
    } catch (error) {
        console.error('Error en la base de datos (count):', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- DUMMY ENDPOINTS FOR DASHBOARD (Placeholder for future SQL) ---

// Endpoint: Contactados (Conversaciones de los últimos 7 días)
app.get('/api/leads/contacted', async (req, res) => {
    console.log("--> Petición recibida: Obteniendo leads contactados...");
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT COUNT(*) AS count 
                FROM bbdd_sophia..conversaciones 
                WHERE fecha_mensaje >= CONVERT(date, GETDATE() - 7)
            `);

        res.json({
            success: true,
            count: result.recordset[0].count
        });
    } catch (err) {
        console.error('Error en /api/leads/contacted:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Endpoint: Conversiones (Citas de los últimos 7 días)
app.get('/api/leads/conversions', async (req, res) => {
    console.log("--> Petición recibida: Obteniendo conversiones...");
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT COUNT(*) AS count 
                FROM bbdd_sophia..tb_citas 
                WHERE fecha_mensaje >= CONVERT(date, GETDATE() - 7)
            `);

        res.json({
            success: true,
            count: result.recordset[0].count
        });
    } catch (err) {
        console.error('Error en /api/leads/conversions:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Endpoint: Tiempo Promedio de Respuesta
app.get('/api/leads/avg-time', async (req, res) => {
    console.log("--> Petición recibida: Calculando tiempo promedio...");
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
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
            `);

        const promedio = result.recordset[0].Promedio || 0;
        res.json({
            success: true,
            value: `${promedio}m`
        });
    } catch (err) {
        console.error('Error en /api/leads/avg-time:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Endpoint: Gráfico Semanal
app.get('/api/leads/weekly', async (req, res) => {
    console.log("--> Petición recibida: Obteniendo datos semanales...");
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT
                    LEFT(DATENAME(WEEKDAY, fecha_mensaje), 3) AS name,
                    COUNT(*) AS leads
                FROM bbdd_sophia..conversaciones
                WHERE fecha_mensaje >= DATEADD(DAY, -7, CONVERT(date, GETDATE()))
                GROUP BY DATENAME(WEEKDAY, fecha_mensaje), DATEPART(WEEKDAY, fecha_mensaje)
                ORDER BY MIN(fecha_mensaje);
            `);

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error('Error en /api/leads/weekly:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/leads/recent', async (req, res) => {
    console.log("--> Petición recibida: Obteniendo actividad reciente...");
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT 
                    mensaje_texto AS message, 
                    FORMAT(fecha_mensaje, 'HH:mm') AS time
                FROM bbdd_sophia..conversaciones
                WHERE fecha_mensaje >= DATEADD(DAY, -7, CONVERT(date, GETDATE()))
                ORDER BY fecha_mensaje DESC;
            `);

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error('Error en /api/leads/recent:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- AUTH ENDPOINT ---
app.post('/api/login', async (req, res) => {
    const { id, password } = req.body;

    if (!id || !password) {
        return res.status(400).json({ success: false, message: 'ID y contraseña requeridos' });
    }

    // --- USUARIOS DE PRUEBA (HARDCODED) ---
    const trialUsers = {
        'E029863': { id: 'E029863', name: 'Admin de Prueba', role: 'admin' },
        'E015379': { id: 'E015379', name: 'Usuario de Prueba', role: 'user' }
    };

    console.log(`Intentando login para ID: ${id}`);

    if (trialUsers[id] && (password === 'password123' || password === id)) {
        console.log(`Login de PRUEBA exitoso para: ${id}`);
        return res.json({
            success: true,
            user: {
                id: trialUsers[id].id,
                name: trialUsers[id].name,
                role: trialUsers[id].role
            }
        });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.VarChar, id)
            .query('SELECT id, name, password, role FROM web_react_dashboard..users_main WHERE id = @id');

        const user = result.recordset[0];

        if (!user) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        // Return user info (excluding password)
        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                permission_level: user.permission_level,
                client_id: user.client_id
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// --- ENDPOINTS DE USUARIOS ---
app.get('/api/users', async (req, res) => {
    const { client_id, permission_level } = req.query; // Expecting these from frontend context

    try {
        const pool = await poolPromise;
        if (!pool) {
            return res.status(503).json({ success: false, message: 'Database connection not available' });
        }

        let query = 'SELECT id, name, role, permission_level, client_id FROM web_react_dashboard..users_main';
        const request = pool.request();

        // Si no es Super Admin (lvl 8), filtrar por cliente
        if (permission_level < 8) {
            request.input('client_id', sql.Int, client_id);
            query += ' WHERE client_id = @client_id';
        }

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (error) {
        console.error('Database Error in GET /api/users:', error);
        res.status(500).json({ success: false, message: 'Error retrieving users: ' + error.message });
    }
});

app.post('/api/users', async (req, res) => {
    const { id, name, password, role, permission_level, client_id } = req.body;
    if (!id || !name || !password || !role) {
        return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
    }
    try {
        const pool = await poolPromise;
        if (!pool) {
            return res.status(503).json({ success: false, message: 'Database connection not available' });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await pool.request()
            .input('id', sql.VarChar, id)
            .input('name', sql.VarChar, name)
            .input('password', sql.VarChar, hashedPassword)
            .input('role', sql.VarChar, role)
            .input('permission_level', sql.Int, permission_level || 1)
            .input('client_id', sql.Int, client_id || null)
            .query('INSERT INTO web_react_dashboard..users_main (id, name, password, role, permission_level, client_id) VALUES (@id, @name, @password, @role, @permission_level, @client_id)');

        res.json({ success: true, message: 'Usuario creado exitosamente', userId: id });
    } catch (error) {
        console.error('Database Error in POST /api/users:', error);
        if (error.number === 2627 || error.number === 2601) {
            return res.status(409).json({ success: false, message: 'El ID de usuario ya existe' });
        }
        res.status(500).json({ success: false, message: 'Error en el servidor: ' + error.message });
    }
});

// --- ENDPOINTS DE CLIENTES ---
app.get('/api/clients', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT id, name FROM Clients');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/clients', async (req, res) => {
    const { name } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('name', sql.VarChar, name)
            .query('INSERT INTO Clients (name) VALUES (@name)');
        res.json({ success: true, message: 'Cliente creado correctamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- ENDPOINTS DE VACANTES (SOPHIA) ---

// 1. POST /api/vacantes - Guarda vacante y condiciones iniciales
app.post('/api/vacantes', async (req, res) => {
    let { nombre, sueldo, bono, horarios, beneficios, requisitos, documentacion, client_id } = req.body;

    if (!nombre || !client_id) {
        return res.status(400).json({ success: false, message: 'El nombre y client_id son obligatorios' });
    }

    // Asegurar que sueldo y bono sean números o null (evitar error de string vacío en Decimal)
    sueldo = (sueldo && sueldo !== "") ? parseFloat(sueldo) : null;
    bono = (bono && bono !== "") ? parseFloat(bono) : null;

    try {
        const pool = await poolPromise;
        if (!pool) return res.status(503).json({ success: false, message: 'Database connection not available' });

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Insertar Vacante
            const vacanteResult = await transaction.request()
                .input('nombre', sql.VarChar, nombre)
                .input('client_id', sql.Int, client_id)
                .query('INSERT INTO Vacantes (nombre, client_id) OUTPUT INSERTED.id VALUES (@nombre, @client_id)');

            const vacanteId = vacanteResult.recordset[0].id;

            // Insertar Condiciones Generales
            await transaction.request()
                .input('vacante_id', sql.Int, vacanteId)
                .input('sueldo', sql.Decimal(18, 2), sueldo)
                .input('bono', sql.Decimal(18, 2), bono)
                .input('horarios', sql.VarChar(sql.MAX), horarios || null)
                .input('beneficios', sql.VarChar(sql.MAX), beneficios || null)
                .input('requisitos', sql.VarChar(sql.MAX), requisitos || null)
                .input('documentacion', sql.VarChar(sql.MAX), documentacion || null)
                .query(`
                    INSERT INTO CondicionesGenerales (vacante_id, sueldo, bono, horarios, beneficios, requisitos, documentacion)
                    VALUES (@vacante_id, @sueldo, @bono, @horarios, @beneficios, @requisitos, @documentacion)
                `);

            await transaction.commit();
            res.json({ success: true, message: 'Vacante creada exitosamente', vacanteId });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (error) {
        console.error('Error creating vacancy:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor: ' + error.message });
    }
});

// 2. PUT /api/vacantes/:id/faq - Bulk insert/update FAQ
app.put('/api/vacantes/:id/faq', async (req, res) => {
    const vacanteId = req.params.id;
    const { faqs } = req.body; // Array de { pregunta, respuesta, palabras_clave }

    if (!Array.isArray(faqs)) {
        return res.status(400).json({ success: false, message: 'Se requiere un array de FAQs' });
    }

    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Limpiar FAQs anteriores para esta vacante (estrategia simple para bulk update)
            await transaction.request()
                .input('vacante_id', sql.Int, vacanteId)
                .query('DELETE FROM FAQ_Dinamico WHERE vacante_id = @vacante_id');

            // Insertar nuevas FAQs
            for (const item of faqs) {
                await transaction.request()
                    .input('vacante_id', sql.Int, vacanteId)
                    .input('pregunta', sql.VarChar(sql.MAX), item.pregunta)
                    .input('respuesta', sql.VarChar(sql.MAX), item.respuesta)
                    .input('palabras_clave', sql.VarChar(sql.MAX), item.palabras_clave)
                    .query(`
                        INSERT INTO FAQ_Dinamico (vacante_id, pregunta, respuesta, palabras_clave)
                        VALUES (@vacante_id, @pregunta, @respuesta, @palabras_clave)
                    `);
            }

            await transaction.commit();
            res.json({ success: true, message: 'FAQs actualizadas correctamente' });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (error) {
        console.error('Error updating FAQs:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor: ' + error.message });
    }
});

// 3. GET /api/vacantes/:id/full - Consulta optimizada para Python
app.get('/api/vacantes/:id/full', async (req, res) => {
    const vacanteId = req.params.id;

    try {
        const pool = await poolPromise;

        // Ejecutamos tres consultas en paralelo o una consulta compleja
        // Aquí usaremos JOINs y resultados estructurados
        const result = await pool.request()
            .input('vacante_id', sql.Int, vacanteId)
            .query(`
                SELECT 
                    v.id, v.nombre, v.fecha_creacion, v.estado,
                    c.sueldo, c.bono, c.horarios, c.beneficios, c.requisitos, c.documentacion,
                    (SELECT pregunta, respuesta, palabras_clave FROM FAQ_Dinamico WHERE vacante_id = v.id FOR JSON PATH) as faqs
                FROM Vacantes v
                LEFT JOIN CondicionesGenerales c ON v.id = c.vacante_id
                WHERE v.id = @vacante_id
            `);

        const vacancy = result.recordset[0];
        if (!vacancy) {
            return res.status(404).json({ success: false, message: 'Vacante no encontrada' });
        }

        // Parsear el string JSON de faqs si existe
        if (vacancy.faqs) {
            vacancy.faqs = JSON.parse(vacancy.faqs);
        } else {
            vacancy.faqs = [];
        }

        res.json({ success: true, data: vacancy });

    } catch (error) {
        console.error('Error retrieving full vacancy:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor: ' + error.message });
    }
});

// Root Route Fallback for SPA (Must be last)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
