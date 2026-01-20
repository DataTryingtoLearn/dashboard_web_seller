import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const config = {
    user: process.env.DB_USER || 'E029863',
    password: process.env.DB_PASSWORD || 'E0298631',
    server: process.env.DB_HOST || '10.128.156.119',
    database: process.env.DB_NAME || 'web_react_dashboard',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

console.log('Intentando conectar a MSSQL con:', { ...config, password: '***' });

export const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to MSSQL');
        return pool;
    })
    .catch(err => {
        console.error('Database Connection Failed!', err);
        return null;
    });

export { sql };
