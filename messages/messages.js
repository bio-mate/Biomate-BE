const Boom = require('@hapi/boom')
const logger = require('../logger')
const successResponse = (data, message, statusCode = 200) => {
    return {
        statusCode,
        message: message || 'Success', // Consider adding a more specific message based on context
        data: data || {},
        isError: false,
    }
}

const createBadImplementationError = (message, cause) => {
    const error = Boom.badImplementation()
    error.reformat()
    error.output.payload.message = message
    error.cause = cause
    error.output.payload.isError = true
    logger.error(error.output.payload.message)
    return error
}
const createForbiddenError = (message, cause) => {
    const error = Boom.forbidden()
    error.reformat()
    error.output.payload.message = message
    error.cause = cause
    error.output.payload.isError = true
    logger.error(error.output.payload.message)
    return error
}

const createUnauthorizedError = (message, cause) => {
    const error = Boom.unauthorized()
    error.reformat()
    error.cause = cause
    error.output.payload.message = message
    error.output.payload.isError = true

    logger.error(message)
    return error
}

const createNotFoundError = (message, cause) => {
    const error = Boom.notFound()
    error.reformat()
    error.cause = cause
    error.output.payload.isError = true
    error.output.payload.message =
        message || "Requested resource doesn't exist."
    logger.error(error.output.payload.message)
    return error
}

const createBadDataError = (message, data, cause) => {
    const error = Boom.badData(message, data)
    error.reformat()
    error.output.payload.message = message
    error.cause = cause
    error.output.payload.isError = true
    logger.error(error.output.payload.message)
    return error
}

const createBadRequestError = (message, cause, includeCause = false) => {
    const error = Boom.badRequest()
    error.reformat()
    error.cause = cause

    if (includeCause) {
        error.output.payload.cause = cause || ''
    }
    error.output.payload.isError = true
    error.output.payload.message = message || 'Invalid request payload input'
    logger.error(error.output.payload.message)
    return error
}

const createMethodNotAllowedError = (message, cause) => {
    const error = Boom.methodNotAllowed()
    error.reformat()
    error.output.payload.message = message
    error.cause = cause
    error.output.payload.isError = true
    logger.error(error.output.payload.message)
    return error
}

module.exports = {
    createBadImplementationError,
    createNotFoundError,
    createUnauthorizedError,
    createForbiddenError,
    createBadDataError,
    createMethodNotAllowedError,
    createBadRequestError,
    successResponse,
}
