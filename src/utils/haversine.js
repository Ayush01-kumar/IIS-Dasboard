/**
 * Calculate the great-circle distance between two points on Earth
 * using the Haversine formula.
 *
 * @param {number} lat1 - Latitude of point 1 (degrees)
 * @param {number} lon1 - Longitude of point 1 (degrees)
 * @param {number} lat2 - Latitude of point 2 (degrees)
 * @param {number} lon2 - Longitude of point 2 (degrees)
 * @returns {number} Distance in kilometers
 */
export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calculate speed in km/h given two coordinate snapshots with timestamps.
 *
 * @param {{ lat: number, lon: number, timestamp: number }} prev
 * @param {{ lat: number, lon: number, timestamp: number }} curr
 * @returns {number} Speed in km/h
 */
export function calculateSpeed(prev, curr) {
  const distanceKm = haversine(prev.lat, prev.lon, curr.lat, curr.lon);
  const timeDeltaHours = (curr.timestamp - prev.timestamp) / 3600000; // ms → hours

  if (timeDeltaHours <= 0) return 0;
  return distanceKm / timeDeltaHours;
}
