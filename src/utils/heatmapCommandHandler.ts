import { mapActions } from './mapActions';

export interface CommandPayload {
  reply?: string;
  answer?: string;
  response?: string;
  message?: string;
  map_command?: any;
  action?: string;
  district?: string;
  risk_level?: string;
  risk?: string;
  zoom?: number;
  center?: { lat: number; lng: number } | [number, number];
  markers?: Array<{ lat: number; lng: number; risk_level?: string; hotspot_id?: string }>;
  hotspot_id?: string;
  filters?: {
    district?: string;
    risk?: 'High' | 'Medium' | 'Low' | 'All';
    risk_level?: 'High' | 'Medium' | 'Low' | 'All';
  };
  coordinates?: {
    lat?: number;
    lng?: number;
    latitude?: number;
    longitude?: number;
  };
  [key: string]: any;
}

/** All Karnataka districts + common aliases for NLP extraction. */
const KARNATAKA_DISTRICTS: Record<string, string> = {
  'bengaluru urban':        'Bengaluru Urban',
  'bengaluru':              'Bengaluru Urban',
  'bangalore':              'Bengaluru Urban',
  'bengaluru rural':        'Bengaluru Rural',
  'mysuru':                 'Mysuru',
  'mysore':                 'Mysuru',
  'kalaburagi':             'Kalaburagi',
  'gulbarga':               'Kalaburagi',
  'dakshina kannada':       'Dakshina Kannada',
  'mangaluru':              'Dakshina Kannada',
  'mangalore':              'Dakshina Kannada',
  'uttara kannada':         'Uttara Kannada',
  'dharwad':                'Dharwad',
  'hubballi':               'Dharwad',
  'belagavi':               'Belagavi',
  'belgaum':                'Belagavi',
  'vijayapura':             'Vijayapura',
  'bijapur':                'Vijayapura',
  'ballari':                'Ballari',
  'bellary':                'Ballari',
  'tumakuru':               'Tumakuru',
  'tumkur':                 'Tumakuru',
  'shivamogga':             'Shivamogga',
  'shimoga':                'Shivamogga',
  'udupi':                  'Udupi',
  'chikkamagaluru':         'Chikkamagaluru',
  'chikmagalur':            'Chikkamagaluru',
  'hassan':                 'Hassan',
  'mandya':                 'Mandya',
  'chitradurga':            'Chitradurga',
  'davangere':              'Davangere',
  'raichur':                'Raichur',
  'koppal':                 'Koppal',
  'gadag':                  'Gadag',
  'haveri':                 'Haveri',
  'bidar':                  'Bidar',
  'yadgir':                 'Yadgir',
  'kodagu':                 'Kodagu',
  'coorg':                  'Kodagu',
  'chamarajanagar':         'Chamarajanagar',
  'ramanagara':             'Ramanagara',
  'kolar':                  'Kolar',
  'chikkaballapura':        'Chikkaballapura',
  'bagalkot':               'Bagalkot',
};

/** Karnataka city → approximate [lat, lng] for map zoom. */
const DISTRICT_COORDS: Record<string, [number, number]> = {
  'Bengaluru Urban':  [12.9716, 77.5946],
  'Mysuru':           [12.2958, 76.6394],
  'Kalaburagi':       [17.3297, 76.8200],
  'Dakshina Kannada': [12.9141, 74.8560],
  'Dharwad':          [15.4589, 75.0078],
  'Belagavi':         [15.8497, 74.4977],
  'Vijayapura':       [16.8302, 75.7100],
  'Ballari':          [15.1394, 76.9214],
  'Tumakuru':         [13.3379, 77.1173],
  'Shivamogga':       [13.9299, 75.5681],
  'Udupi':            [13.3409, 74.7421],
  'Chikkamagaluru':   [13.3153, 75.7754],
  'Hassan':           [13.0034, 76.0996],
  'Mandya':           [12.5218, 76.8951],
  'Raichur':          [16.2120, 77.3566],
  'Davangere':        [14.4644, 75.9218],
  'Uttara Kannada':   [14.7937, 74.6846],
  'Bengaluru Rural':  [13.1986, 77.7066],
};

/**
 * Extracts a district name and risk level from a plain-text AI response.
 * Used when the backend doesn't return a structured map_command.
 */
function parseNaturalLanguage(text: string): {
  district: string | null;
  risk: 'High' | 'Medium' | 'Low' | null;
} {
  const lower = text.toLowerCase();
  let district: string | null = null;
  let risk: 'High' | 'Medium' | 'Low' | null = null;

  // District extraction — longest match wins to avoid "bangalore" matching before "bangalore rural"
  const sortedKeys = Object.keys(KARNATAKA_DISTRICTS).sort((a, b) => b.length - a.length);
  for (const alias of sortedKeys) {
    if (lower.includes(alias)) {
      district = KARNATAKA_DISTRICTS[alias];
      break;
    }
  }

  // Risk level extraction
  if (/\bhigh.risk\b|\bhigh risk\b/i.test(text)) risk = 'High';
  else if (/\bmedium.risk\b|\bmedium risk\b|\bmoderate\b/i.test(text)) risk = 'Medium';
  else if (/\blow.risk\b|\blow risk\b/i.test(text)) risk = 'Low';

  return { district, risk };
}

/**
 * Parses and executes map_command received from the backend.
 * Falls back to NLP extraction from plain-text answer when map_command is absent.
 */
export function handleHeatmapCommand(payload: any): string {
  if (!payload) return '';
  if (typeof payload === 'string') return payload;

  const reply = payload.reply || payload.answer || payload.response || payload.message || '';
  const mapCmd = payload.map_command;

  console.log('[HEATMAP-COMMAND-HANDLER] Processing map_command:', payload);

  // ── Structured map_command path ──────────────────────────────────────────
  if (mapCmd && typeof mapCmd === 'object') {
    const action   = mapCmd.action;
    const district = mapCmd.district || mapCmd.filters?.district;
    const risk     = mapCmd.risk_level || mapCmd.risk || mapCmd.filters?.risk || mapCmd.filters?.risk_level;
    const zoom     = mapCmd.zoom ? Number(mapCmd.zoom) : undefined;

    let centerLat: number | undefined;
    let centerLng: number | undefined;

    if (mapCmd.center) {
      if (Array.isArray(mapCmd.center) && mapCmd.center.length >= 2) {
        centerLat = Number(mapCmd.center[0]);
        centerLng = Number(mapCmd.center[1]);
      } else if (typeof mapCmd.center === 'object') {
        centerLat = Number(mapCmd.center.lat ?? mapCmd.center.latitude);
        centerLng = Number(mapCmd.center.lng ?? mapCmd.center.longitude);
      }
    } else if (mapCmd.coordinates) {
      centerLat = Number(mapCmd.coordinates.lat ?? mapCmd.coordinates.latitude);
      centerLng = Number(mapCmd.coordinates.lng ?? mapCmd.coordinates.longitude);
    } else if (mapCmd.latitude !== undefined) {
      centerLat = Number(mapCmd.latitude);
      centerLng = Number(mapCmd.longitude);
    } else if (Array.isArray(mapCmd.markers) && mapCmd.markers.length > 0) {
      centerLat = Number(mapCmd.markers[0].lat);
      centerLng = Number(mapCmd.markers[0].lng);
    }

    switch (action) {
      case 'reset':
      case 'reset_map':
        mapActions.resetMap();
        break;
      case 'navigate':
      case 'zoom':
      case 'center':
        if (centerLat !== undefined && !isNaN(centerLat) && centerLng !== undefined && !isNaN(centerLng)) {
          mapActions.zoomToCoordinate(centerLat, centerLng, zoom || 14);
        }
        if (district || risk) mapActions.filterMap(district, risk);
        break;
      case 'show_markers':
      case 'filter_map':
      case 'filter':
        if (district || risk) mapActions.filterMap(district, risk);
        if (centerLat !== undefined && !isNaN(centerLat) && centerLng !== undefined && !isNaN(centerLng)) {
          mapActions.zoomToCoordinate(centerLat, centerLng, zoom || 13);
        }
        break;
      default:
        if (centerLat !== undefined && !isNaN(centerLat) && centerLng !== undefined && !isNaN(centerLng)) {
          mapActions.zoomToCoordinate(centerLat, centerLng, zoom || 13);
        }
        if (district || risk) mapActions.filterMap(district, risk);
    }

    return reply;
  }

  // ── NLP fallback: extract district/risk from plain-text answer ───────────
  if (reply) {
    const { district, risk } = parseNaturalLanguage(reply);

    if (district || risk) {
      console.log('[HEATMAP-COMMAND-HANDLER] NLP extracted — district:', district, 'risk:', risk);

      // Only ZOOM to the mentioned district — never auto-filter the map.
      // Filtering is explicitly user-controlled via the dropdown.
      const coords = district ? DISTRICT_COORDS[district] : null;
      if (coords) {
        mapActions.zoomToCoordinate(coords[0], coords[1], 11);
      }
    }
    // If no district found, keep the map as-is.
  }

  return reply;
}
