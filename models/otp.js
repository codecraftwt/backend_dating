const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
    phoneNumber: { type: String, required: true },
    otp: { type: Number, required: true },
    otpExpiration: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
}).index({ unique: true });

module.exports = mongoose.model("otp", OtpSchema);
