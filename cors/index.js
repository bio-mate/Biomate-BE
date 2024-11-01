const Boom = require('@hapi/boom')
const allowedOrigins = ['localhost:8803/', 'localhost:3000', 'localhost:8803']
// Example helper function to check if origin is allowed
function isNotAllowedOrigin(origin) {
    console.log('origin', origin)
    return !allowedOrigins.includes(
        origin.split('//')[1] || origin.split('//')[0]
    )
}

module.exports = {
    name: 'cors',

    register: async (server) => {
        server.ext('onPreResponse', async (request, h) => {
            // depending on whether we have a boom or not,

            // headers need to be set differently.

            const response = request.response.isBoom
                ? request.response.output
                : request.response
            const requestOrigin =
                request.headers.origin || request.headers.referer?.split('/')[2]
            if (
                requestOrigin !== undefined &&
                isNotAllowedOrigin(requestOrigin)
            ) {
                throw Boom.unauthorized(
                    'You are not authorized to perform this operation'
                )
            } else {
                response.headers['access-control-allow-origin'] = requestOrigin
            }
            return h.continue
        })
    },
}
