// src/controllers/tileController.js

const Tile = require("../models/Tile");

const assignTile = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find the first available tile
    const tile = await Tile.findOneAndUpdate(
      { status: 'available' },
      { assignedTo: userId, status: 'in_progress' },
      { new: true }
    );

    if (!tile) {
      return res.status(404).json({ message: "No available tiles" });
    }

    res.status(200).json(tile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const completeTile = async (req, res) => {
  const { tileId } = req.params;
  const { annotations } = req.body;

  try {
    const tile = await Tile.findById(tileId);
    if (!tile) {
      return res.status(404).json({ message: "Tile not found" });
    }

    tile.status = 'completed';
    tile.submittedAt = new Date();
    tile.annotations = annotations;
    await tile.save();

    res.status(200).json({ message: "Tile marked complete" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { assignTile, completeTile };
