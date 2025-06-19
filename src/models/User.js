const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["SUPER_ADMIN", "USER"], default: "USER" }, });

module.exports = mongoose.model("User", userSchema);
