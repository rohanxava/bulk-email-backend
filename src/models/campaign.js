const mongoose = require('mongoose');
const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  htmlContent: { type: String, required: true },
  status: { type: String, enum: ['Draft', 'Active', 'Sent', 'Failed'], default: 'Draft' },
  recipients: { type: Number, default: 0 },
  createdBy: { type: String },
  createdDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Campaign', campaignSchema);

