const Joi = require('joi')
const {
    save_profile,
    update_profile,
    get_profile,
    user_profile,
    delete_profile_image,
} = require('../handlers/profile') // Ensure this path is correct

module.exports = [
    {
        method: 'POST',
        path: '/v1/profile/save',
        config: {
            handler: save_profile,
            payload: {
                maxBytes: 50 * 1024 * 1024,
                output: 'file',
                parse: true,
                multipart: true,
            },
            validate: {},
        },
    },
    {
        method: 'POST',
        path: '/v1/profile/update',
        config: {
            handler: update_profile,
            payload: {
                maxBytes: 50 * 1024 * 1024,
                output: 'file',
                parse: true,
                multipart: true,
            },
            validate: {},
        },
    },
    {
        method: 'GET',
        path: '/v1/profile/get-profile',
        config: {
            handler: get_profile,
            validate: {},
        },
    },
    {
        method: 'GET',
        path: '/v1/profile/user-profile/{userId}',
        config: {
            handler: user_profile,
            validate: {},
        },
    },
    {
        method: 'POST',
        path: '/v1/profile/users/delete-image',
        config: {
            handler: delete_profile_image,
            validate: {
                payload: Joi.object({
                    profile: Joi.string().trim().required(),
                    image: Joi.string().trim().required(),
                    type: Joi.string().trim().required(),
                    api_type: Joi.string().trim().required(),
                }),
            },
        },
    },
]
