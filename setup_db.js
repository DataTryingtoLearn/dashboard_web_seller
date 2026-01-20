import { poolPromise, sql } from './server/db.js';

async function checkTable() {
    try {
        const pool = await poolPromise;
        if (!pool) throw new Error("No pool");

        console.log("Checking for database and table...");

        // 1. Create database if not exists
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'web_react_dashboard')
            BEGIN
                CREATE DATABASE web_react_dashboard;
            END
        `);

        // 2. Create users_main table if not exists with new multitenancy columns
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM web_react_dashboard.sys.tables WHERE name = 'users_main')
            BEGIN
                USE web_react_dashboard;
                CREATE TABLE users_main (
                    id VARCHAR(50) PRIMARY KEY,
                    name VARCHAR(100),
                    password VARCHAR(255),
                    role VARCHAR(20),
                    permission_level INT DEFAULT 1,
                    client_id INT
                );
            END
        `);

        // 3. Simple migration for existing tables: Add permission_level and client_id if missing
        await pool.request().query(`
            USE web_react_dashboard;
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('users_main') AND name = 'permission_level')
            BEGIN
                ALTER TABLE users_main ADD permission_level INT DEFAULT 1;
            END
            
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('users_main') AND name = 'client_id')
            BEGIN
                ALTER TABLE users_main ADD client_id INT;
            END
        `);

        console.log("Database and Table check/creation complete.");
        process.exit(0);
    } catch (err) {
        console.error("Setup error:", err);
        process.exit(1);
    }
}

checkTable();
