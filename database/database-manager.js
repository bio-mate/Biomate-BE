const logger = require('../logger')
let clientPool

async function stopClient() {
    if (!clientPool) return
    try {
        await clientPool.close()
        clientPool = null
    } catch (e) {
        logger.error(e)
    }
}

module.exports = {
    stopClient,
}
