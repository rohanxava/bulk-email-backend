const Tile = require("../models/Tile");
const Annotation = require("../models/Annotation");

exports.getAssignedTile = async (req, res) => {
  try {
    let tile = await Tile.findOne({ assignedTo: req.user._id, status: "in_progress" });
    if (!tile) {
      tile = await Tile.findOneAndUpdate(
        { status: "available" },
        { status: "in_progress", assignedTo: req.user._id },
        { new: true }
      );
    }
    if (!tile) return res.status(404).json({ msg: "No available tiles" });
    res.json(tile);
  } catch (err) {
    res.status(500).json({ msg: "Tile assignment failed" });
  }
};

exports.submitTile = async (req, res) => {
  const { tileId, annotations } = req.body;
  try {
    const savedAnnotations = await Annotation.insertMany(
      annotations.map(a => ({ ...a, tile: tileId, user: req.user._id }))
    );
    await Tile.findByIdAndUpdate(tileId, {
      status: "completed",
      submittedAt: new Date(),
      $push: { annotations: { $each: savedAnnotations.map(a => a._id) } }
    });
    res.json({ msg: "Tile submitted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Tile submission failed" });
  }
};