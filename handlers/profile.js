const Boom = require('@hapi/boom')
const R = require('ramda')
const fs = require('fs').promises
const logger = require('../logger')
const Joi = require('joi')
const messages = require('../messages/messages')
const { userProfileModal } = require('../models/profileSchema.js')
const mongoose = require('mongoose')
const moment = require('moment')
const { getFileExtension, getContentType } = require('../constants')
const AWS_FOLDER = 'biomate'
const save_profile = async (req, h) => {
    const { rows } = req.auth.credentials

    let payload = parseJsonFieldsWithArrayKeys(req.payload)
    payload = { ...payload, createdBy: rows.unique_id }

    try {
        const schema = getValidationSchema()
        const { error } = schema.validate(payload)
        if (error) {
            throw messages.createBadRequestError(error.details[0].message)
        }
        const hasFilenameKey = R.has('filename')
        if (payload.profileImages.length > 0) {
            const uploadPromises = payload.profileImages.map(
                async (fileData) => {
                    if (!hasFilenameKey(fileData)) return ''
                    const name = await uploadFileToS3(req, fileData)
                    return name
                }
            )
            const uploadedFileNames = await Promise.all(uploadPromises)
            payload = formatProfileImages(payload, uploadedFileNames)
            payload = removeProfileImagesIndexedKeys(payload)
        }

        if (payload.kundaliImages.length > 0) {
            const uploadKundaliImages = payload.kundaliImages.map(
                async (fileData) => {
                    if (!hasFilenameKey(fileData)) return ''
                    console.log(hasFilenameKey(fileData))
                    const name = await uploadFileToS3(req, fileData)
                    return name
                }
            )
            const uploadedFileNames = await Promise.all(uploadKundaliImages)
            payload = formatProfileImages(
                payload,
                uploadedFileNames,
                'kundaliImages'
            )
            payload = removeKundaliImagesIndexedKeys(payload)
        }

        const newUserProfile = await userProfileModal.create(payload)
        return h
            .response(
                messages.successResponse(
                    { newUserProfile },
                    `Profile created successfully!`
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

const getValidationSchema = () =>
    Joi.object({
        personalDetails: Joi.object({
            first_name: Joi.string().trim().max(50).required(),
            middle_name: Joi.string().trim().max(50).allow('').optional(),
            last_name: Joi.string().trim().max(50).required(),
            age: Joi.number().min(18).required(),
            gender: Joi.string().valid('male', 'female').required(),
            blood_group: Joi.string()
                .valid('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')
                .allow(''),
            complexion: Joi.string()
                .valid('Fair', 'Wheatish', 'Dusky', 'Dark')
                .allow(''),
            height: Joi.string().allow(''),
            weight: Joi.number().allow(''),
            hobbies: Joi.array()
                .items(Joi.string().trim())
                .allow(null)
                .optional()
                .messages({
                    'array.base': 'Hobbies must be an array of strings',
                    'array.items': 'Each hobby must be a valid string',
                }),
            aboutMe: Joi.string().trim().allow(''),
            lookingFor: Joi.string().trim().allow(''),
        }),
        contactDetails: Joi.object({
            parentNumber: Joi.string().trim().allow(''),
            selfNumber: Joi.string().trim().allow(''),
        }),
        religiousDetails: Joi.object({
            religion: Joi.string().trim().allow(''),
            caste: Joi.string().trim().required(),
            subCaste: Joi.string().trim().allow(''),
            language: Joi.string().trim().allow(''),
            gotra: Joi.string().trim().allow(''),
        }),
        astroDetails: Joi.object({
            dob: Joi.date().required(),
            pob: Joi.string().trim().required(),
            tob: Joi.string().trim().required(),
            rashi: Joi.string().trim().allow(''),
            nakshatra: Joi.string().trim().allow(''),
        }),
        familyDetails: Joi.object({
            fatherName: Joi.string().trim().required(),
            motherName: Joi.string().trim().required(),
            brotherName: Joi.string().trim().allow(''),
            fatherOccupation: Joi.string().trim().required(),
            motherOccupation: Joi.string().trim().allow(''),
            noOfBrothers: Joi.number().allow(''),
            noOfSisters: Joi.number().allow(''),
            familyIncome: Joi.string().trim().allow(''),
            familyFinancialStatus: Joi.string().trim().allow(''),
        }),
        educationDetails: Joi.object({
            degree: Joi.string().trim().required(),
            collegeName: Joi.string().trim().required(),
        }),
        employmentDetails: Joi.object({
            employeeIn: Joi.string().trim().required(),
            companyName: Joi.string().trim().allow(''),
            designation: Joi.string().trim().allow(''),
            income: Joi.string().allow(''),
        }),
        address: Joi.object({
            residential: Joi.object({
                state: Joi.string().trim().required(),
                district: Joi.string().trim().required(),
                pinCode: Joi.string().trim().required(),
                addressLine: Joi.string().trim().required(),
            }),
            permanent: Joi.object({
                state: Joi.string().trim().required(),
                district: Joi.string().trim().required(),
                pinCode: Joi.string().trim().required(),
                addressLine: Joi.string().trim().required(),
            }),
            nativePlace: Joi.string().trim().allow(''),
        }),
        socialMedia: Joi.object({
            facebook: Joi.string().trim().allow(''),
            linkedin: Joi.string().trim().allow(''),
            instagram: Joi.string().trim().allow(''),
        }),
        profileImages: Joi.array().items(
            Joi.object({
                name: Joi.string().trim().allow(null),
                status: Joi.number().valid(0, 1).default(1),
                primary: Joi.number().valid(0, 1).default(0),
            }).unknown()
        ),
        kundaliImages: Joi.array().items(
            Joi.object({
                name: Joi.string().trim().allow(null),
                status: Joi.number().valid(0, 1).default(1),
                primary: Joi.number().valid(0, 1).default(0),
            }).unknown()
        ),
        paymentStatus: Joi.string()
            .valid('pending', 'completed')
            .default('pending'),
        isPublished: Joi.boolean().default(false),
        subscriptionStartDate: Joi.date().allow(''),
        subscriptionEndDate: Joi.date().allow(''),
        subscriptionHistory: Joi.array()
            .items(
                Joi.object({
                    startDate: Joi.date().required(),
                    endDate: Joi.date().required(),
                    paymentId: Joi.string().allow(''),
                })
            )
            .optional(),
        payments: Joi.array().items(
            Joi.object({
                amount: Joi.number().required(),
                paymentDate: Joi.date().default(Date.now),
                status: Joi.string()
                    .valid('pending', 'completed', 'failed')
                    .required(),
                transactionId: Joi.string().allow(''),
            })
        ),
        createdAt: Joi.date().default(Date.now),
        updatedAt: Joi.date().default(Date.now),
        createdBy: Joi.string().allow(''),
        updatedBy: Joi.string().allow(''),
        diet: Joi.string()
            .valid('vegetarian', 'non-vegetarian', 'vegan')
            .allow(''),
    }).unknown(true)

const uploadFileToS3 = async (request, fileData) => {
    try {
        console.log(fileData, 'fileData')
        const extension = getFileExtension(fileData)
        const fileType = getContentType(fileData)
        const timestamp = moment().valueOf() + '.' + extension
        const file = AWS_FOLDER + '/' + timestamp
        const fileContent = await fs.readFile(fileData.path)
        const result = await request.server.plugins.s3Plugin.uploadFile(
            fileContent,
            file,
            fileType
        )
        logger.info('Upload result:', result)
        return timestamp
    } catch (error) {
        console.error('Error in uploadFileToS3:', error)
        return error
    }
}

const update_profile = async (req, h) => {
    const { rows } = req.auth.credentials
    const payload = { ...req.payload, updated_by: rows.unique_id }
    try {
        const updatedUserProfile = await userProfileModal.findByIdAndUpdate(
            payload.id,
            { $set: payload },
            { new: true, runValidators: true }
        )

        if (!updatedUserProfile) {
            throw messages.createNotFoundError('Profile not found')
        }

        return h
            .response(
                messages.successResponse(
                    { id: updatedUserProfile._id, profile: updatedUserProfile },
                    'Profile updated successfully!'
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

const get_profile = async (req, h) => {
    const { rows } = req.auth.credentials

    try {
        let profiles = await userProfileModal.find({
            createdBy: rows.unique_id,
        })

        if (!profiles || profiles.length === 0) {
            throw Boom.notFound('Profile not found for this user')
        }

        profiles = await Promise.all(
            profiles.map(async (profile) => {
                const primaryImage = profile.profileImages.find(
                    (fileData) =>
                        fileData.status === 1 &&
                        fileData.primary === 1 &&
                        fileData.name
                )

                if (primaryImage) {
                    const signedUrl = await getSignedUrl(req, primaryImage.name)

                    return {
                        ...profile.toObject(),
                        signedImage: {
                            name: signedUrl,
                            status: primaryImage.status,
                            primary: primaryImage.primary,
                            _id: primaryImage._id,
                        },
                    }
                } else {
                    return {
                        ...profile.toObject(),
                        signedImage: null,
                    }
                }
            })
        )

        return h
            .response(
                messages.successResponse(
                    { profile: profiles },
                    'Profile fetched successfully!'
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

const user_profile = async (req, h) => {
    const userId = req.params.userId
    const ObjectId = mongoose.Types.ObjectId
    try {
        const objectId = new ObjectId(userId)
        let profile = await userProfileModal.findOne({
            _id: objectId,
        })
        if (!profile) {
            throw Boom.notFound('Profile not found for this user')
        } else {
            const imageSignedUrl = await Promise.all(
                profile.profileImages.map(async (fileData) => {
                    const signedUrl = fileData.name
                        ? await getSignedUrl(req, fileData.name)
                        : ''
                    return {
                        name: signedUrl,
                        status: fileData.status,
                        primary: fileData.primary,
                        _id: fileData._id,
                    }
                })
            )
            delete profile.profileImages
            profile.profileImages = imageSignedUrl
        }

        return h
            .response(
                messages.successResponse(
                    { profile: profile },
                    'Profile fetched successfully!'
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

function parseJsonField(value) {
    if (typeof value === 'string' && isValidJson(value)) {
        try {
            return JSON.parse(value)
        } catch (e) {
            console.error(`Error parsing value: ${value}`, e)
            return value // Return the original value if parsing fails
        }
    }
    return value
}

function isValidJson(str) {
    try {
        JSON.parse(str)
        return true
    } catch (e) {
        return false
    }
}

function parseJsonFieldsWithArrayKeys(obj) {
    const result = {}

    Object.keys(obj).forEach((key) => {
        const keyParts = key.match(/[^[\]]+/g)

        if (keyParts.length > 1) {
            let current = result

            for (let i = 0; i < keyParts.length - 1; i++) {
                const part = isNaN(keyParts[i])
                    ? keyParts[i]
                    : parseInt(keyParts[i], 10)

                if (!current[part]) {
                    current[part] = isNaN(keyParts[i + 1]) ? {} : []
                }
                current = current[part]
            }

            const lastKey = isNaN(keyParts[keyParts.length - 1])
                ? keyParts[keyParts.length - 1]
                : parseInt(keyParts[keyParts.length - 1], 10)

            const newValue = parseJsonField(obj[key])

            if (current[lastKey]) {
                if (Array.isArray(current[lastKey])) {
                    current[lastKey].push(newValue)
                } else if (
                    typeof current[lastKey] === 'object' &&
                    typeof newValue === 'object'
                ) {
                    current[lastKey] = { ...current[lastKey], ...newValue }
                } else {
                    current[lastKey] = [current[lastKey], newValue]
                }
            } else {
                // Assign if no existing value
                current[lastKey] = newValue
            }
        } else {
            // Simple keys
            const baseKey = keyParts[0]
            const newValue = parseJsonField(obj[key])

            if (result[baseKey]) {
                if (Array.isArray(result[baseKey])) {
                    result[baseKey].push(newValue)
                } else {
                    result[baseKey] = [result[baseKey], newValue]
                }
            } else {
                result[baseKey] = newValue
            }
        }
    })

    return result
}

function formatProfileImages(data, imageArray, type = 'profileImages') {
    const formattedImages = imageArray.map((image) => ({
        name: image,
        status: '1',
    }))

    return {
        ...data,
        [type]: formattedImages,
    }
}

function removeProfileImagesIndexedKeys(data) {
    const newData = { ...data }
    Object.keys(newData).forEach((key) => {
        if (/^profileImages\[\d+\]$/.test(key)) {
            delete newData[key]
        }
    })
    return newData
}

function removeKundaliImagesIndexedKeys(data) {
    const newData = { ...data }
    Object.keys(newData).forEach((key) => {
        if (/^kundaliImages\[\d+\]$/.test(key)) {
            delete newData[key]
        }
    })
    return newData
}

const getSignedUrl = async (req, filename) => {
    try {
        const objectKey = AWS_FOLDER + '/' + filename || ''
        const signedUrl =
            await req.server.plugins.s3Plugin.getSignedUrl(objectKey)
        return signedUrl
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
    save_profile,
    update_profile,
    get_profile,
    user_profile,
}
