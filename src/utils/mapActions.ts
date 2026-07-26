import { selectedHotspotStore } from './selectedHotspotStore';
import { fetchHotspots } from '../services/aiHeatmapService';
import { HotspotType } from '../services/hotspotService';

// Center coordinates for Karnataka
export const KARNATAKA_CENTER: [number, number] = [15.3173, 75.7139];

/**
 * pure map action mutations updating the selectedHotspotStore
 */
export const mapActions = {
  /**
   * Selects a specific hotspot.
   */
  setSelectedHotspot(hotspot: HotspotType | null) {
    if (hotspot) {
      selectedHotspotStore.updateState({
        selectedHotspot: {
          id: hotspot.id,
          latitude: hotspot.latitude,
          longitude: hotspot.longitude,
          cluster: hotspot.cluster,
          district: hotspot.district,
          risk_level: hotspot.risk_level,
          risk_score: hotspot.risk_score
        },
        mapCenter: [hotspot.latitude, hotspot.longitude],
        mapZoom: 13
      });
    } else {
      selectedHotspotStore.updateState({
        selectedHotspot: null
      });
    }
  },

  /**
   * Filters the map by district and risk level.
   */
  filterMap(district?: string, riskLevel?: 'High' | 'Medium' | 'Low' | 'All') {
    selectedHotspotStore.updateState({
      activeDistrict: district || 'All',
      activeRisk: riskLevel || 'All',
      selectedHotspot: null // Clear selection during filter shifts
    });
  },

  /**
   * Zooms the Leaflet map to a specific coordinate and highlights/opens popup 
   * for the closest matching hotspot in the set.
   */
  async zoomToCoordinate(latitude: number, longitude: number, zoomLevel = 13) {
    try {
      const allHotspots = await fetchHotspots();
      
      // Find closest hotspot to coordinate to select it automatically
      let closestHotspot: HotspotType | null = null;
      let minDistance = Infinity;

      for (const h of allHotspots) {
        const dist = Math.pow(h.latitude - latitude, 2) + Math.pow(h.longitude - longitude, 2);
        if (dist < minDistance) {
          minDistance = dist;
          closestHotspot = h;
        }
      }

      selectedHotspotStore.updateState({
        mapCenter: [latitude, longitude],
        mapZoom: zoomLevel,
        selectedHotspot: closestHotspot
      });
    } catch (e) {
      console.error('[MAP-ACTIONS] Zoom coordinates resolution failed:', e);
      selectedHotspotStore.updateState({
        mapCenter: [latitude, longitude],
        mapZoom: zoomLevel,
        selectedHotspot: null
      });
    }
  },

  /**
   * Resets all filters, search query parameters, and centers map over Karnataka.
   */
  resetMap() {
    selectedHotspotStore.updateState({
      selectedHotspot: null,
      activeDistrict: 'All',
      activeRisk: 'All',
      searchQuery: '',
      mapCenter: KARNATAKA_CENTER,
      mapZoom: 7
    });
  }
};
