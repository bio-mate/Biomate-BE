const Server = require('./server')
const config = require('./config')
const logger = require('./logger')

process.on('uncaughtException', (err) => {
    logger.error(err, 'Uncaught exception')
    process.exit(1)
})

process.on('unhandledRejection', (reason, p) => {
    logger.error('Unhandled Rejection at: ', p, 'reason:', reason)
    logger.error(reason)
    process.exit(1)
})

const startServer = async () => {
    try {
        const server = await Server(config)
        await server.start()
    } catch (error) {
        logger.error(error)
        process.exit(1)
    }
}

startServer()
