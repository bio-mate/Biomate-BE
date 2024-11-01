const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const logger = require('../logger')
const config = require('../config') // Assuming you're loading your configurations from a separate file

const s3Client = new S3Client({
    region: config.REGION,
    credentials: {
        accessKeyId: config.AWS_KEY,
        secretAccessKey: config.AWS_SECRET,
    },
})

const s3Plugin = {
    name: 's3Plugin',
    version: '1.0.0',
    register: async function (server) {
        server.expose('getSignedUrl', async (objectKey) => {
            let expiresIn = 3600

            try {
                const command = new GetObjectCommand({
                    Bucket: config.BUCKET,
                    Key: objectKey,
                })
                const signedUrl = await getSignedUrl(s3Client, command, {
                    expiresIn,
                })
                logger.info(`AWS s3 Bucket configured ${signedUrl}`)
                return signedUrl
            } catch (error) {
                logger.error('Error generating signed URL:' + error)
            }
        })

        // server.expose('uploadFile', async (fileContent, fileName, fileType) => {
        //     try {
        //         const uploadParams = {
        //             Bucket: config.BUCKET,
        //             Key: fileName,
        //             Body: fileContent,
        //             ContentType: fileType,
        //         }

        //         const data = await s3Client.send(
        //             new PutObjectCommand(uploadParams)
        //         )
        //         logger.info(`File uploaded successfully. ${fileName}`)
        //         return data
        //     } catch (error) {
        //         logger.error('Error uploading file: ' + error)
        //         throw error
        //     }
        // })
    },
}

module.exports = s3Plugin
