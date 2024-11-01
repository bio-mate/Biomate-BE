const Boom = require('@hapi/boom')
const messages = require('../messages/messages')
const { userProfileModal } = require('../models/profileSchema.js')
const mongoose = require('mongoose')
const save_profile = async (req, h) => {
    const { rows } = req.auth.credentials
    const payload = { ...req.payload, created_by: rows.unique_id }
    try {
        const newUserProfile = await userProfileModal.create(payload)
        return h
            .response(
                messages.successResponse(
                    { id: newUserProfile._id, profile: newUserProfile },
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

module.exports = {
    save_profile,
    update_profile,
    get_profile,
    user_profile,
}
