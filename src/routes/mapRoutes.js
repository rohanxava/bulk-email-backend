const express = require('express');
const router = express.Router();
const multer = require('multer');

const Map = require("../models/Map");

const { uploadMap, getMaps } = require('../controllers/mapController');

// File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/maps'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

router.post('/upload', upload.single('file'), uploadMap);




// router.post("/upload", upload.single("map"), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: "No file uploaded" });
//   }

//   const fileUrl = `/uploads/maps/${req.file.filename}`;

//   return res.status(200).json({
//     message: "File uploaded successfully",
//     fileUrl,
//   });
// });



router.get('/:mapId/tiles', async (req, res) => {
  try {
    const map = await Map.findById(req.params.mapId).populate("tiles");

    if (!map) return res.status(404).json({ message: "Map not found" });

    res.json(map.tiles); // this returns full tile objects, including _id and bounds
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch tiles" });
  }
});







router.get("/tiles", async (req, res) => {
  try {
    const maps = await Map.find({});
    const allTiles = maps.flatMap(map =>
      map.tiles.map(tile => ({
        ...tile.toObject(),
        mapId: map._id,
        mapName: map.name
      }))
    );
    res.json({ tiles: allTiles });
  } catch (err) {
    console.error("Error fetching tiles:", err);
    res.status(500).json({ message: "Server error" });
  }
});



router.get('/', getMaps);

module.exports = router;
