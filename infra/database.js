const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    port: 5432,
    ssl: {
        require: true,
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 0,
    idleTimeoutMillis: 0,
    max: 20
});

async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('Conectado ao banco de dados PostgreSQL');
        client.release();
        return true;
    } catch (err) {
        console.error('Erro ao conectar ao banco:', err.message);
        return false;
    }
}

async function query(text, params) {
    try {
        if (typeof text === 'object' && text.text) {
            const res = await pool.query(text.text, text.values);
            return res;
        }

        const res = await pool.query(text, params);
        return res;
    } catch (err) {
        console.error('Erro na query:', err.message);
        throw err;
    }
}

const database = {
    pool,
    query,
    testConnection
};

module.exports = database;
module.exports.default = database;