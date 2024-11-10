const config = require('../config')
const jwt = require('jsonwebtoken')
const logger = require('../logger')
const Boom = require('@hapi/boom')
const { encrypt } = require('../helper')
const messages = require('../messages/messages')
const { userModal } = require('../models/userSchema')
const { loginHistoryModal } = require('../models/loginHistorySchema.js')
const client = require('twilio')(
    config.TWILIO_ACCOUNT_SID,
    config.TWILIO_AUTH_TOKEN
)
const otpGeneration = async (req, h) => {
    const { mobile } = req.payload

    try {
        logger.info('Login')
        const rows = await userModal.findOne({ mobile })

        if (!rows) {
            throw messages.createNotFoundError('User not found')
        }

        if (!rows.is_active) {
            throw messages.createNotFoundError('User is not active!')
        }

        const response = await client.verify.v2
            .services(config.TWILIO_SERVICE_SID)
            .verifications.create({
                to: '+91' + mobile,
                channel: 'sms', // 'sms' or 'call' for voice OTP
            })
        logger.info('OTP STATUS : ' + response)
        return h
            .response(
                messages.successResponse(
                    {},
                    `${mobile} is authenticated successfully!`
                )
            )
            .code(200)
    } catch (error) {
        if (Boom.isBoom(error)) {
            error.output.payload.isError = true
            throw error
        } else {
            throw messages.createUnauthorizedError(error.message)
        }
    }
}

const jwtGenerate = async (req, h) => {
    try {
        const { mobile, code } = req.payload
        const rows = await userModal.findOne({ mobile })
        const response = await client.verify.v2
            .services(config.TWILIO_SERVICE_SID)
            .verificationChecks.create({
                to: '+91' + mobile,
                code: code,
            })
        if (response.status === 'approved') {
            let token = jwt.sign({ rows }, config.secret, {
                expiresIn: config.JWTEXPIRE,
            })

            token = encrypt(token, rows.secretKey)
            token = token + mobile

            const loginHistoryData = {
                user_id: rows._id,
                ip_address: req.info.remoteAddress || null,
                device_info: req.headers['user-agent'] || null,
            }

            await loginHistoryModal.create(loginHistoryData)

            return h
                .response(
                    messages.successResponse(
                        { token },
                        `${mobile} is authenticated successfully!`
                    )
                )
                .code(200)
        } else {
            throw messages.createNotFoundError('OTP verification failed.')
        }
    } catch (error) {
        logger.error(error.message)
        throw messages.createUnauthorizedError(error.message)
    }
}

const user_register = async (req, h) => {
    const { mobile } = req.payload
    const payload = { ...req.payload }

    try {
        const existingUser = await userModal.findOne({ mobile })
        if (existingUser) {
            logger.error('User already exists')
            throw messages.createBadRequestError('User already exists')
        }
        const min = 100000000000
        const max = 999999999999
        payload.secretKey = Math.floor(Math.random() * (max - min + 1)) + min
        const newUser = await userModal.create(payload)
        return h
            .response(
                messages.successResponse(
                    { user: mobile, id: newUser._id },
                    `${mobile} is inserted successfully!`
                )
            )
            .code(201)
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
    jwtGenerate,
    user_register,
    otpGeneration,
}
