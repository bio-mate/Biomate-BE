const mongoose = require('mongoose')

const loginHistorySchema = new mongoose.Schema({
    user_id: {
        type: String,
        ref: 'UserProfile', // Reference to the user profile model
        required: true,
    },
    login_time: {
        type: Date,
        default: Date.now,
        required: true,
    },
    ip_address: {
        type: String,
        trim: true,
        default: null,
    },
    device_info: {
        type: String,
        trim: true,
        default: null,
    },
})

const loginHistoryModal = new mongoose.model('loginHist', loginHistorySchema)

module.exports = { loginHistoryModal }
