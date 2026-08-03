const mongoose = require('mongoose');  
const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    isVerified: { type: Boolean, default: false },
    verificationCodeHash: { type: String, default: null },
    verificationExpires: { type: Date, default: null },
    verificationAttempts: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);