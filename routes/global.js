const { state_city } = require('../handlers/global') // Ensure this path is correct

module.exports = [
    {
        method: 'GET',
        path: '/v1/global/state-city',
        config: {
            handler: state_city,
            validate: {},
        },
    },
]
