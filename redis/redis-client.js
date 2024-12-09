const redis = require('redis')
const config = require('../config')
const loggerWithCorrelationId = require('../logger')
loggerWithCorrelationId.info('Redis HOST : ' + config.redis_host)
async function buildRedisConnection() {
    const redisClient = redis.createClient({
        port: config.redis_port,
        host: config.redis_host,
    })

    redisClient.on('error', (err) => {
        console.log(err, ' REDIS')
        loggerWithCorrelationId.error('Redis error:', redis)
        loggerWithCorrelationId.error('Redis stack:', redis)
    })

    return await redisClient.connect()
}

async function setData(redisClient, key, value, expiryInSeconds = null) {
    try {
        await redisClient.set(key, value)
        if (expiryInSeconds) {
            await redisClient.expire(key, expiryInSeconds)
        }
        loggerWithCorrelationId.info(`Data set in Redis: ${key}`)
    } catch (error) {
        loggerWithCorrelationId.error(
            'Error setting data in Redis:',
            error.message
        )
    }
}

async function getData(redisClient, key) {
    try {
        const value = await redisClient.get(key)
        if (value) {
            loggerWithCorrelationId.info(`Data retrieved from Redis: ${key}`)
        } else {
            loggerWithCorrelationId.info(`No data found for key: ${key}`)
        }
        return value
    } catch (error) {
        loggerWithCorrelationId.error(
            'Error getting data from Redis:',
            error.message
        )
        return null
    }
}

module.exports = {
    buildRedisConnection,
    setData,
    getData,
}
