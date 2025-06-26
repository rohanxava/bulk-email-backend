const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const Map = require("../models/Map");
const Tile = require("../models/Tile");
const { sliceMap } = require("../utils/tileSlicer");

const generateTileImages = async (imagePath, outputDir, mapId, rows, cols) => {
  const fixedWidth = 1024;
  const fixedHeight = 1024;

  const tileWidth = Math.floor(fixedWidth / cols);
  const tileHeight = Math.floor(fixedHeight / rows);

  const resizedImageBuffer = await sharp(imagePath)
    .resize(fixedWidth, fixedHeight)
    .toBuffer();

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const imageUrls = [];
  let tileIndex = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const left = col * tileWidth;
      const top = row * tileHeight;

      const width = (col === cols - 1) ? (fixedWidth - left) : tileWidth;
      const height = (row === rows - 1) ? (fixedHeight - top) : tileHeight;

      const tileFileName = `${mapId}_tile_${tileIndex}.png`;
      const tilePath = path.join(outputDir, tileFileName);

      try {
        await sharp(resizedImageBuffer)
          .extract({ left, top, width, height })
          .toFile(tilePath);

        // console.log(`✅ Tile ${tileIndex} saved → ${tilePath}`);
        imageUrls.push(`/uploads/tiles/${tileFileName}`);
      } catch (err) {
        // console.error(`❌ Tile ${tileIndex} failed:`, err.message);
        imageUrls.push(null);
      }

      tileIndex++;
    }
  }

  return imageUrls;
};

exports.uploadMap = async (req, res) => {
  try {
    const { name, minLat, maxLat, minLng, maxLng, tileSizeKm = 10 } = req.body;
    const file = req.file;

    if (!file) {
      // console.warn("❌ No file in request.");
      return res.status(400).json({ msg: "File missing" });
    }

    const bounds = [
      parseFloat(minLat),
      parseFloat(maxLat),
      parseFloat(minLng),
      parseFloat(maxLng),
    ];

    if (bounds.some((val) => isNaN(val))) {
      // console.warn("❌ Invalid lat/lng values:", bounds);
      return res.status(400).json({ msg: "Invalid lat/lng" });
    }

    const fileUrl = `/uploads/maps/${file.filename}`;
    const imagePath = path.join("uploads/maps", file.filename);


    const newMap = await Map.create({
      name,
      fileUrl,
      bounds,
      tileSizeKm,
      uploadedBy: req.user.id 
    });

    const { tiles: tileBounds, rows, cols } = sliceMap(bounds, tileSizeKm);
    

    const tileImages = await generateTileImages(
      imagePath,
      "uploads/tiles",
      newMap._id,
      rows,
      cols
    );
console.log("🧩 Tile Images:", tileImages); 

    tileImages.forEach((url, index) => {
        console.log(`🧷 Tile ${index} filename:`, url?.split("/").pop());

    });

    const allTiles = tileBounds.map((bounds, i) => ({
      map: newMap._id,
      bounds,
      status: "available",
      assignedTo: null,
      imageUrl: tileImages[i] || null,
      imageName: tileImages[i]?.split("/").pop()?.trim() || null,
    }));

    allTiles.forEach((tile, index) => {
      console.log("🧱 Tile image file:", tileImages[index], "🧱 Clean name:", tileImages[index]?.split("/").pop()?.trim());

    });

    const insertedTiles = await Tile.insertMany(allTiles);
console.log("📦 Tiles to insert:", allTiles);

    newMap.tiles = insertedTiles.map((tile) => tile._id);
    await newMap.save();

    res.status(201).json({
      msg: "Map uploaded and sliced successfully",
      name: newMap.name,
      tilesCreated: insertedTiles.length,
    });
  } catch (err) {
    res.status(500).json({ msg: "Upload failed", error: err.message });
  }
};

exports.getMaps = async (req, res) => {
  try {
    const maps = await Map.find({ uploadedBy: req.user.id }).populate("tiles");
    res.json(maps);
  } catch (err) {
    console.error("❌ Map fetch failed:", err);
    res.status(500).json({ msg: "Fetching maps failed" });
  }
};
