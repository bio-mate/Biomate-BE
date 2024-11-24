const Boom = require('@hapi/boom')
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

const getSignedUrl = async (req, h) => {
    try {
        const objectKey = req.query.fileName || ''
        const signedUrl =
            await req.server.plugins.s3Plugin.getSignedUrl(objectKey)
        return h
            .response(
                messages.successResponse(
                    { url: signedUrl },
                    'Url generated successfully!'
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
    getSignedUrl,
}
