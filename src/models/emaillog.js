const mongoose = require('mongoose');


const emailLogSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  to: String,
  subject: String,
  body: String,
  status: { type: String, enum: ['Delivered', 'Opened', 'Clicked', 'Failed'], default: 'Delivered' },
  timestamp: { type: Date, default: Date.now },
});
module.exports = mongoose.model('EmailLog', emailLogSchema);