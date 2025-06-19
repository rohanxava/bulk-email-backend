exports.sliceMap = (bounds, tileSizeKm) => {
  const tiles = [];
  const [minLon, minLat, maxLon, maxLat] = bounds;
  const tileSize = tileSizeKm / 111; // approx 1 deg ~ 111 km

  for (let lat = minLat; lat < maxLat; lat += tileSize) {
    for (let lon = minLon; lon < maxLon; lon += tileSize) {
      tiles.push([lon, lat, lon + tileSize, lat + tileSize]);
    }
  }
  return tiles;
};