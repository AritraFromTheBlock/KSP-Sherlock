import { fetchHotspots } from './aiHeatmapService';

export interface MLHotspot {
  id: string;
  hotspot_id?: string;
  latitude: number;
  longitude: number;
  cluster: number;
  district: string;
  risk_level: 'High' | 'Medium' | 'Low';
  risk_score: number;
  case_count?: number;
  high_risk_ratio?: number;
  top_crime_types?: Record<string, number>;
}

/**
 * Service layer to retrieve Machine Learning generated hotspot points.
 * Retrieves predictions and classifications directly from the backend endpoint.
 */
export async function getMLHotspots(): Promise<MLHotspot[]> {
  return fetchHotspots();
}
export type { MLHotspot as HotspotType };

