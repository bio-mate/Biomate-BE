const mongoose = require('mongoose')

function generateUniqueId() {
    const timestamp = Math.floor(Date.now() / 1000)
    const random4Digit = Math.floor(1000 + Math.random() * 9000) // 4-digit random number
    return `${timestamp}${random4Digit}`
}

const userSchema = new mongoose.Schema({
    unique_id: {
        type: String,
        unique: true,
        default: generateUniqueId,
    },
    mobile: {
        type: 'string',
        validate: {
            validator: function (v) {
                return /^\d{10}$/.test(v)
            },
            message: (props) => `${props.value} is not a valid 10-digit number`,
        },
        required: true,
    },
    name: {
        type: 'string',
        minLength: 1,
        required: true,
    },
    state: {
        type: 'string',
        minLength: 1,
        required: true,
    },
    district: {
        type: 'string',
        minLength: 1,
        required: true,
    },
    secretKey: {
        type: 'string',
        minLength: 1,
        required: true,
    },
    is_active: {
        type: Boolean,
        default: true,
        required: true,
    },
    createdOn: {
        type: Date,
        default: Date.now,
    },
    updatedOn: {
        type: Date,
        default: Date.now,
    },
})
const userModal = new mongoose.model('users', userSchema)

module.exports = { userModal }
