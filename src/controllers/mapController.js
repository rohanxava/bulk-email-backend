const Map = require("../models/Map");
const Tile = require("../models/Tile");
const { sliceMap } = require("../utils/tileSlicer");

exports.uploadMap = async (req, res) => {
  const { name, fileUrl, bounds, tileSizeKm } = req.body;
  try {
    const newMap = await Map.create({ name, fileUrl, bounds, tileSizeKm });
    const tileBounds = sliceMap(bounds, tileSizeKm);
    const tiles = await Tile.insertMany(
      tileBounds.map(b => ({ map: newMap._id, bounds: b }))
    );
    newMap.tiles = tiles.map(t => t._id);
    await newMap.save();
    res.status(201).json(newMap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Map upload failed" });
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