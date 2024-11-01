const Joi = require('joi')
const { login, jwtGenerate, user_register } = require('../handlers/login') // Ensure this path is correct

module.exports = [
    {
        method: 'POST',
        path: '/v1/users/generate-token',
        config: {
            handler: jwtGenerate,
            validate: {
                payload: Joi.object({
                    mobile: Joi.string().trim().required(),
                }),
            },
        },
    },
    {
        method: 'POST',
        path: '/v1/users/register',
        config: {
            handler: user_register,
            validate: {
                payload: Joi.object({
                    mobile: Joi.string()
                        .pattern(/^[0-9]{10}$/)
                        .required(),
                    name: Joi.string().min(4).max(70).required(),
                    state: Joi.string().min(2).max(30).required(),
                    district: Joi.string().min(2).max(30).required(),
                }),
            },
        },
    },
]
