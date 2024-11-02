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
            validate: {
                payload: Joi.object({
                    personalDetails: Joi.object({
                        first_name: Joi.string()
                            .trim()
                            .max(50)
                            .required()
                            .messages({
                                'string.max':
                                    'First name must not exceed 50 characters.',
                                'any.required': 'First name is required.',
                            }),
                        middle_name: Joi.string()
                            .trim()
                            .max(50)
                            .required()
                            .messages({
                                'string.max':
                                    'Middle name must not exceed 50 characters.',
                                'any.required': 'Middle name is required.',
                            }),
                        last_name: Joi.string()
                            .trim()
                            .max(50)
                            .required()
                            .messages({
                                'string.max':
                                    'Last name must not exceed 50 characters.',
                                'any.required': 'Last name is required.',
                            }),
                        age: Joi.number()
                            .integer()
                            .greater(18)
                            .required()
                            .messages({
                                'number.base': 'Age must be a number.',
                                'number.greater':
                                    'Age must be greater than 18.',
                                'any.required': 'Age is required.',
                            }),
                        gender: Joi.string()
                            .valid('male', 'female')
                            .required()
                            .messages({
                                'any.only':
                                    'Gender must be either male or female.',
                                'any.required': 'Gender is required.',
                            }),
                        blood_group: Joi.string()
                            .valid(
                                'A+',
                                'A-',
                                'B+',
                                'B-',
                                'O+',
                                'O-',
                                'AB+',
                                'AB-'
                            )
                            .optional(),
                        complexion: Joi.string()
                            .valid('Fair', 'Wheatish', 'Dusky', 'Dark')
                            .optional(),
                        height: Joi.number().optional(),
                        weight: Joi.number().optional(),
                    }).required(),
                    religiousDetails: Joi.object({
                        caste: Joi.string().trim().required().messages({
                            'any.required': 'Caste is required.',
                        }),
                        subCaste: Joi.string().trim().optional(),
                        language: Joi.string().trim().optional(),
                        gotra: Joi.string().trim().optional(),
                    }).required(),
                    astroDetails: Joi.object({
                        dob: Joi.date().required().messages({
                            'any.required': 'Date of birth is required.',
                        }),
                        pob: Joi.string().trim().required().messages({
                            'any.required': 'Place of birth is required.',
                        }),
                        tob: Joi.string().trim().required().messages({
                            'any.required': 'Time of birth is required.',
                        }),
                        rashi: Joi.string().trim().optional(),
                        nakshtra: Joi.string().trim().optional(),
                    }).required(),
                    familyDetails: Joi.object({
                        fatherName: Joi.string().trim().required().messages({
                            'any.required': 'Father name is required.',
                        }),
                        motherName: Joi.string().trim().required().messages({
                            'any.required': 'Mother name is required.',
                        }),
                        brotherName: Joi.string().trim().optional(),
                        fatherOccupation: Joi.string()
                            .trim()
                            .required()
                            .messages({
                                'any.required':
                                    'Father occupation is required.',
                            }),
                        motherOccupation: Joi.string().trim().optional(),
                        noOfBrothers: Joi.number().optional(),
                        noOfSisters: Joi.number().optional(),
                    }).required(),
                    educationDetails: Joi.object({
                        degree: Joi.string().trim().required().messages({
                            'any.required': 'Degree is required.',
                        }),
                        collegeName: Joi.string().trim().required().messages({
                            'any.required': 'College name is required.',
                        }),
                    }).required(),
                    employmentDetails: Joi.object({
                        employeeIn: Joi.string().trim().required().messages({
                            'any.required': 'Employee in is required.',
                        }),
                        companyName: Joi.string().trim().optional(),
                        designation: Joi.string().trim().optional(),
                        income: Joi.number().optional(),
                    }).required(),
                    address: Joi.object({
                        state: Joi.string().trim().optional(),
                        district: Joi.string().trim().optional(),
                        residentialAddress: Joi.string().trim().optional(),
                        permanentAddress: Joi.string().trim().optional(),
                    }).optional(),
                    socialMedia: Joi.object({
                        facebook: Joi.string().uri().optional(),
                        linkedin: Joi.string().uri().optional(),
                        instagram: Joi.string().uri().optional(),
                    }).optional(),
                    profileImages: Joi.array()
                        .items(
                            Joi.object({
                                url: Joi.string().uri().required().messages({
                                    'any.required':
                                        'Profile image URL is required.',
                                }),
                                status: Joi.number()
                                    .valid(0, 1)
                                    .default(1)
                                    .optional(),
                            })
                        )
                        .min(1)
                        .required()
                        .messages({
                            'array.min':
                                'At least one profile image is required.',
                        }),
                    kundaliImages: Joi.array()
                        .items(
                            Joi.object({
                                url: Joi.string().uri().optional(),
                                status: Joi.number()
                                    .valid(0, 1)
                                    .default(1)
                                    .optional(),
                            })
                        )
                        .optional(),
                    paymentStatus: Joi.string()
                        .valid('pending', 'completed')
                        .required(),
                    isPublished: Joi.boolean().required(),
                    diet: Joi.string()
                        .valid('vegetarian', 'non-vegetarian', 'vegan')
                        .optional(),
                }).unknown(true),
            },
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
                    middle_name: Joi.string()
                        .trim()
                        .max(50)
                        .messages({
                            'string.max':
                                'Middle name must not exceed 50 characters.',
                        })
                        .optional(),
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
                })
                    .or(
                        'first_name',
                        'middle_name',
                        'last_name',
                        'age',
                        'gender'
                    ) // Ensures at least one key is required
                    .messages({
                        'object.missing':
                            'At least one field must be provided.',
                    })
                    .unknown(true),
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
