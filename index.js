const Server = require('./server')
const config = require('./config')
const loggerWithCorrelationId = require('./logger')

process.on('uncaughtException', (err) => {
    loggerWithCorrelationId.error(err, 'Uncaught exception')
    process.exit(1)
})

process.on('unhandledRejection', (reason, p) => {
    loggerWithCorrelationId.error(
        'Unhandled Rejection at: ',
        p,
        'reason:',
        reason
    )
    loggerWithCorrelationId.error(reason)
    process.exit(1)
})

const startServer = async () => {
    try {
        const server = await Server(config)
        await server.start()
    } catch (error) {
        loggerWithCorrelationId.error(error)
        process.exit(1)
    }
}

startServer()
