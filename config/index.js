require('dotenv').config()

const {
    MYSQL_HOST,
    MYSQL_USER,
    MYSQL_PASSWORD,
    MYSQL_DATABASE,
    MYSQL_PORT,
    REDIS_HOST,
    REDIS_PORT,
    MONGODB_URI,
    PORT = 8804,
    isProd = false,
    HOST = 'localhost',
    JWT_SECRET,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_REGION,
    S3_BUCKET_NAME,
    ALGO_SECRET,
    JWTEXPIRE,
    DBNAME,
} = process.env

const objconf = {
    host: HOST,
    port: PORT,
    secret: JWT_SECRET,
    db_host: MYSQL_HOST,
    db_user: MYSQL_USER,
    db_password: MYSQL_PASSWORD,
    db_database: MYSQL_DATABASE,
    db_port: MYSQL_PORT,
    redis_host: REDIS_HOST,
    redis_port: REDIS_PORT,
    isProd: isProd,
    AWS_KEY: AWS_ACCESS_KEY_ID,
    AWS_SECRET: AWS_SECRET_ACCESS_KEY,
    REGION: AWS_REGION,
    BUCKET: S3_BUCKET_NAME,
    ALGO_SECRET: ALGO_SECRET,
    JWTEXPIRE: JWTEXPIRE || '12h',
    MONGODB_URI: MONGODB_URI,
    DBNAME: DBNAME,
}

module.exports = objconf
