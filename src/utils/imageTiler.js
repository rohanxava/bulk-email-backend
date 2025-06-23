const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

exports.generateTileImages = async (imagePath, outputDir, mapId, tileWidth, tileHeight) => {
  const image = sharp(imagePath);
  const metadata = await image.metadata();

  const cols = Math.ceil(metadata.width / tileWidth);
  const rows = Math.ceil(metadata.height / tileHeight);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const imageUrls = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const left = col * tileWidth;
      const top = row * tileHeight;
      const tileFileName = `${mapId}_tile_${row * cols + col}.png`;
      const tilePath = path.join(outputDir, tileFileName);

      await image
        .extract({ left, top, width: tileWidth, height: tileHeight })
        .toFile(tilePath);

      imageUrls.push(`/uploads/tiles/${tileFileName}`);
    }
  }

  return imageUrls;
};
