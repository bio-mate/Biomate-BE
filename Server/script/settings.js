const mongoose = require('mongoose')
const Hapi = require('@hapi/hapi')
const { userModal } = require('../models/userSchema.js') // Assuming `userModal` is a Mongoose model
const { loginHistoryModal } = require('../models/loginHistorySchema.js')
const { userProfileModal } = require('../models/profileSchema.js')
require('dotenv').config()
const logger = console

const dbConfig = {
    url: process.env.MONGODB_URI,
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
}

async function connectToDatabase() {
    try {
        await mongoose.connect(dbConfig.url, dbConfig.options)
        logger.info(`Connected to database: ${process.env.DBNAME}`)
    } catch (error) {
        logger.error('Error connecting to MongoDB:', error)
        process.exit(1) // Exit if the connection fails
    }
}

async function checkAndCreateCollection(collections) {
    try {
        const existingCollections = await mongoose.connection.db
            .listCollections()
            .toArray()
        const existingCollectionNames = existingCollections.map(
            (collection) => collection.name
        )

        for (const { name, model } of collections) {
            if (!existingCollectionNames.includes(name)) {
                await model.createCollection() // Create the collection using the model
                logger.info(
                    `${name} collection created with schema validation.`
                )
            } else {
                logger.info(
                    `${name} collection already exists, skipping creation.`
                )
            }
        }
    } catch (error) {
        logger.error('Error in MongoDB operation:', error)
    }
}

const collections = [
    { name: 'users', model: userModal },
    { name: 'profiles', model: userProfileModal },
    { name: 'loginHistory', model: loginHistoryModal },
    // Add more collections as needed
]

;(async () => {
    await connectToDatabase()
    await checkAndCreateCollection(collections)
    await mongoose.connection.close()
})()
