const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const Map = require("../models/Map");
const Tile = require("../models/Tile");
const { sliceMap } = require("../utils/tileSlicer");

//100*100

// const generateTileImages = async (imagePath, outputDir, mapId, totalTiles) => {
//   const metadata = await sharp(imagePath).metadata();

//   console.log("Original Image Size:", metadata.width, "x", metadata.height);
//   console.log("Total tiles requested:", totalTiles);

//   const maxCols = Math.min(Math.floor(metadata.width / 100), totalTiles);
//   const cols = Math.max(1, Math.min(Math.ceil(Math.sqrt(totalTiles)), maxCols));
//   const rows = Math.ceil(totalTiles / cols);
//   const tileWidth = Math.floor(metadata.width / cols);
//   const tileHeight = Math.floor(metadata.height / rows);

//   console.log(`Calculated grid: ${cols} cols x ${rows} rows`);
//   console.log(`Each tile: ${tileWidth}x${tileHeight}px`);

//   if (tileWidth <= 0 || tileHeight <= 0) {
//     throw new Error(`Image too small for tiling. Image size: ${metadata.width}x${metadata.height}, cols: ${cols}, rows: ${rows}`);
//   }

//   if (!fs.existsSync(outputDir)) {
//     fs.mkdirSync(outputDir, { recursive: true });
//     console.log("Created output directory:", outputDir);
//   }

//   const imageUrls = [];
//   let tileIndex = 0;

//   for (let row = 0; row < rows; row++) {
//     for (let col = 0; col < cols; col++) {
//       if (tileIndex >= totalTiles) break;

//       const left = col * tileWidth;
//       const top = row * tileHeight;
//       const width = Math.min(tileWidth, metadata.width - left);
//       const height = Math.min(tileHeight, metadata.height - top);

//       if (width <= 0 || height <= 0) {
//         console.warn(`Skipping tile ${tileIndex}: Invalid extract size ${width}x${height}`);
//         tileIndex++;
//         continue;
//       }

//       const tileFileName = `${mapId}_tile_${tileIndex}.png`;
//       const tilePath = path.join(outputDir, tileFileName);
//       const fullUrl = `http://localhost:5000/uploads/tiles/${tileFileName}`;

//       try {
//         await sharp(imagePath)
//           .extract({ left, top, width, height })
//           .toFile(tilePath);

//         console.log(`✅ Tile ${tileIndex} saved at: ${tilePath}`);
//         console.log(`✅ Tile ${tileIndex} URL: ${fullUrl}`);

//         imageUrls.push(fullUrl);
//       } catch (err) {
//         console.error(`❌ Tile ${tileIndex} extraction failed:`, err.message);
//         imageUrls.push(null); // Push null to preserve array length
//       }

//       tileIndex++;
//     }
//   }

//   console.log("✅ Total image URLs generated:", imageUrls.length);
//   console.log("✅ Image URLs list:", imageUrls);
//   return imageUrls;
// };


// Controller: Upload and process map
//100*100


// const generateTileImages = async (imagePath, outputDir, mapId, totalTiles) => {
//   const fixedWidth = 1024;
//   const fixedHeight = 1024;

//   const cols = Math.ceil(Math.sqrt(totalTiles));
//   const rows = Math.ceil(totalTiles / cols);
//   const tileWidth = Math.floor(fixedWidth / cols);
//   const tileHeight = Math.floor(fixedHeight / rows);

//   console.log(`📏 Forced image size: ${fixedWidth}x${fixedHeight}`);
//   console.log(`🔢 Grid: ${cols} cols × ${rows} rows, Tile size: ${tileWidth}x${tileHeight}`);

//   // 🛠️ Resize the original image once and use buffer
//   const resizedImageBuffer = await sharp(imagePath)
//     .resize(fixedWidth, fixedHeight)
//     .toBuffer();

//   if (!fs.existsSync(outputDir)) {
//     fs.mkdirSync(outputDir, { recursive: true });
//     console.log("📂 Created output directory:", outputDir);
//   }

//   const imageUrls = [];
//   let tileIndex = 0;
// for (let row = 0; row < rows; row++) {
//   for (let col = 0; col < cols; col++) {
//     if (tileIndex >= totalTiles) break;

//     const left = col * tileWidth;
//     const top = row * tileHeight;

//     const width = (col === cols - 1) ? (fixedWidth - left) : tileWidth;
//     const height = (row === rows - 1) ? (fixedHeight - top) : tileHeight;

//     const tileFileName = `${mapId}_tile_${tileIndex}.png`;
//     const tilePath = path.join(outputDir, tileFileName);

//     try {
//       await sharp(resizedImageBuffer)
//         .extract({ left, top, width, height })
//         .toFile(tilePath);

//       console.log(`✅ Tile ${tileIndex} saved at ${tilePath}`);
//       imageUrls.push(`/uploads/tiles/${tileFileName}`);
//     } catch (err) {
//       console.error(`❌ Tile ${tileIndex} failed:`, err.message);
//       imageUrls.push(null);
//     }

//     tileIndex++;
//   }
// }

  
//   console.log(`✅ Total tiles generated: ${imageUrls.length}`);
//   return imageUrls;
// };


// exports.uploadMap = async (req, res) => {
//   try {
//     const { name, minLat, maxLat, minLng, maxLng, tileSizeKm = 10 } = req.body;
//     const file = req.file;

//     if (!file) {
//       console.warn("❌ File missing in request.");
//       return res.status(400).json({ msg: "File missing" });
//     }

//     const bounds = [
//       parseFloat(minLat),
//       parseFloat(maxLat),
//       parseFloat(minLng),
//       parseFloat(maxLng),
//     ];

//     if (bounds.some((val) => isNaN(val))) {
//       console.warn("❌ Invalid lat/lng bounds:", bounds);
//       return res.status(400).json({ msg: "Invalid lat/lng" });
//     }

//     const fileUrl = `/uploads/maps/${file.filename}`;
//     console.log("📦 Map file uploaded at:", fileUrl);

//     const newMap = await Map.create({
//       name,
//       fileUrl,
//       bounds,
//       tileSizeKm,
//     });

//     const tileBounds = sliceMap(bounds, tileSizeKm);
//     console.log("🧩 Total tile bounds generated:", tileBounds.length);

//     const imagePath = path.join("uploads/maps", file.filename);
//     console.log("📁 Full image file path for slicing:", imagePath);

//     const tileImages = await generateTileImages(
//       imagePath,
//       "uploads/tiles",
//       newMap._id,
//       tileBounds.length
//     );

//     console.log("🖼️ Image URLs returned from generateTileImages:", tileImages);

//     const allTiles = tileBounds.map((bounds, i) => {
//       const imageUrl = tileImages[i];
//       if (!imageUrl) console.warn(`⚠️ Missing imageUrl for tile ${i}`);
//       return {
//         map: newMap._id,
//         bounds,
//         status: "available",
//         assignedTo: null,
//         imageUrl: imageUrl || null,
//       };
//     });

//     console.log("🧾 Final tiles before DB insert:", allTiles);

//     const insertedTiles = await Tile.insertMany(allTiles);
//     console.log("✅ Tiles inserted into DB:", insertedTiles.length);

//     newMap.tiles = insertedTiles.map((tile) => tile._id);
//     await newMap.save();

//     res.status(201).json({
//       msg: "Map uploaded successfully",
//       name: newMap.name,
//       tilesCreated: insertedTiles.length,
//     });
//   } catch (err) {
//     console.error("❌ Upload error:", err);
//     res.status(500).json({ msg: "Upload failed", error: err.message });
//   }
// };


// exports.getMaps = async (req, res) => {
//   try {
//     const maps = await Map.find().populate("tiles");
//     res.json(maps);
//   } catch (err) {
//     console.error("Map fetch failed:", err);
//     res.status(500).json({ msg: "Fetching maps failed" });
//   }
// };
const generateTileImages = async (imagePath, outputDir, mapId, rows, cols) => {
  const fixedWidth = 1024;
  const fixedHeight = 1024;

  const tileWidth = Math.floor(fixedWidth / cols);
  const tileHeight = Math.floor(fixedHeight / rows);

  console.log(`📏 Resized image to: ${fixedWidth}x${fixedHeight}`);
  console.log(`🧩 Grid: ${rows} rows × ${cols} cols → Tile size: ${tileWidth}x${tileHeight}`);

  const resizedImageBuffer = await sharp(imagePath)
    .resize(fixedWidth, fixedHeight)
    .toBuffer();

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log("📂 Output directory created:", outputDir);
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

        console.log(`✅ Tile ${tileIndex} saved → ${tilePath}`);
        imageUrls.push(`/uploads/tiles/${tileFileName}`);
      } catch (err) {
        console.error(`❌ Tile ${tileIndex} failed:`, err.message);
        imageUrls.push(null);
      }

      tileIndex++;
    }
  }

  console.log(`✅ Total tile images generated: ${imageUrls.length}`);
  return imageUrls;
};

// Main controller
exports.uploadMap = async (req, res) => {
  try {
    const { name, minLat, maxLat, minLng, maxLng, tileSizeKm = 10 } = req.body;
    const file = req.file;

    if (!file) {
      console.warn("❌ No file in request.");
      return res.status(400).json({ msg: "File missing" });
    }

    const bounds = [
      parseFloat(minLat),
      parseFloat(maxLat),
      parseFloat(minLng),
      parseFloat(maxLng),
    ];

    if (bounds.some((val) => isNaN(val))) {
      console.warn("❌ Invalid lat/lng values:", bounds);
      return res.status(400).json({ msg: "Invalid lat/lng" });
    }

    const fileUrl = `/uploads/maps/${file.filename}`;
    const imagePath = path.join("uploads/maps", file.filename);

    console.log("📦 Map uploaded:", fileUrl);

    const newMap = await Map.create({
      name,
      fileUrl,
      bounds,
      tileSizeKm,
    });

    const { tiles: tileBounds, rows, cols } = sliceMap(bounds, tileSizeKm);
    console.log("✅ Tile bounds count:", tileBounds.length);
    console.log("✅ Grid size:", rows, "rows ×", cols, "cols");

    const tileImages = await generateTileImages(
      imagePath,
      "uploads/tiles",
      newMap._id,
      rows,
      cols
    );

    console.log("✅ tileImages length:", tileImages.length);
    tileImages.forEach((url, index) => {
      console.log(`🔢 Tile ${index} imageUrl:`, url);
    });

    // ✅ Define allTiles before using it
    const allTiles = tileBounds.map((bounds, i) => ({
      map: newMap._id,
      bounds,
      status: "available",
      assignedTo: null,
      imageUrl: tileImages[i] || null,
    }));

    // ✅ Now it’s safe to log allTiles
    allTiles.forEach((tile, index) => {
      console.log(`Tile ${index}:`, {
        bounds: tile.bounds,
        imageUrl: tile.imageUrl
      });
    });

    console.log("🧾 Preparing to insert allTiles...");
    const insertedTiles = await Tile.insertMany(allTiles);
    console.log("✅ Inserted tiles into DB:", insertedTiles.length);

    newMap.tiles = insertedTiles.map((tile) => tile._id);
    await newMap.save();

    res.status(201).json({
      msg: "Map uploaded and sliced successfully",
      name: newMap.name,
      tilesCreated: insertedTiles.length,
    });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ msg: "Upload failed", error: err.message });
  }
};

exports.getMaps = async (req, res) => {
  try {
    const maps = await Map.find().populate("tiles");
    res.json(maps);
  } catch (err) {
    console.error("❌ Map fetch failed:", err);
    res.status(500).json({ msg: "Fetching maps failed" });
  }
};
