const databaseManager = require('./connection')
const logger = require('../loggers')
module.exports = {
    name: 'database',
    register: async (server) => {
        await databaseManager.testConnection()
        server.expose('dbPoolConnection', databaseManager.pool)
        server.ext('onPreStop', async () => {
            logger.log('Stopping server. Closing MongoDB connection pool...')
            await databaseManager.stopClient()
            logger.log('MongoDB connection pool closed.')
        })
    },
}
