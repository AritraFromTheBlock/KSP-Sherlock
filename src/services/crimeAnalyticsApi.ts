import { FilterState } from '../components/analytics/FilterBar';
import { 
  Incident, 
  MOCK_INCIDENTS, 
  MOCK_TREND_DATA, 
  MOCK_CATEGORY_DATA, 
  MOCK_HEATMAP_DATA, 
  MOCK_STATION_PERFORMANCE, 
  MOCK_AI_INSIGHTS 
} from '../data/mockCrimeData';

const API_URL = (import.meta as any).env.VITE_CHATBOT_API;

export interface CrimeAnalyticsData {
  incidents: Incident[];
  kpis: any[];
  trendData: any[];
  categoryData: any[];
  heatmapData: any[];
  stationPerformance: any[];
  insights: any[];
  prediction: any;
}

export const fetchCrimeAnalyticsData = async (filters: FilterState): Promise<CrimeAnalyticsData> => {
  if (!API_URL) {
    console.warn('VITE_CHATBOT_API is not defined. Falling back to mock data.');
    return getFallbackData(filters);
  }

  const prompt = `
Generate a JSON response for a Crime Analytics dashboard.
Apply these filters: ${JSON.stringify(filters)}
The JSON MUST strictly contain the following keys:
- "response": A string summarizing the findings.
- "insights": Array of objects { "type": "warning"|"recommendation"|"alert"|"info", "message": "string" }.
- "prediction": Object { "trend": "string", "hotspot": "string", "confidence": number }.
- "incidents": Array of objects matching: { "id": "string", "category": "string", "type": "string", "date": "ISOString", "location": { "lat": number, "lng": number, "address": "string", "district": "string", "station": "string" }, "status": "Open"|"Closed", "officer": "string", "riskScore": number }.
- "kpis": Array of 4 objects { "label": "string", "value": "string", "trend": "string" }.
- "categoryData": Array of objects { "name": "string", "value": number }.
- "trendData": Array of objects { "date": "string", "incidents": number, "resolved": number }.
- "stationPerformance": Array of objects { "station": "string", "assigned": number, "solved": number, "avgResponse": "string", "clearanceRate": number }.
- "heatmapData": Array of objects { "day": number, "hour": number, "value": number }.
Ensure valid JSON output without any markdown formatting.
`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: prompt }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const jsonText = await response.text();
    // Try to extract JSON from the text in case it's wrapped in markdown
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const data = JSON.parse(jsonMatch[0]);

    // Construct the final object, falling back to mock data for missing fields
    return {
      incidents: data.incidents || getFallbackData(filters).incidents,
      kpis: data.kpis || getFallbackData(filters).kpis,
      trendData: data.trendData || getFallbackData(filters).trendData,
      categoryData: data.categoryData || getFallbackData(filters).categoryData,
      heatmapData: data.heatmapData || getFallbackData(filters).heatmapData,
      stationPerformance: data.stationPerformance || getFallbackData(filters).stationPerformance,
      insights: data.insights || getFallbackData(filters).insights,
      prediction: data.prediction || getFallbackData(filters).prediction,
    };
  } catch (error) {
    console.error('Failed to fetch AI crime analytics data. Using fallback.', error);
    return getFallbackData(filters);
  }
};

const getFallbackData = (filters: FilterState): CrimeAnalyticsData => {
  // Filter mock incidents locally
  const filteredIncidents = MOCK_INCIDENTS.filter(incident => {
    if (filters.district && incident.location.district !== filters.district) return false;
    if (filters.station && incident.location.station !== filters.station) return false;
    if (filters.category && incident.category !== filters.category) return false;
    if (filters.status && incident.status !== filters.status) return false;
    if (filters.search) {
      const query = filters.search.toLowerCase();
      return (
        incident.id.toLowerCase().includes(query) ||
        incident.officer.toLowerCase().includes(query) ||
        incident.location.address.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return {
    incidents: filteredIncidents,
    kpis: [
      { label: 'Total Incidents', value: filteredIncidents.length.toString(), trend: '+12%' },
      { label: 'Clearance Rate', value: '68.4%', trend: '+3.2%' },
      { label: 'Active Personnel', value: '432', trend: '0%' },
      { label: 'Avg Response', value: '12m 40s', trend: '-1m 15s' },
    ],
    trendData: MOCK_TREND_DATA,
    categoryData: MOCK_CATEGORY_DATA,
    heatmapData: MOCK_HEATMAP_DATA,
    stationPerformance: MOCK_STATION_PERFORMANCE,
    insights: MOCK_AI_INSIGHTS,
    prediction: {
      trend: "Rising",
      hotspot: "Koramangala 4th Block",
      confidence: 85
    }
  };
};
