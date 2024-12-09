const pino = require('pino')
const stdSerializers = require('pino-std-serializers')
const { asyncLocalStorage } = require('./async-local-storage') // Ensure correct import

// Enhanced error serializer to include filename and line number
const enhancedErrorSerializer = (err) => {
    const correlationStore = asyncLocalStorage && asyncLocalStorage.getStore()
    const correlationId =
        (correlationStore && correlationStore.correlationId) || 'Not Set'

    if (typeof err === 'string') {
        err = `CorrelationId::${correlationId}, message: ${err}`
    } else {
        err.correlationId = correlationId

        const serializedError = stdSerializers.err(err)

        // Capture the stack trace to extract file and line number
        if (err.stack) {
            const stackLines = err.stack.split('\n')
            const match = stackLines[1]?.match(/\(([^:]+):(\d+):(\d+)\)/) // Match filename and line number

            if (match) {
                const fileName = match[1]
                const lineNumber = match[2]
                const columnNumber = match[3]

                // Add filename and line number to the serialized error
                serializedError.file = fileName
                serializedError.line = lineNumber
                serializedError.column = columnNumber
            }
        }

        return serializedError
    }
}

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    serializers: {
        err: enhancedErrorSerializer,
    },
})

const loggerWithCorrelationId = {
    info: function (msg) {
        const correlationStore = asyncLocalStorage.getStore()
        const correlationId =
            (correlationStore && correlationStore.correlationId) || 'Not Set'
        Object.getPrototypeOf(this).info(
            `CorrelationId::${correlationId}, message: ${JSON.stringify(msg)}`
        )
    },
}

Object.setPrototypeOf(loggerWithCorrelationId, logger)

module.exports = loggerWithCorrelationId

// Example usage of asyncLocalStorage to set a correlationId
const exampleFunction = async () => {
    asyncLocalStorage.run({ correlationId: '12345' }, () => {
        try {
            throw new Error('Something went wrong12!')
        } catch (err) {
            loggerWithCorrelationId.error(err)
        }
    })
}
