const mongoose = require("mongoose");

const AnalyticsSchema = new mongoose.Schema({
  totalEmailsSent: { type: Number, required: true },
  openRate: { type: Number, required: true },
  clickRate: { type: Number, required: true },
  newSubscribers: { type: Number, required: true },
  monthlyPerformance: [
    {
      month: String,
      desktop: Number,
      mobile: Number,
    },
  ],
});
module.exports = mongoose.model('Analytics', AnalyticsSchema);