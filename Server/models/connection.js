/* eslint-disable */
const mongoose = require('mongoose')
const logger = require('../logger')
const config = require('../config')
const { userSchema } = require('../models/userSchema')

// MongoDB configuration
const dbConfig = {
    url: config.MONGODB_URI,
    dbName: config.DBNAME,
    poolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
}

// Plugin function to register Mongoose connection
const mongoPlugin = {
    name: 'mongoPlugin',
    version: '1.0.0',
    register: async function (server, options) {
        try {
            await mongoose.connect(dbConfig.url, {
                ...dbConfig.options,
                dbName: dbConfig.dbName,
            })
            logger.info('Connected to MongoDB database ' + dbConfig.dbName)

            server.decorate('server', 'mongoose', mongoose)
            server.decorate('server', 'mongoDb', mongoose.connection)

            mongoose.connection.on('connected', () => {
                logger.info('Mongoose connected to ' + dbConfig.url)
            })
            mongoose.connection.on('error', (err) => {
                logger.error('Mongoose connection error: ' + err)
            })
            mongoose.connection.on('disconnected', () => {
                logger.info('Mongoose disconnected')
            })
        } catch (error) {
            logger.error('MongoDB connection test failed:', error)
            process.exit(1)
        }

        // Close Mongoose connection on server stop
        server.ext('onPreStop', async () => {
            logger.info('Stopping server. Closing MongoDB connection...')
            await mongoose.disconnect()
            logger.info('MongoDB connection closed.')
        })
    },
}

module.exports = mongoPlugin
