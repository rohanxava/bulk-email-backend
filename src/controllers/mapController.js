
const fs = require("fs");
const path = require("path");
const Map = require("../models/Map");
const Tile = require("../models/Tile");
const { sliceMap } = require("../utils/tileSlicer");

exports.uploadMap = async (req, res) => {
  try {
    const { name, minLat, maxLat, minLng, maxLng, tileSizeKm = 10 } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ msg: "File missing" });
    }

    // ✅ Define bounds correctly
    const bounds = [
      parseFloat(minLat),
      parseFloat(maxLat),
      parseFloat(minLng),
      parseFloat(maxLng),
    ];

    if (bounds.some((val) => isNaN(val))) {
      return res.status(400).json({ msg: "Invalid latitude/longitude values" });
    }

    const fileUrl = `/uploads/maps/${file.filename}`;

    const newMap = await Map.create({
      name,
      fileUrl,
      bounds,
      tileSizeKm,
    });




    const tileBounds = sliceMap(bounds, tileSizeKm);
    console.log("Total tiles to insert:", tileBounds.length);

    const BATCH_SIZE = 500;
    const allTiles = [];

    for (let i = 0; i < tileBounds.length; i += BATCH_SIZE) {
      const batch = tileBounds.slice(i, i + BATCH_SIZE).map((b) => ({
        map: newMap._id,
        bounds: b,
        status: 'available',
        assignedTo: null,
      }));
      const inserted = await Tile.insertMany(batch);
      allTiles.push(...inserted);
    }

    newMap.tiles = allTiles.map((t) => t._id);
    await newMap.save();

    return res.status(201).json({
      msg: "Map uploaded successfully",
      name: newMap.name,
      tilesCreated: allTiles.length,
    });

  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ msg: "Upload failed", error: err.message });
  }
};




exports.getMaps = async (req, res) => {
  try {
    const maps = await Map.find().populate("tiles");
    res.json(maps);
  } catch (err) {
    res.status(500).json({ msg: "Fetching maps failed" });
  }
};