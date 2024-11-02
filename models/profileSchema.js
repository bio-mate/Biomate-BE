const mongoose = require('mongoose')

const userProfileSchema = new mongoose.Schema({
    personal_details: {
        first_name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },
        middle_name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },
        last_name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },
        age: {
            type: Number,
            required: true,
            min: 18,
        },
        gender: {
            type: String,
            enum: ['male', 'female'],
            required: true,
        },
        blood_group: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
            default: null,
        },
        complexion: {
            type: String,
            enum: ['Fair', 'Wheatish', 'Dusky', 'Dark'],
            default: null,
        },
        height: {
            type: Number,
            default: null,
        },
        weight: {
            type: Number,
            default: null,
        },
    },
    religious_background: {
        caste: { type: String, required: true, trim: true },
        subCaste: { type: String, trim: true, default: null },
        language: { type: String, trim: true, default: null },
        gotra: { type: String, trim: true, default: null },
    },
    astro_details: {
        dob: { type: Date, required: true },
        pob: { type: String, required: true, trim: true },
        tob: { type: String, required: true, trim: true },
        rashi: { type: String, trim: true, default: null },
        nakshtra: { type: String, trim: true, default: null },
    },
    family_details: {
        father_name: { type: String, required: true, trim: true },
        mother_name: { type: String, required: true, trim: true },
        brother_name: { type: String, trim: true, default: null },
        father_occupation: { type: String, required: true, trim: true },
        mother_occupation: { type: String, trim: true, default: null },
        no_of_brothers: { type: Number, default: null },
        no_of_sisters: { type: Number, default: null },
    },
    education_details: {
        degree: { type: String, required: true, trim: true },
        college_name: { type: String, required: true, trim: true },
    },
    employment_details: {
        employee_in: { type: String, required: true, trim: true },
        company_name: { type: String, trim: true, default: null },
        designation: { type: String, trim: true, default: null },
        income: { type: Number, default: null },
    },
    profile_images: [
        {
            url: { type: String, required: true, trim: true }, // URL or path to the image
            status: { type: Number, enum: [0, 1], default: 1 }, // 1 for published, 0 for unpublished
        },
    ],
    kundali_images: [
        {
            url: { type: String, trim: true }, // URL or path to the kundali image
            status: { type: Number, enum: [0, 1], default: 1 }, // 1 for published, 0 for unpublished
        },
    ],
    payment_status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending',
    },
    is_published: {
        type: Boolean,
        default: false,
    },
    subscription_start_date: {
        type: Date,
        default: null,
    },
    subscription_end_date: {
        type: Date,
        default: null,
    },
    subscription_history: [
        {
            start_date: { type: Date },
            end_date: { type: Date },
            payment_id: {
                type: String, // Now a string
                default: null,
            },
        },
    ],
    payments: [
        {
            amount: {
                type: Number,
            },
            payment_date: {
                type: Date,
                default: Date.now,
            },
            status: {
                type: String,
                enum: ['pending', 'completed', 'failed'],
            },
            transaction_id: {
                type: String,
                unique: true,
            },
        },
    ],
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
    created_by: {
        type: String,
        default: null,
    },
    updated_by: {
        type: String,
        default: null,
    },
    address: {
        state: { type: String, trim: true, required: true, default: null },
        district: { type: String, trim: true, required: true, default: null },
        residential_address: { type: String, required: true, default: null },
        permanent_address: { type: String, required: true, default: null },
    },
    social_media: {
        facebook: { type: String, trim: true, default: null },
        linkedin: { type: String, trim: true, default: null },
        instagram: { type: String, trim: true, default: null },
    },
    diet: {
        type: String,
        enum: ['Veg', 'Non-Veg', 'Vegan'],
        default: null,
    },
})

const userProfileModal = new mongoose.model('profile', userProfileSchema)

module.exports = { userProfileModal }
