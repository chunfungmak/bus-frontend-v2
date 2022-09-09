// This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
export function calDistance (lat1?: number, lon1?: number, lat2?: number, lon2?: number): number {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Number.MAX_SAFE_INTEGER
  const R = 6371 // km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const newLat1 = toRad(lat1)
  const newLat2 = toRad(lat2)

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(newLat1) * Math.cos(newLat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c
  return d
}

// Converts numeric degrees to radians
function toRad (Value: number): number {
  return Value * Math.PI / 180
}
