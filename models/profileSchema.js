const mongoose = require('mongoose')

const userProfileSchema = new mongoose.Schema({
    personalDetails: {
        first_name: { type: String, required: true, trim: true, maxlength: 50 },
        middle_name: { type: String, trim: true, maxlength: 50 },
        last_name: { type: String, required: true, trim: true, maxlength: 50 },
        age: { type: Number, required: true, min: 18 },
        gender: { type: String, enum: ['male', 'female'], required: true },
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
        height: { type: Number, default: null },
        weight: { type: Number, default: null },
        hobbies: {
            type: [String],
            trim: true,
            default: [],
        },
        aboutMe: { type: String, trim: true, default: null },
        lookingFor: { type: String, trim: true, default: null },
    },
    contactDetails: {
        parentNumber: { type: String, trim: true, default: null },
        selfNumber: { type: String, trim: true, default: null },
    },
    religiousDetails: {
        religion: { type: String, trim: true },
        caste: { type: String, required: true, trim: true },
        subCaste: { type: String, trim: true, default: null },
        language: { type: String, trim: true, default: null },
        gotra: { type: String, trim: true, default: null },
    },
    astroDetails: {
        dob: { type: Date, required: true },
        pob: { type: String, required: true, trim: true },
        tob: { type: String, required: true, trim: true },
        rashi: { type: String, trim: true, default: null },
        nakshatra: { type: String, trim: true, default: null },
    },
    familyDetails: {
        fatherName: { type: String, required: true, trim: true },
        motherName: { type: String, required: true, trim: true },
        brotherName: { type: String, trim: true, default: null },
        fatherOccupation: { type: String, required: true, trim: true },
        motherOccupation: { type: String, trim: true, default: null },
        noOfBrothers: { type: Number, default: null },
        noOfSisters: { type: Number, default: null },
        financialStatus: { type: String, trim: true, default: null },
        familyIncome: { type: String, trim: true, default: null },
    },
    educationDetails: {
        degree: { type: String, required: true, trim: true },
        collegeName: { type: String, required: true, trim: true },
    },
    employmentDetails: {
        employeeIn: { type: String, required: true, trim: true },
        companyName: { type: String, trim: true, default: null },
        designation: { type: String, trim: true, default: null },
        income: { type: String, default: null },
    },
    address: {
        nativePlace: { type: String, trim: true, default: null },
        residential: {
            state: { type: String, trim: true, required: true, default: null },
            district: {
                type: String,
                trim: true,
                required: true,
                default: null,
            },
            pinCode: {
                type: String,
                trim: true,
                required: true,
                default: null,
            },
            addressLine: {
                type: String,
                trim: true,
                required: true,
                default: null,
            }, // For detailed address
        },
        permanent: {
            state: { type: String, trim: true, required: true, default: null },
            district: {
                type: String,
                trim: true,
                required: true,
                default: null,
            },
            pinCode: {
                type: String,
                trim: true,
                required: true,
                default: null,
            },
            addressLine: {
                type: String,
                trim: true,
                required: true,
                default: null,
            }, // For detailed address
        },
    },
    socialMedia: {
        facebook: { type: String, trim: true, default: null },
        linkedin: { type: String, trim: true, default: null },
        instagram: { type: String, trim: true, default: null },
    },
    profileImages: [
        {
            name: { type: String, required: false, trim: true },
            status: { type: Number, enum: [0, 1], default: 1 },
            primary: { type: Number, enum: [0, 1], default: 0 },
        },
    ],
    kundaliImages: [
        {
            name: { type: String, trim: true },
            status: { type: Number, enum: [0, 1], default: 1 },
            primary: { type: Number, enum: [0, 1], default: 0 },
        },
    ],
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending',
    },
    isPublished: { type: Boolean, default: false },
    subscriptionStartDate: { type: Date, default: null },
    subscriptionEndDate: { type: Date, default: null },
    subscriptionHistory: [
        {
            startDate: { type: Date },
            endDate: { type: Date },
            paymentId: { type: String, default: null },
        },
    ],
    payments: [
        {
            amount: { type: Number, required: true },
            paymentDate: { type: Date, default: Date.now },
            status: {
                type: String,
                enum: ['pending', 'completed', 'failed'],
                required: true,
            },
            transactionId: { type: String, required: false },
        },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: String, default: null },
    updatedBy: { type: String, default: null },
    diet: {
        type: String,
        enum: ['vegetarian', 'non-vegetarian', 'vegan', ''],
        default: '',
    },
})

const userProfileModal = mongoose.model('Profile', userProfileSchema)

module.exports = { userProfileModal }
