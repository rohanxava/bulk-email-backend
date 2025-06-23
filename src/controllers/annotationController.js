// controllers/annotationController.js
const Annotation = require("../models/Annotation"); // Adjust the path as per your structure

// Save a single annotation to DB
exports.saveAnnotation = async (req, res) => {
  try {
    const annotation = new Annotation(req.body);
    await annotation.save();
    res.status(201).json(annotation);
  } catch (error) {
    console.error("❌ Annotation save error:", error);
    res.status(500).json({ message: "Failed to save annotation" });
  }
};

// Get all annotations for a user (optional, for Past Annotations or debugging)
exports.getAnnotationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const annotations = await Annotation.find({ userId });
    res.json(annotations);
  } catch (error) {
    console.error("❌ Fetch annotations error:", error);
    res.status(500).json({ message: "Failed to fetch annotations" });
  }
};
