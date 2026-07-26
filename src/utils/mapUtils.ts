import L from 'leaflet';
import { HotspotType } from '../services/hotspotService';

/**
 * Calculates a Leaflet LatLngBounds object for a given set of hotspots.
 * Returns null if the list is empty.
 */
export function calculateHotspotBounds(hotspots: HotspotType[]): L.LatLngBounds | null {
  if (!hotspots || hotspots.length === 0) {
    return null;
  }

  const coordinates = hotspots.map((h) => L.latLng(h.latitude, h.longitude));
  return L.latLngBounds(coordinates);
}

/**
 * Bounding boxes for key Karnataka cities for map flyTo / boundary fits
 */
export const CITY_COORDINATES = {
  BENGALURU: {
    center: [12.9716, 77.5946] as [number, number],
    zoom: 11
  },
  MYSURU: {
    center: [12.3052, 76.6552] as [number, number],
    zoom: 12
  },
  HUBBALLI: {
    center: [15.3647, 75.1240] as [number, number],
    zoom: 12
  }
};
