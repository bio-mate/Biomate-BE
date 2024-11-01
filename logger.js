const pino = require('pino')
const stdSerializers = require('pino-std-serializers')
const { asyncLocalStorage } = require('./async-local-storage') // Ensure correct import

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',

    serializers: {
        err: (err) => {
            const correlationStore =
                asyncLocalStorage && asyncLocalStorage.getStore()
            const correlationId =
                (correlationStore && correlationStore.correlationId) ||
                'Not Set'

            if (typeof err === 'string') {
                err = `CorrelationId::${correlationId}, message: ${err}`
            } else {
                err.correlationId = correlationId
                const serializedError = stdSerializers.err(err)
                return serializedError
            }
        },
    },
})

const loggerWithCorrelationId = {
    info: function (msg) {
        const correlationStore = asyncLocalStorage.getStore()
        const correlationId =
            (correlationStore && correlationStore.correlationId) || 'Not Set'
        Object.getPrototypeOf(this).info(
            'CorrelationId::' +
                correlationId +
                ', message: ' +
                JSON.stringify(msg)
        )
    },
}

Object.setPrototypeOf(loggerWithCorrelationId, logger)

module.exports = loggerWithCorrelationId

// Example usage of asyncLocalStorage to set a correlationId
const exampleFunction = async () => {
    asyncLocalStorage.run({ correlationId: '12345' }, () => {
        loggerWithCorrelationId.info('This is an info message')
    })
}

exampleFunction()
