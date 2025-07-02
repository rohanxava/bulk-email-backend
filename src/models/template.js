const mongoose = require('mongoose');
const templateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    subject: { type: String, required: true },
    htmlContent: { type: String, required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Template', templateSchema);