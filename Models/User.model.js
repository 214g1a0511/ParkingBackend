const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email_id: {
        type: String,
        required: true
    },
    full_name: {
        type: String,
        required: true,
        unique: true
    },
    phone_number: {
        type: String,
        required: true
    },
    password: {
        type: String,
        default: ""
    },
    parking_vendor: { type: String, default: "", required: true },
    layout: {
        bike: [{
            slot: { type: String },
            booked: { type: String, default: false }
        }],
        car: [{
            slot: { type: String },
            booked: { type: String, default: false }
        }]
    }
},
    { timestamps: true });

const UserModel = mongoose.model('Parking@users', UserSchema);
module.exports = UserModel