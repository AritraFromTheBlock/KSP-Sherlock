import { ESCALATION_ENDPOINT, ESCALATION_DIRECT_URL } from '../config/apiConfig';

export interface EscalationRequest {
  incident_number: number;
  days_since_last_incident: number;
  GravityOffenceID: number;
  max_gravity_so_far: number;
  prior_arrest_made: 0 | 1;
  accused_has_other_victims: 0 | 1;
}

export interface EscalationResponse {
  status: 'success' | 'error';
  prediction: 0 | 1;
  risk_probability: number;
  error?: string;
  details?: string;
  latencyMs?: number;
  timestamp?: string;
}

export interface GravityLevel {
  id: number;
  label: string;
  description: string;
  badgeColor: string;
}

export const GRAVITY_LEVELS: GravityLevel[] = [
  {
    id: 1,
    label: 'Level 1 - Minor / Petty Infraction',
    description: 'Petty theft, public nuisance, simple trespassing, disorderly conduct',
    badgeColor: 'text-slate-300 border-slate-600 bg-slate-800/50',
  },
  {
    id: 2,
    label: 'Level 2 - Moderate Misdemeanor',
    description: 'Simple assault, minor vandalism, verbal extortion, cyber bullying',
    badgeColor: 'text-blue-400 border-blue-500/40 bg-blue-500/10',
  },
  {
    id: 3,
    label: 'Level 3 - Serious Offense',
    description: 'Residential burglary, commercial fraud, narcotics possession, auto theft',
    badgeColor: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
  },
  {
    id: 4,
    label: 'Level 4 - Severe Felony',
    description: 'Aggravated assault with weapon, armed robbery, extortion ring, cyber heist',
    badgeColor: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
  },
  {
    id: 5,
    label: 'Level 5 - Heinous Offense',
    description: 'Homicide, organized crime syndicate, kidnapping for ransom, armed trafficking',
    badgeColor: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
  },
];

export interface ScenarioPreset {
  id: string;
  name: string;
  tag: string;
  description: string;
  icon: string;
  payload: EscalationRequest;
}

export const PRESET_SCENARIOS: ScenarioPreset[] = [
  {
    id: 'high-escalation',
    name: 'First-Time High Velocity Offender',
    tag: 'High Risk Spike',
    description: 'Early incident sequence with no prior arrest record; model predicts imminent aggressive escalation.',
    icon: 'Flame',
    payload: {
      incident_number: 1,
      days_since_last_incident: 45,
      GravityOffenceID: 1,
      max_gravity_so_far: 1,
      prior_arrest_made: 0,
      accused_has_other_victims: 0,
    },
  },
  {
    id: 'controlled-repeat',
    name: 'Habitual Offender (Contained Pattern)',
    tag: 'Controlled Risk',
    description: 'Multi-incident suspect with prior arrest deterrence executed, indicating contained severity probability.',
    icon: 'ShieldCheck',
    payload: {
      incident_number: 3,
      days_since_last_incident: 12,
      GravityOffenceID: 4,
      max_gravity_so_far: 5,
      prior_arrest_made: 1,
      accused_has_other_victims: 1,
    },
  },
  {
    id: 'active-serial',
    name: 'Rapid Multi-Victim Syndicate',
    tag: 'Rapid Progression',
    description: 'Multiple incidents occurring in close succession across diverse victim pools with prior arrests.',
    icon: 'AlertOctagon',
    payload: {
      incident_number: 6,
      days_since_last_incident: 3,
      GravityOffenceID: 3,
      max_gravity_so_far: 4,
      prior_arrest_made: 1,
      accused_has_other_victims: 1,
    },
  },
];

/**
 * Predicts whether a criminal suspect is likely to escalate in severity.
 * Communicates with the Zoho Catalyst Serverless ML proxy endpoint.
 */
export async function predictEscalationRisk(
  formData: EscalationRequest
): Promise<EscalationResponse> {
  const startTime = Date.now();

  // Validate payload before sending
  const requiredFields: (keyof EscalationRequest)[] = [
    'incident_number',
    'days_since_last_incident',
    'GravityOffenceID',
    'max_gravity_so_far',
    'prior_arrest_made',
    'accused_has_other_victims',
  ];

  for (const field of requiredFields) {
    if (formData[field] === undefined || formData[field] === null || isNaN(Number(formData[field]))) {
      throw new Error(`Validation Error: Missing or invalid field '${field}'`);
    }
  }

  const sanitizedPayload: EscalationRequest = {
    incident_number: Math.max(1, Math.round(Number(formData.incident_number))),
    days_since_last_incident: Math.max(0, Math.round(Number(formData.days_since_last_incident))),
    GravityOffenceID: Math.min(5, Math.max(1, Math.round(Number(formData.GravityOffenceID)))),
    max_gravity_so_far: Math.min(5, Math.max(1, Math.round(Number(formData.max_gravity_so_far)))),
    prior_arrest_made: formData.prior_arrest_made === 1 ? 1 : 0,
    accused_has_other_victims: formData.accused_has_other_victims === 1 ? 1 : 0,
  };

  const urlsToTry = [ESCALATION_ENDPOINT];
  if (ESCALATION_DIRECT_URL && !urlsToTry.includes(ESCALATION_DIRECT_URL)) {
    urlsToTry.push(ESCALATION_DIRECT_URL);
  }

  let lastError: any = null;

  for (const url of urlsToTry) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const latencyMs = Date.now() - startTime;
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data?.error || data?.message || `Server returned status ${response.status}`;
        return {
          status: 'error',
          prediction: 0,
          risk_probability: 0,
          error: errorMsg,
          details: data?.details,
          latencyMs,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        status: 'success',
        prediction: (data.prediction === 1 || data.prediction === '1') ? 1 : 0,
        risk_probability: typeof data.risk_probability === 'number' ? data.risk_probability : 0,
        latencyMs,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      lastError = error;
      console.warn(`Attempt with ${url} failed, checking fallback if available...`, error);
    }
  }

  const latencyMs = Date.now() - startTime;

  if (lastError?.name === 'AbortError') {
    return {
      status: 'error',
      prediction: 0,
      risk_probability: 0,
      error: 'Prediction request timed out (60s). ML engine may be warming up.',
      latencyMs,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    status: 'error',
    prediction: 0,
    risk_probability: 0,
    error: lastError?.message || 'Failed to connect to Zoho Catalyst Escalation API',
    latencyMs,
    timestamp: new Date().toISOString(),
  };
}
