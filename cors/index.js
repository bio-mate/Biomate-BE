const Boom = require('@hapi/boom')
const allowedOrigins = [
    'localhost:8803/',
    'localhost:8804/',
    'localhost:8804',
    'localhost:3000',
    'localhost:8803',
]
// Example helper function to check if origin is allowed
function isNotAllowedOrigin(origin) {
    console.log('origin', origin)
    console.log('first', origin.split('//')[1], origin.split('//')[0])
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

// const Boom = require('@hapi/boom')
// const allowedOrigins = ['localhost:8803', 'localhost:8804', 'localhost:3000']

// // Helper function to check if the origin is allowed
// function isNotAllowedOrigin(origin) {
//     console.log('origin:', origin)
//     return !allowedOrigins.some(allowedOrigin =>
//         origin.includes(allowedOrigin)
//     )
// }

// module.exports = {
//     name: 'cors',
//     register: async (server) => {
//         server.ext('onPreResponse', async (request, h) => {
//             const response = request.response.isBoom
//                 ? request.response.output
//                 : request.response

//             // Extract origin from headers or referer
//             const requestOrigin = request.headers.origin || request.headers.referer?.split('/')[2]

//             // Check if it's a preflight (OPTIONS) request
//             if (request.method === 'options') {
//                 if (requestOrigin && isNotAllowedOrigin(requestOrigin)) {
//                     throw Boom.unauthorized('Origin not allowed')
//                 }

//                 response.headers['access-control-allow-origin'] = requestOrigin || '*'
//                 response.headers['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
//                 response.headers['access-control-allow-headers'] = 'Content-Type, Authorization'
//                 response.headers['access-control-allow-credentials'] = 'true'

//                 return h.response().code(204) // Respond with 'No Content' for preflight
//             }

//             // Check origin for other requests
//             if (requestOrigin && isNotAllowedOrigin(requestOrigin)) {
//                 throw Boom.unauthorized('You are not authorized to perform this operation')
//             } else {
//                 response.headers['access-control-allow-origin'] = requestOrigin || '*'
//                 response.headers['access-control-allow-credentials'] = 'true'
//             }

//             return h.continue
//         })
//     },
// }
