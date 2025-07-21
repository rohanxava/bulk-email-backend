const mongoose = require('mongoose');

const ContactListSchema = new mongoose.Schema({
  name: String,
  fileName: String,
  fileType: String,
  contacts: [
    {
      firstName: String,
      lastName: String,
      email: String,
    },
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 🔥 Add this line
}, { timestamps: true });

module.exports = mongoose.model('ContactList', ContactListSchema);
