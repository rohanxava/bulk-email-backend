exports.sliceMap = (bounds, tileSizeKm) => {
  const [minLat, maxLat, minLng, maxLng] = bounds;
  const tiles = [];

  const step = tileSizeKm * 0.009; // approx 1 km ≈ 0.009 degrees (for small areas)
  for (let lat = minLat; lat < maxLat; lat += step) {
    for (let lng = minLng; lng < maxLng; lng += step) {
      tiles.push([
        lat,
        Math.min(lat + step, maxLat),
        lng,
        Math.min(lng + step, maxLng)
      ]);
    }
  }
  return tiles;
};
