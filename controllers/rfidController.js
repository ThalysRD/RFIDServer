const database = require('../infra/database');

const rfidController = {
    createReading: async (req, res) => {
        try {
            const readings = Array.isArray(req.body) ? req.body : [req.body];

            console.log('Dados recebidos:', {
                totalReadings: readings.length,
                receivedAt: new Date().toISOString()
            });

            // Validar todas as leituras
            const validationErrors = [];
            const validReadings = [];

            for (let i = 0; i < readings.length; i++) {
                const reading = readings[i];
                const errors = [];

                if (!reading.tagId) {
                    errors.push('tagId é obrigatório');
                }
                if (!reading.employeeName) {
                    errors.push('employeeName é obrigatório');
                }
                if (!reading.timestampReading) {
                    errors.push('timestampReading é obrigatório');
                }

                if (errors.length > 0) {
                    validationErrors.push({
                        index: i,
                        reading: reading,
                        errors: errors
                    });
                } else {
                    validReadings.push(reading);
                }
            }

            // Se há erros de validação, retornar todos os erros
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Erro de validação em algumas leituras',
                    validationErrors: validationErrors,
                    validReadingsCount: validReadings.length,
                    totalReadingsReceived: readings.length
                });
            }

            // Inserir todas as leituras válidas no banco
            const insertedReadings = [];
            const insertErrors = [];

            for (let i = 0; i < validReadings.length; i++) {
                const reading = validReadings[i];

                try {
                    const result = await database.query(`
                        INSERT INTO rfid_readings 
                        (tag_id, employee_name, timestamp_reading, rssi, location, device_id, created_at) 
                        VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
                        RETURNING *
                    `, [
                        reading.tagId,
                        reading.employeeName,
                        reading.timestampReading,
                        reading.rssi || null,
                        reading.location || 'unknown',
                        reading.deviceId || 'esp32'
                    ]);

                    insertedReadings.push(result.rows[0]);
                    console.log(`Leitura ${i + 1} salva com sucesso`);

                } catch (error) {
                    console.error(`Erro ao salvar leitura ${i + 1}:`, error.message);
                    insertErrors.push({
                        index: i,
                        reading: reading,
                        error: error.message
                    });
                }
            }

            // Resposta com estatísticas completas
            const response = {
                success: true,
                message: `${insertedReadings.length} leituras RFID processadas com sucesso`,
                statistics: {
                    totalReceived: readings.length,
                    validReadings: validReadings.length,
                    successfulInserts: insertedReadings.length,
                    errors: insertErrors.length
                },
                data: insertedReadings.map(row => ({
                    id: row.id,
                    tagId: row.tag_id,
                    employeeName: row.employee_name,
                    timestampReading: row.timestamp_reading,
                    createdAt: row.created_at
                }))
            };

            // Adicionar erros de inserção se houver
            if (insertErrors.length > 0) {
                response.insertErrors = insertErrors;
                response.success = insertedReadings.length > 0; // Sucesso parcial se pelo menos uma foi inserida
            }

            const statusCode = insertedReadings.length > 0 ? 201 : 500;
            res.status(statusCode).json(response);

        } catch (error) {
            console.error('Erro ao salvar leitura RFID:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                message: error.message
            });
        }
    },

    getAllReadings: async (req, res) => {
        try {
            const { limit = 50, offset = 0 } = req.query;

            const result = await database.query(`
                SELECT id, tag_id, employee_name, timestamp_reading, rssi, location, device_id, created_at 
                FROM rfid_readings 
                ORDER BY timestamp_reading DESC 
                LIMIT $1 OFFSET $2
            `, [limit, offset]);

            res.json({
                success: true,
                readings: result.rows,
                total: result.rowCount,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                }
            });

        } catch (error) {
            console.error('Erro ao buscar leituras:', error.message);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    getReadingsByTag: async (req, res) => {
        try {
            const { tagId } = req.params;
            const { limit = 20 } = req.query;

            const result = await database.query(`
                SELECT id, tag_id, employee_name, timestamp_reading, rssi, location, device_id, created_at 
                FROM rfid_readings 
                WHERE tag_id = $1 
                ORDER BY timestamp_reading DESC 
                LIMIT $2
            `, [tagId, limit]);

            res.json({
                success: true,
                tagId,
                readings: result.rows,
                count: result.rowCount
            });

        } catch (error) {
            console.error('Erro ao buscar leituras por tag:', error.message);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    getReadingsByEmployee: async (req, res) => {
        try {
            const { employeeName } = req.params;
            const { limit = 20 } = req.query;

            const result = await database.query(`
                SELECT id, tag_id, employee_name, timestamp_reading, rssi, location, device_id, created_at 
                FROM rfid_readings 
                WHERE employee_name = $1 
                ORDER BY timestamp_reading DESC 
                LIMIT $2
            `, [employeeName, limit]);

            res.json({
                success: true,
                employeeName,
                readings: result.rows,
                count: result.rowCount
            });

        } catch (error) {
            console.error('Erro ao buscar leituras por funcionário:', error.message);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    getReadingsByDateRange: async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            const { limit = 50 } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    error: 'startDate e endDate são obrigatórios'
                });
            }

            const result = await database.query(`
                SELECT id, tag_id, employee_name, timestamp_reading, rssi, location, device_id, created_at 
                FROM rfid_readings 
                WHERE timestamp_reading BETWEEN $1 AND $2 
                ORDER BY timestamp_reading DESC 
                LIMIT $3
            `, [startDate, endDate, limit]);

            res.json({
                success: true,
                dateRange: { startDate, endDate },
                readings: result.rows,
                count: result.rowCount
            });

        } catch (error) {
            console.error('Erro ao buscar leituras por período:', error.message);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    processTagsHex: async (req, res) => {
        try {
            const { tagId, timestamp } = req.body;

            // Validação básica
            if (!tagId) {
                return res.status(400).json({
                    success: false,
                    error: 'Campo "tagId" é obrigatório',
                    example: {
                        tagId: "A1B2C3D4E5F6",
                        timestamp: "2025-08-22T10:30:00Z"
                    }
                });
            }

            if (!timestamp) {
                return res.status(400).json({
                    success: false,
                    error: 'Campo "timestamp" é obrigatório',
                    example: {
                        tagId: "A1B2C3D4E5F6",
                        timestamp: "2025-08-22T10:30:00Z"
                    }
                });
            }

            // Função para validar se é hexadecimal
            const isValidHex = (value) => {
                return typeof value === 'string' && /^[0-9A-Fa-f]+$/.test(value);
            };

            // Validar se tagId é hexadecimal
            if (!isValidHex(tagId)) {
                return res.status(400).json({
                    success: false,
                    error: `TagId inválido: "${tagId}". Deve ser um valor hexadecimal.`,
                    example: "A1B2C3D4E5F6"
                });
            }

            // Validar formato do timestamp
            const timestampDate = new Date(timestamp);
            if (isNaN(timestampDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    error: `Timestamp inválido: "${timestamp}". Deve ser um formato de data válido.`,
                    example: "2025-08-22T10:30:00Z"
                });
            }

            console.log('Processando tag hexadecimal:', {
                tagId: tagId.toUpperCase(),
                timestamp,
                receivedAt: new Date().toISOString()
            });

            // Inserir na tabela rfid_tags_hex
            const result = await database.query(`
                INSERT INTO rfid_tags_hex 
                (tag_id, timestamp) 
                VALUES ($1, $2) 
                RETURNING *
            `, [
                tagId.toUpperCase(),
                timestamp
            ]);

            const savedTag = result.rows[0];

            res.status(201).json({
                success: true,
                message: 'Tag hexadecimal processada e salva com sucesso',
                data: {
                    id: savedTag.id,
                    tagId: savedTag.tag_id,
                    timestamp: savedTag.timestamp,
                    createdAt: savedTag.created_at
                }
            });

        } catch (error) {
            console.error('Erro ao processar tag hexadecimal:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                message: error.message
            });
        }
    }
};

module.exports = rfidController;