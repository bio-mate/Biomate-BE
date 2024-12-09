const loggerWithCorrelationId = require('../logger')
let clientPool

async function stopClient() {
    if (!clientPool) return
    try {
        await clientPool.close()
        clientPool = null
    } catch (e) {
        loggerWithCorrelationId.error(e)
    }
}

module.exports = {
    stopClient,
}
