const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  campaignName: { type: String, required: true },
  subject: { type: String, required: true },
  htmlContent: { type: String, required: true },
  scheduleDate: { type: Date },
  status: { type: String, enum: ["Draft", "Scheduled", "Sent"], default: "Draft" },
  recipients: { type: Number, default: 0 },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdDate: { type: Date, default: Date.now },
  csvContent: { type: String, default: "" },
  manualEmails: [{ type: String }],
  contacts: [
    {
      firstName: String,
      lastName: String,
      email: String,
    },
  ],
  projectId: { type: String },
  templateId: { type: String },
  fromEmail: { type: String, default: "no-reply@example.com" },
  stats: {
    desktop: { type: Number, default: 0 },
    mobile: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 }
  },
  attachmentFile: { type: String, default: null }, // base64-encoded content
  attachmentMeta: {
    filename: { type: String },
    mimetype: { type: String },
    disposition: { type: String },
  }
});

module.exports = mongoose.model('Campaign', campaignSchema);
