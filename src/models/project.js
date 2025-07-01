const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sendGridApiKey: String,
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Project', projectSchema);