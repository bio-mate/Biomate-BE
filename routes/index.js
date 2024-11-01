const { handleRequest } = require('../handle-request')
const login = require('./login.js')
const profile = require('./profile.js')

function routeWithCorrelationId(routes) {
    return routes.map((route) => {
        return {
            ...route,
            config: {
                ...route.config,
                handler: handleRequest(route.config.handler),
            },
        }
    })
}

module.exports = {
    name: 'routes',
    version: '1.0.0',
    register: async (server) => {
        server.route(routeWithCorrelationId(login)),
            server.route(routeWithCorrelationId(profile))
    },
}
