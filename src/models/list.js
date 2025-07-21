// models/ContactList.js
const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, required: true }
});

const ContactListSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  contacts: [ContactSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ContactList', ContactListSchema);
