const { asyncLocalStorage } = require('./async-local-storage')
const { HEADER_ICM_CO } = require('./constants')

function handleRequest(handler) {
    return (req, h) => {
        return asyncLocalStorage.run(
            { correlationId: req.headers && req.headers[HEADER_ICM_CO] },
            async () => {
                return handler(req, h)
            }
        )
    }
}

module.exports = {
    handleRequest,
}
