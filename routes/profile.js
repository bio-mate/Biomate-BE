const Joi = require('joi')
const {
    save_profile,
    update_profile,
    get_profile,
    user_profile,
} = require('../handlers/profile') // Ensure this path is correct

module.exports = [
    {
        method: 'POST',
        path: '/v1/profile/save',
        config: {
            handler: save_profile,
            payload: {
                maxBytes: 10 * 1024 * 1024,
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
            validate: {
                payload: Joi.object({
                    id: Joi.string().trim().required(),
                    first_name: Joi.string()
                        .trim()
                        .max(50)
                        .messages({
                            'string.max':
                                'First name must not exceed 50 characters.',
                        })
                        .optional(),
                    middle_name: Joi.string().trim().allow('').optional(),
                    last_name: Joi.string()
                        .trim()
                        .max(50)
                        .messages({
                            'string.max':
                                'Last name must not exceed 50 characters.',
                        })
                        .optional(),
                    age: Joi.number()
                        .integer()
                        .greater(18)
                        .messages({
                            'number.base': 'Age must be a number.',
                            'number.greater': 'Age must be greater than 18.',
                        })
                        .optional(),
                    gender: Joi.string()
                        .valid('male', 'female')
                        .messages({
                            'any.only': 'Gender must be either male or female.',
                        })
                        .optional(),
                    blood_group: Joi.string()
                        .valid('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')
                        .optional(),
                    complexion: Joi.string()
                        .valid('Fair', 'Wheatish', 'Dusky', 'Dark')
                        .optional(),
                    height: Joi.number().optional(),
                    weight: Joi.number().optional(),
                    religious_background: Joi.object({
                        caste: Joi.string().trim().messages({
                            'any.required': 'Caste is required.',
                        }),
                        subCaste: Joi.string().trim().optional(),
                        language: Joi.string().trim().optional(),
                        gotra: Joi.string().trim().optional(),
                    }).optional(),
                    astro_details: Joi.object({
                        dob: Joi.date().messages({
                            'any.required': 'Date of birth is required.',
                        }),
                        pob: Joi.string().trim().messages({
                            'any.required': 'Place of birth is required.',
                        }),
                        tob: Joi.string().trim().messages({
                            'any.required': 'Time of birth is required.',
                        }),
                        rashi: Joi.string().trim().optional(),
                        nakshtra: Joi.string().trim().optional(),
                    }).optional(),
                    family_details: Joi.object({
                        father_name: Joi.string().trim().messages({
                            'any.required': 'Father name is required.',
                        }),
                        mother_name: Joi.string().trim().messages({
                            'any.required': 'Mother name is required.',
                        }),
                        brother_name: Joi.string().trim().optional(),
                        father_occupation: Joi.string().trim().messages({
                            'any.required': 'Father occupation is required.',
                        }),
                        mother_occupation: Joi.string().trim().optional(),
                        no_of_brothers: Joi.number().optional(),
                        no_of_sisters: Joi.number().optional(),
                    }).optional(),
                    education_details: Joi.object({
                        degree: Joi.string().trim().messages({
                            'any.required': 'Degree is required.',
                        }),
                        college_name: Joi.string().trim().messages({
                            'any.required': 'College name is required.',
                        }),
                    }).optional(),
                    employment_details: Joi.object({
                        employee_in: Joi.string().trim().messages({
                            'any.required': 'Employee in is required.',
                        }),
                        company_name: Joi.string().trim().optional(),
                        designation: Joi.string().trim().optional(),
                        income: Joi.number().optional(),
                    }).optional(),
                    profile_images: Joi.array()
                        .items(
                            Joi.object({
                                url: Joi.string().uri().required().messages({
                                    'any.required':
                                        'Profile image URL is required.',
                                }),
                                status: Joi.number()
                                    .valid(0, 1)
                                    .default(1) // Default to 1 if not provided
                                    .optional(),
                            })
                        )
                        .min(1) // At least one image is required
                        .optional()
                        .messages({
                            'array.min':
                                'At least one profile image is required.',
                        }),
                    kundali_images: Joi.array()
                        .items(
                            Joi.object({
                                url: Joi.string().uri().optional(),
                                status: Joi.number()
                                    .valid(0, 1)
                                    .default(1) // Default to 1 if not provided
                                    .optional(),
                            })
                        )
                        .optional(),
                }).unknown(true),
            },
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
]
