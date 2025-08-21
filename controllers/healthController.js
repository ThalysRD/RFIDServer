const database = require('../infra/database');

const healthController = {
    checkHealth: (req, res) => {
        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage()
        });
    },

    checkDatabase: async (req, res) => {
        try {
            const isConnected = await database.testConnection();
            const dbStatus = await database.query('SELECT NOW() as current_time');

            res.json({
                status: 'OK',
                database: {
                    connected: isConnected,
                    currentTime: dbStatus.rows[0].current_time
                }
            });
        } catch (error) {
            res.status(500).json({
                status: 'ERROR',
                database: {
                    connected: false,
                    error: error.message
                }
            });
        }
    },

    status: async (req, res) => {
        try {
            const updateAt = new Date().toISOString();

            const databaseVersionResult = await database.query("SHOW server_version;");
            const databaseVersionValue = databaseVersionResult.rows[0].server_version;

            const databaseMaxConnectionsResult = await database.query("SHOW max_connections;");
            const databaseMaxConnectionsValue = databaseMaxConnectionsResult.rows[0].max_connections;

            const databaseName = process.env.PGDATABASE;

            const databaseOpenedConnectionsResult = await database.query({
                text: `SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;`,
                values: [databaseName],
            });

            const databaseOpenedConnectionsValue = databaseOpenedConnectionsResult.rows[0].count;

            res.status(200).json({
                update_at: updateAt,
                dependencies: {
                    database: {
                        version: databaseVersionValue,
                        max_connections: parseInt(databaseMaxConnectionsValue),
                        opened_connections: databaseOpenedConnectionsValue,
                    },
                },
            });

        } catch (error) {
            console.error('❌ Erro ao obter status do banco:', error);
            res.status(500).json({
                update_at: new Date().toISOString(),
                error: 'Erro ao obter status do banco de dados',
                message: error.message
            });
        }
    }
};

module.exports = healthController;