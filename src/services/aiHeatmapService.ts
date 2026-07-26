import { HotspotType } from './hotspotService';
import { MAP_COPILOT_ENDPOINTS } from '../config/apiConfig';
import { apiClient } from '../utils/apiClient';

export interface ChatResponse {
  reply: string;
  map_command?: any;
  investigator_summary?: any;
  explanation?: any;
  advanced_analytics?: any;
  action?: string;
  filters?: {
    district?: string;
    risk?: 'High' | 'Medium' | 'Low';
    risk_level?: 'High' | 'Medium' | 'Low';
  };
  coordinates?: {
    lat?: number;
    lng?: number;
  };
  [key: string]: any;
}

// Session conversation ID for context tracking across queries
let conversationSessionId = 'session-' + Math.random().toString(36).substring(2, 9);

/**
 * Fetch ML-predicted hotspots directly from the FastAPI backend (GET http://localhost:8000/hotspots).
 * Includes Firebase Bearer token header via apiClient.
 */
export async function fetchHotspots(district?: string, riskLevel?: string): Promise<HotspotType[]> {
  try {
    let url = MAP_COPILOT_ENDPOINTS.HOTSPOTS;
    const params = new URLSearchParams();
    if (district && district !== 'All') {
      params.append('district', district);
    }
    if (riskLevel && riskLevel !== 'All') {
      params.append('risk_level', riskLevel);
    }
    params.append('_t', Date.now().toString()); // Cache buster to ensure fresh data
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const data = await apiClient.get(url);
    console.log('[AI-HEATMAP-SERVICE] Hotspots loaded from FastAPI backend:', data);

    const rawList = Array.isArray(data) ? data : (data && Array.isArray(data.hotspots) ? data.hotspots : []);

    return rawList.map((item: any, index: number) => {
      const lat = Number(item.latitude || item.lat || 0);
      const lng = Number(item.longitude || item.lng || 0);
      const cluster = Number(item.cluster !== undefined ? item.cluster : index);
      const risk_level = item.risk_level || item.risk || 'Low';
      const risk_score = Number(item.risk_score || item.score || 0.0);

      return {
        id: item.hotspot_id || item.id || `ml-hotspot-${index}`,
        hotspot_id: item.hotspot_id || item.id || `ml-hotspot-${index}`,
        latitude: lat,
        longitude: lng,
        cluster: cluster,
        district: item.district || 'Unknown',
        risk_level: risk_level === 'High' ? 'High' : (risk_level === 'Medium' ? 'Medium' : 'Low'),
        risk_score: risk_score,
        case_count: item.case_count,
        high_risk_ratio: item.high_risk_ratio,
        top_crime_types: item.top_crime_types,
      };
    });
  } catch (error: any) {
    console.error('[AI-HEATMAP-SERVICE] Backend fetchHotspots failed:', error);
    throw new Error(error.message || 'Unable to fetch crime hotspots from FastAPI backend.');
  }
}

/**
 * Send chatbot query to the FastAPI backend (POST http://localhost:8000/chat).
 * Includes Firebase Bearer token header via apiClient.
 */
export async function sendHeatmapChat(
  question: string,
  _language: 'en' | 'kn' = 'en',
  _selectedHotspot?: HotspotType | null
): Promise<ChatResponse> {
  const payload = {
    question: question,
    conversation_id: conversationSessionId,
  };

  console.log('[AI-HEATMAP-SERVICE] POST /chat request payload:', payload);

  try {
    const data = await apiClient.post(MAP_COPILOT_ENDPOINTS.CHAT, payload);
    console.log('[AI-HEATMAP-SERVICE] POST /chat response:', data);

    // Sync session_id back if the backend returns one (chatbot_function uses session_id)
    if (data.session_id) {
      conversationSessionId = data.session_id;
    }

    // The backend may return the text as `answer` (chatbot_function) or `reply` (ksp_sherlock_ai).
    const replyText = data.reply || data.answer || data.message || data.text || 'No response returned by backend.';

    return {
      reply:                replyText,
      map_command:          data.map_command          || null,
      investigator_summary: data.investigator_summary || null,
      explanation:          data.explanation          || null,
      advanced_analytics:   data.advanced_analytics   || null,
    };
  } catch (error: any) {
    console.error('[AI-HEATMAP-SERVICE] POST /chat request failed:', error);
    throw new Error(error.message || 'Unable to connect to AI chat backend.');
  }
}
