const Hapi = require('@hapi/hapi')
const Inert = require('@hapi/inert')
const Vision = require('@hapi/vision')
const routes = require('./routes')
const hapipino = require('hapi-pino')
const mongoPlugin = require('./models/connection')
const s3Plugin = require('./helper/aws')
const logger = require('./logger')
const errorMessages = require('./messages/messages')
const redisPlugin = require('./redis/plugin')
const rateLimitor = require('hapi-rate-limitor')
const jwt = require('jsonwebtoken')
const R = require('ramda')
const cors = require('./cors')
const { decrypt } = require('./helper')
const { userModal } = require('./models/userSchema')
module.exports = async (config, { enableRatelimit = true } = {}) => {
    const { host, port } = config

    const server = Hapi.server({
        host,
        port,
        debug: false,
        routes: {
            cors: false,
            timeout: {
                server: 300000,
            },
            validate: {
                failAction: async (req, h, err) => {
                    req.logger.info({ err })
                    return errorMessages.createBadRequestError(err.message)
                },
            },
        },
        state: { strictHeader: false, clearInvalid: true },
    })

    try {
        const pluginsList = [
            {
                plugin: hapipino,
                options: {
                    prettyPrint: false,
                    logEvents: [
                        'onPostStart',
                        'onPostStop',
                        'response',
                        'request-error',
                    ],
                    ignorePaths: ['/api/health'],
                    level: process.env.LOG_LEVEL || 'info',
                    instance: logger,
                    customRequestLogger: (request) => {
                        logger.info({
                            method: request.method,
                            path: request.path,
                            headers: request.headers,
                            payload: request.payload, // Log request body
                        })
                    },
                    customResponseLogger: (request) => {
                        const response = request.response
                        if (response && response.source) {
                            logger.info({
                                method: request.method,
                                path: request.path,
                                statusCode: response.statusCode,
                                headers: request.headers,
                                responsePayload: response.source, // Log response body
                            })
                        }
                    },
                },
            },
            mongoPlugin,
            s3Plugin,
            redisPlugin,
            cors,
            Inert,
            Vision,
            routes, // Ensure routes are registered last or after Vision if routes depend on Vision
        ]

        if (enableRatelimit) {
            pluginsList.push({
                plugin: rateLimitor,
                options: {
                    redis: config.redis,
                    extensionPoint: 'onRequest',
                    max: 100,
                    duration: 1000,
                },
            })
        }

        server.ext('onPreResponse', function (request, h) {
            const response = request.response
            if (response.isBoom) {
                // Handle error responses
            } else {
                //const successPayload = response.source
            }
            return h.continue
        })

        server.ext('onRequest', async (request, h) => {
            const authorization = request.headers.authorization
            const bypassRoutes = new Set(['register', 'generate-token', 'send'])
            const currentReqPath = R.last(R.split('/', request.path))

            // Bypass authorization check for specific routes
            if (bypassRoutes.has(currentReqPath)) {
                return h.continue
            }

            if (!authorization) {
                throw errorMessages.createUnauthorizedError(
                    'Failed to authorize the request.'
                )
            }

            //const token = authorization.replace('Bearer ', '')

            const mobile = token.slice(-10)
            const users = await userModal.find({ mobile: mobile })
            const secretKeys = users.length > 0 ? users[0].secretKey : ''
            let result = token.replace(mobile, '')
            try {
                const decryptedToken = decrypt(result, secretKeys)
                const decoded = jwt.verify(decryptedToken, config.secret)
                request.auth = { credentials: decoded }
                return h.continue
            } catch (err) {
                console.log(err, 'err')
                throw errorMessages.createUnauthorizedError(
                    'Token expired or invalid'
                )
            }
        })

        await server.register(pluginsList, {
            routes: {
                prefix: '/mate/api',
            },
        })
    } catch (error) {
        logger.error(error)
        throw error
    }

    return server
}
