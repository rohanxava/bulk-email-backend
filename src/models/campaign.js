const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  campaignName: { type: String, required: true },
  subject: { type: String, required: true },
  htmlContent: { type: String, required: true },
  status: { type: String, enum: ['Draft', 'Active', 'Sent', 'Failed'], default: 'Draft' },
  recipients: { type: Number, default: 0 },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdDate: { type: Date, default: Date.now },
  csvContent: { type: String, default: "" },
  manualEmails: [{ type: String }],
  projectId: { type: String },
  templateId: { type: String },
  fromEmail: { type: String, default: "no-reply@example.com" },
  stats: {
    desktop: { type: Number, default: 0 },
    mobile: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 }
  },
});

module.exports = mongoose.model('Campaign', campaignSchema);
