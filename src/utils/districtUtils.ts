// District centroid definition in Karnataka
interface DistrictCentroid {
  name: string;
  lat: number;
  lng: number;
}

const DISTRICT_CENTROIDS: DistrictCentroid[] = [
  { name: 'Bengaluru Urban', lat: 12.9716, lng: 77.5946 },
  { name: 'Mysuru', lat: 12.2958, lng: 76.6394 },
  { name: 'Hubballi-Dharwad', lat: 15.3647, lng: 75.1240 },
  { name: 'Udupi', lat: 13.3409, lng: 74.7421 },
  { name: 'Belagavi', lat: 15.8497, lng: 74.4977 },
  { name: 'Mangaluru', lat: 12.9141, lng: 74.8560 },
  { name: 'Chikkamagaluru', lat: 13.3185, lng: 75.7761 }
];

/**
 * Calculates Haversine distance between two coordinates in kilometers.
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
      
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Resolves coordinate coordinates to closest Karnataka district name.
 */
export function resolveDistrictFromCoordinates(lat: number, lng: number): string {
  let closestDistrict = 'Karnataka Region';
  let minDistance = Infinity;

  for (const centroid of DISTRICT_CENTROIDS) {
    const dist = calculateDistance(lat, lng, centroid.lat, centroid.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestDistrict = centroid.name;
    }
  }

  return closestDistrict;
}

/**
 * Extends ML hotspot with inferred district names.
 */
export interface HotspotWithDistrict {
  id: string;
  latitude: number;
  longitude: number;
  cluster: number;
  district: string;
  // Future readiness fields
  risk_level?: 'High' | 'Medium' | 'Low';
  risk_score?: number;
  severity?: number;
}
export type { DistrictCentroid };
