// src/controllers/tileController.js

const Tile = require("../models/Tile");
const Annotation = require("../models/Annotation");
const assignTile = async (req, res) => {
  // console.log("➡️ Tile assignment requested");

  const userId = req.user?._id || req.user?.id;
  // console.log("🔍 Decoded user from token:", req.user);

  if (!userId) {
    // console.warn("❗ No user ID in decoded token");
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // console.log("👤 Assigning tile to user:", userId);

    const existingTile = await Tile.findOne({ assignedTo: userId, status: 'in_progress' });
    if (existingTile) {
      // console.log("📦 Existing tile found:", existingTile._id);
      return res.status(200).json(existingTile);
    }

   const newTile = await Tile.findOneAndUpdate(
  {
    status: 'available',
    assignedTo: null,
    skippedBy: { $ne: userId }, // exclude previously skipped tiles
  },
  {
    assignedTo: userId,
    assignedAt: new Date(),
    status: 'in_progress',
  },
  { new: true }
);


    if (!newTile) {
      // console.warn("❌ No tile available");
      return res.status(404).json({ message: "No available tiles" });
    }

    // console.log("✅ New tile assigned:", newTile._id);
    res.status(200).json(newTile);
  } catch (err) {
    // console.error("🔥 Error in assignTile:", err);
    res.status(500).json({ message: "Server error" });
  }
};


const skipTile = async (req, res) => {
  const { tileId } = req.params;
  const userId = req.user?.id || req.user?._id;

  // console.log("📩 Skip request received for tile:", tileId);
  // console.log("👤 User:", userId);

  try {
    const tile = await Tile.findById(tileId);

    if (!tile) {
      return res.status(404).json({ message: "Tile not found" });
    }

    // Mark the tile as available again
    tile.status = "available";
    tile.assignedTo = null;
    tile.assignedAt = null;

    // Safely reset annotations field
    tile.annotations = undefined; // 👈 fix: don't assign empty array to ObjectId field

    // Add user to skippedBy
    if (!tile.skippedBy.includes(userId)) {
      tile.skippedBy.push(userId);
    }

    await tile.save();

    // console.log("✅ Tile marked as skipped and made available");
    res.status(200).json({ message: "Tile skipped" });
  } catch (err) {
    // console.error("🔥 Skip tile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};






const completeTile = async (req, res) => {
  const { tileId } = req.params;
  const { annotations } = req.body;

  if (!annotations || !Array.isArray(annotations)) {
    return res.status(400).json({ message: "Annotations are required" });
  }

  try {
    const tile = await Tile.findById(tileId);
    if (!tile) {
      return res.status(404).json({ message: "Tile not found" });
    }

    // Save each annotation and collect their IDs
    const savedAnnotations = await Annotation.insertMany(
      annotations.map((ann) => ({ ...ann, tile: tile._id }))
    );

    tile.status = "completed";
    tile.submittedAt = new Date();
    tile.annotations = savedAnnotations.map((a) => a._id);

    await tile.save();

    res.status(200).json({ message: "Tile marked complete" });
  } catch (err) {
    console.error("Tile submission error:", err);
    res.status(500).json({ message: "Server error" });
  }
};




module.exports = { assignTile,skipTile, completeTile };
