const Boom = require('@hapi/boom')
const fs = require('fs').promises
const logger = require('../logger')
const Joi = require('joi')
const messages = require('../messages/messages')
const { userProfileModal } = require('../models/profileSchema.js')
const mongoose = require('mongoose')
const moment = require('moment')
const { getFileExtension, getContentType } = require('../constants')
const save_profile = async (req, h) => {
    const { rows } = req.auth.credentials
    let payload = parseJsonFieldsWithArrayKeys(req.payload)
    payload = { ...payload, created_by: rows.unique_id }

    try {
        const schema = getValidationSchema()

        // Validate payload
        const { error } = schema.validate(payload)
        if (error) {
            throw messages.createNotFoundError(error.details[0].message)
        }
        if (payload.profileImages.length > 0) {
            const uploadPromises = payload.profileImages.map(
                async (fileData) => {
                    const name = await uploadFileToS3(req, fileData)
                    return name
                }
            )

            const uploadedFileNames = await Promise.all(uploadPromises)
            payload = formatProfileImages(payload, uploadedFileNames)
            payload = removeProfileImagesIndexedKeys(payload)
        }

        if (payload.kundaliImages.length > 0) {
            const uploadPromises = payload.kundaliImages.map(
                async (fileData) => {
                    const name = await uploadFileToS3(req, fileData)
                    return name
                }
            )

            const uploadedFileNames = await Promise.all(uploadPromises)
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
                messages.successResponse({}, `Profile created successfully!`)
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
            first_name: Joi.string().trim().max(50).required().messages({
                'string.max': 'First name must not exceed 50 characters.',
                'any.required': 'First name is required.',
            }),
            middle_name: Joi.string().trim().allow('').optional(),
            last_name: Joi.string().trim().max(50).required().messages({
                'string.max': 'Last name must not exceed 50 characters.',
                'any.required': 'Last name is required.',
            }),
            age: Joi.number().integer().greater(18).required().messages({
                'number.base': 'Age must be a number.',
                'number.greater': 'Age must be greater than 18.',
                'any.required': 'Age is required.',
            }),
            gender: Joi.string().valid('male', 'female').required().messages({
                'any.only': 'Gender must be either male or female.',
                'any.required': 'Gender is required.',
            }),
            blood_group: Joi.string()
                .valid('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')
                .optional(),
            complexion: Joi.string()
                .valid('Fair', 'Wheatish', 'Dusky', 'Dark')
                .optional(),
            height: Joi.number().optional(),
            weight: Joi.number().optional(),
        }).required(),
        religiousDetails: Joi.object({
            caste: Joi.string()
                .trim()
                .required()
                .messages({ 'any.required': 'Caste is required.' }),
            subCaste: Joi.string().trim().optional(),
            language: Joi.string().trim().optional(),
            gotra: Joi.string().trim().optional(),
        }).required(),
        astroDetails: Joi.object({
            dob: Joi.date()
                .required()
                .messages({ 'any.required': 'Date of birth is required.' }),
            pob: Joi.string()
                .trim()
                .required()
                .messages({ 'any.required': 'Place of birth is required.' }),
            tob: Joi.string()
                .trim()
                .required()
                .messages({ 'any.required': 'Time of birth is required.' }),
            rashi: Joi.string().trim().optional(),
            nakshatra: Joi.string().trim().optional(),
        }).required(),
        // Define additional validation as needed...
    }).unknown(true)

const uploadFileToS3 = async (request, fileData) => {
    try {
        const extension = getFileExtension(fileData)
        const fileType = getContentType(fileData)
        const timestamp = moment().valueOf() + '.' + extension
        const file = 'biomate/' + timestamp
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
        // Update the profile document and return the updated document
        const updatedUserProfile = await userProfileModal.findByIdAndUpdate(
            payload.id,
            { $set: payload },
            { new: true, runValidators: true }
        )

        if (!updatedUserProfile) {
            // If no profile found, return an error response
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
        const profile = await userProfileModal.find({
            created_by: rows.unique_id,
        })
        if (!profile) {
            throw Boom.notFound('Profile not found for this user')
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

const user_profile = async (req, h) => {
    const userId = req.params.userId
    const ObjectId = mongoose.Types.ObjectId
    try {
        const objectId = new ObjectId(userId)
        const profile = await userProfileModal.findOne({
            _id: objectId,
        })
        if (!profile) {
            throw Boom.notFound('Profile not found for this user')
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
    // Loop through each key in the object
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            const keyParts = key.split(/\[|\]/).filter(Boolean)
            if (keyParts.length > 1) {
                const baseKey = keyParts[0]
                const index = parseInt(keyParts[1], 10)
                if (!isNaN(index)) {
                    if (!obj[baseKey]) {
                        obj[baseKey] = []
                    }
                    obj[baseKey][index] = parseJsonField(obj[key])
                }
            } else {
                // If it's a simple key (no array-like notation), parse the field
                obj[key] = parseJsonField(obj[key])
            }
        }
    }
    return obj
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

module.exports = {
    save_profile,
    update_profile,
    get_profile,
    user_profile,
}
