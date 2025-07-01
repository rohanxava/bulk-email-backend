const { Schema, model } = require("mongoose");
 
const otpSchema = new Schema({
    email: String,
    otp: String,
    createdAt: { type: Date, expires: "5m", default: Date.now },
});
 
module.exports = { otpSchema }; 