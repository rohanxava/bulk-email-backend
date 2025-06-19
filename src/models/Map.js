const mongoose = require("mongoose");

const mapSchema = new mongoose.Schema({
  name: String,
  fileUrl: String,
  bounds: { type: [Number] }, // [minLon, minLat, maxLon, maxLat]
  tileSizeKm: Number,
  tiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tile' }]
}, { timestamps: true });

module.exports = mongoose.model('Map', mapSchema);
