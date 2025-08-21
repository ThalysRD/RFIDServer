const express = require('express');
const cors = require('cors');
const { testConnection } = require('./infra/database');
const routes = require('./routes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

app.use('/api', routes);

app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno'
    });
});

app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Rota não encontrada',
        path: req.originalUrl
    });
});

async function startServer() {
    try {
        console.log('Iniciando servidor RFID...');

        const dbConnected = await testConnection();
        if (!dbConnected) {
            throw new Error('Falha na conexão com o banco de dados');
        }

        app.listen(PORT, '0.0.0.0', () => {
            console.log('SERVIDOR RFID INICIADO');
            console.log(`Porta: ${PORT}`);
            console.log(`Health Check: /api/health`);
            console.log(`POST Endpoint: /api/rfid/reading`);
        });

    } catch (error) {
        console.error('Falha ao iniciar servidor:', error.message);
        process.exit(1);
    }
}

startServer();