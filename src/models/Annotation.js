const mongoose = require("mongoose");

const annotationSchema = new mongoose.Schema({
  tile: { type: mongoose.Schema.Types.ObjectId, ref: 'Tile' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  geometry: {}, // GeoJSON format
  label: String,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Annotation', annotationSchema);
