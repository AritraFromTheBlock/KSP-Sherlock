import { selectedHotspotStore } from './selectedHotspotStore';
import { getMLHotspots, HotspotType } from '../services/hotspotService';

/**
 * Controller to bridge chatbot instructions and the global heatmap state store.
 */
export const heatmapController = {
  /**
   * Applies filter commands received from the AI chatbot.
   */
  filterMap(district?: string, riskLevel?: 'High' | 'Medium' | 'Low') {
    selectedHotspotStore.updateState({
      activeDistrict: district || 'All',
      activeRisk: riskLevel || 'All',
      selectedHotspot: null // Clear selection during filter shifts
    });
  },

  /**
   * Zooms the Leaflet map to a specific coordinate and highlights/opens popup 
   * for the closest matching hotspot in the visible set.
   */
  async zoomToCoordinate(latitude: number, longitude: number) {
    try {
      const allHotspots = await getMLHotspots();
      
      // Find closest hotspot to coordinate to open its popup automatically
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
        mapZoom: 13,
        selectedHotspot: closestHotspot
      });
    } catch (e) {
      console.error('[HEATMAP-CTRL] Zoom coordinates resolution failed:', e);
      selectedHotspotStore.updateState({
        mapCenter: [latitude, longitude],
        mapZoom: 13,
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
      mapCenter: [15.3173, 75.7139],
      mapZoom: 7
    });
  }
};
