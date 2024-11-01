const bcrypt = require('bcryptjs')
const config = require('../config')
const jwt = require('jsonwebtoken')
const logger = require('../logger')
const Boom = require('@hapi/boom')
const mongoose = require('mongoose')
const { generateRandomKey, encrypt } = require('../helper')
const R = require('ramda')
const messages = require('../messages/messages')
const { userModal } = require('../models/userSchema')
const moment = require('moment')
const { loginHistoryModal } = require('../models/loginHistorySchema.js')

const jwtGenerate = async (req, h) => {
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

        logger.info({ token, rows })
        return h
            .response(
                messages.successResponse(
                    { token },
                    `${mobile} is authenticated successfully!`
                )
            )
            .code(201)
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
}
