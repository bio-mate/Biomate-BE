const Boom = require('@hapi/boom')
const R = require('ramda')
const messages = require('../messages/messages')

const state_city = async (req, h) => {
    try {
        const stateCities = await req.server.mongoDb
            .collection('stateCity')
            .find()
            .toArray()
        const groupedData = stateCities.reduce((acc, { state, city }) => {
            if (!acc[state]) {
                acc[state] = []
            }
            acc[state].push({ city })
            return acc
        }, {})

        return h
            .response(
                messages.successResponse(
                    { stateCities: groupedData },
                    'Profile and state-city data retrieved successfully!'
                )
            )
            .code(200)
    } catch (error) {
        if (Boom.isBoom(error)) {
            error.output.payload.isError = true
            throw error
        } else {
            throw messages.createBadRequestError(error.message)
        }
    }
}

module.exports = {
    state_city,
}
