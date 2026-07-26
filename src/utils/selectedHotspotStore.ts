import { HotspotType } from '../services/hotspotService';

export interface HeatmapState {
  selectedHotspot: HotspotType | null;
  activeDistrict: string;
  activeRisk: 'All' | 'High' | 'Medium' | 'Low';
  searchQuery: string;
  mapCenter: [number, number];
  mapZoom: number;
}

type StoreListener = (state: HeatmapState) => void;

class SelectedHotspotStore {
  private state: HeatmapState = {
    selectedHotspot: null,
    activeDistrict: 'All',
    activeRisk: 'All',
    searchQuery: '',
    mapCenter: [15.3173, 75.7139], // Default Karnataka Center coordinates
    mapZoom: 7,
  };

  private listeners: Set<StoreListener> = new Set();

  public getState(): HeatmapState {
    return this.state;
  }

  public updateState(updates: Partial<HeatmapState>) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  public subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.state);
      } catch (e) {
        console.error('[SHERLOCK-STORE] Listener notification failed:', e);
      }
    });
  }
}

export const selectedHotspotStore = new SelectedHotspotStore();
