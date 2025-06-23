exports.sliceMap = (bounds, tileSizeKm) => {
  const [minLat, maxLat, minLng, maxLng] = bounds;

  const step = tileSizeKm * 0.009; // approx 1km ≈ 0.009 degrees
  const rows = Math.ceil((maxLat - minLat) / step);
  const cols = Math.ceil((maxLng - minLng) / step);

  const tiles = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const lat1 = minLat + row * step;
      const lat2 = Math.min(lat1 + step, maxLat);
      const lng1 = minLng + col * step;
      const lng2 = Math.min(lng1 + step, maxLng);
      tiles.push([lat1, lat2, lng1, lng2]);
    }
  }

  return { tiles, rows, cols };
};
