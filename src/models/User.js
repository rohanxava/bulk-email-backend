// --- models/User.js ---
const mongoose = require('mongoose'); 

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  role: { type: String, enum: ['super_admin', 'user'], default: 'user' },
  password: String, 
  otp: String,
  otpExpires: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 👈 Add this
  hasVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('User', userSchema);