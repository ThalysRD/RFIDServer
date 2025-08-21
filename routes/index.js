const express = require('express');
const router = express.Router();

const rfidController = require('../controllers/rfidController');
const healthController = require('../controllers/healthController');

router.get('/health', healthController.checkHealth);
router.get('/health/db', healthController.checkDatabase);
router.get('/status', healthController.status);

router.post('/rfid/reading', rfidController.createReading);
router.post('/rfid/batch', rfidController.createReading);
router.get('/rfid/readings', rfidController.getAllReadings);
router.get('/rfid/tag/:tagId', rfidController.getReadingsByTag);
router.get('/rfid/employee/:employeeName', rfidController.getReadingsByEmployee);
router.get('/rfid/date-range', rfidController.getReadingsByDateRange);

router.get('/', (req, res) => {
    res.json({
        message: 'API RFID Server - ESP32',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            healthDb: '/api/health/db',
            status: '/api/status',
            postReading: 'POST /api/rfid/reading (única leitura ou múltiplas)',
            postBatch: 'POST /api/rfid/batch (mesmo que /reading - múltiplas leituras)',
            getReadings: 'GET /api/rfid/readings',
            getByTag: 'GET /api/rfid/tag/:tagId',
            getByEmployee: 'GET /api/rfid/employee/:employeeName',
            getByDateRange: 'GET /api/rfid/date-range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD'
        },
        exampleSingleReading: {
            url: '/api/rfid/reading',
            method: 'POST',
            description: 'Enviar uma única leitura RFID',
            body: {
                tagId: '1234567890',
                employeeName: 'João Silva',
                timestampReading: '2025-08-21T10:30:00Z',
                rssi: -45,
                location: 'entrada',
                deviceId: 'esp32_001'
            }
        },
        exampleMultipleReadings: {
            url: '/api/rfid/reading',
            method: 'POST',
            description: 'Enviar múltiplas leituras RFID em um único POST',
            body: [
                {
                    tagId: '1234567890',
                    employeeName: 'João Silva',
                    timestampReading: '2025-08-21T10:30:00Z',
                    rssi: -45,
                    location: 'entrada',
                    deviceId: 'esp32_001'
                },
                {
                    tagId: '0987654321',
                    employeeName: 'Maria Santos',
                    timestampReading: '2025-08-21T10:31:15Z',
                    rssi: -52,
                    location: 'entrada',
                    deviceId: 'esp32_001'
                }
            ]
        }
    });
});

module.exports = router;