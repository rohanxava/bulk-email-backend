// --- models/User.js ---
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  otp: String,
  otpExpires: Date,
  hasVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('User', userSchema);