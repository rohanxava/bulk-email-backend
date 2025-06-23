const mongoose = require("mongoose");

const annotationSchema = new mongoose.Schema({
  tileId: { type: mongoose.Schema.Types.ObjectId, ref: "Tile" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: String, // "point" or "polygon"
  data: mongoose.Schema.Types.Mixed,
  label: String,
  notes: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Annotation", annotationSchema);
