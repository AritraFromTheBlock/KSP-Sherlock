/**
 * KSP SHERLOCK — AI Case Similarity Engine (v2)
 *
 * Data sources:
 *  - fact_cases.csv      : 10,000 real Karnataka FIR records (structured numeric features)
 *  - dim_crime_minor_head: 29 crime sub-types
 *  - dim_crime_major_head:  8 major crime categories
 *  - dim_district        : 20 Karnataka districts
 *
 * Similarity signals & weights:
 *  1. Crime minor type exact match     (0.35)
 *  2. Crime major category match       (0.20)
 *  3. District exact match             (0.15)
 *  4. Geographic proximity (Haversine) (0.10)
 *  5. Time-of-day bucket match         (0.08)
 *  6. Victim/accused count pattern     (0.07)
 *  7. High-risk flag + SocioEcon index (0.05)
 */

// ── Dimension lookups (inlined from CSVs for zero-latency) ───────────────────

export const DISTRICT_MAP: Record<number, string> = {
  1:  'Bengaluru Urban',
  2:  'Bengaluru Rural',
  3:  'Mysuru',
  5:  'Kalaburagi',
  6:  'Ballari',
  7:  'Dharwad',
  8:  'Mangaluru (Dakshina Kannada)',
  9:  'Shivamogga',
  10: 'Tumakuru',
  11: 'Davanagere',
  12: 'Vijayapura',
  13: 'Hassan',
  14: 'Mandya',
  15: 'Raichur',
  16: 'Udupi',
  17: 'Chikkamagaluru',
  18: 'Kolar',
  19: 'Bidar',
  20: 'Chitradurga',
};

export const CRIME_MINOR_MAP: Record<number, string> = {
  1:  'Murder',
  2:  'Attempt to Murder',
  3:  'Grievous Hurt',
  4:  'Assault',
  5:  'Theft',
  6:  'Burglary',
  7:  'Robbery',
  8:  'Dacoity',
  9:  'Vehicle Theft',
  10: 'Molestation',
  11: 'Dowry Harassment',
  12: 'Domestic Violence',
  13: 'Eve Teasing',
  14: 'Cheating',
  15: 'Criminal Breach of Trust',
  16: 'Forgery',
  17: 'Bank Fraud',
  18: 'Online Fraud',
  19: 'Identity Theft',
  20: 'Hacking',
  21: 'Social Media Harassment',
  22: 'Possession NDPS',
  23: 'Drug Trafficking',
  24: 'Rioting',
  25: 'Unlawful Assembly',
  26: 'Public Nuisance',
  27: 'Rash Driving',
  28: 'Hit and Run',
};

export const CRIME_MAJOR_MAP: Record<number, string> = {
  1: 'Crimes Against Body',
  2: 'Crimes Against Property',
  3: 'Crimes Against Women',
  4: 'Economic Offences',
  5: 'Cyber Crime',
  6: 'Narcotics',
  7: 'Public Order',
  8: 'Traffic Offences',
};

// Minor → Major lookup
export const MINOR_TO_MAJOR: Record<number, number> = {
  1:1, 2:1, 3:1, 4:1,
  5:2, 6:2, 7:2, 8:2, 9:2,
  10:3, 11:3, 12:3, 13:3,
  14:4, 15:4, 16:4, 17:4,
  18:5, 19:5, 20:5, 21:5,
  22:6, 23:6,
  24:7, 25:7, 26:7,
  27:8, 28:8,
};

// Hour → time bucket
function hourBucket(h: number): string {
  if (h >= 0  && h < 6)  return 'late-night';
  if (h >= 6  && h < 12) return 'morning';
  if (h >= 12 && h < 18) return 'afternoon';
  return 'evening';
}

// Haversine distance in km
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// ── Data types ────────────────────────────────────────────────────────────────

export interface FactCase {
  CaseMasterID: number;
  CrimeNo: string;
  CrimeRegisteredDate: string;
  Year: number;
  Month: number;
  DayOfWeek: string;
  Hour: number;
  DistrictID: number;
  latitude: number;
  longitude: number;
  CrimeMajorHeadID: number;
  CrimeMinorHeadID: number;
  GravityOffenceID: number;
  CaseStatusID: number;
  ComplainantAge: number;
  ComplainantGender: string;
  OccupationID: number;
  SocioEconomicIndex: number;
  VictimCount: number;
  AccusedCount: number;
  ArrestCount: number;
  HasRepeatOffender: number;
  HighRisk: number;
}

export interface QueryParams {
  crimeMinorHeadID?: number;   // from dropdown
  districtID?: number;          // from dropdown
  hour?: number;                // from input
  victimCount?: number;
  accusedCount?: number;
  freeText?: string;            // optional FIR narrative
  latitude?: number;
  longitude?: number;
}

export interface SimilarCase {
  case: FactCase;
  score: number;          // 0–100
  breakdown: {
    crimeType: number;    // 0–100
    category: number;
    district: number;
    geo: number;
    timeOfDay: number;
    pattern: number;
    risk: number;
  };
  matchReasons: string[];
  districtName: string;
  crimeTypeName: string;
  crimeCategory: string;
}

// ── Dataset loader (cached) ───────────────────────────────────────────────────
let _cachedDataset: FactCase[] | null = null;

function parseCSV(text: string): FactCase[] {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const vals = line.split(',');
    const row: any = {};
    headers.forEach((h, i) => {
      const v = vals[i]?.trim();
      row[h.trim()] = isNaN(Number(v)) ? v : Number(v);
    });
    return row as FactCase;
  }).filter(r => !isNaN(r.CaseMasterID));
}

export async function loadFactCases(): Promise<FactCase[]> {
  if (_cachedDataset) return _cachedDataset;
  const res = await fetch('/data/fact_cases.csv');
  const text = await res.text();
  _cachedDataset = parseCSV(text);
  return _cachedDataset;
}

// ── Weights ──────────────────────────────────────────────────────────────────
const W = {
  crimeMinor:   0.35,
  crimeMajor:   0.20,
  district:     0.15,
  geo:          0.10,
  timeOfDay:    0.08,
  pattern:      0.07,
  risk:         0.05,
};

// ── Core matching ─────────────────────────────────────────────────────────────
function scoreCase(q: QueryParams, c: FactCase): SimilarCase {
  // 1. Crime minor match
  let crimeMinorScore = 0;
  if (q.crimeMinorHeadID !== undefined) {
    crimeMinorScore = q.crimeMinorHeadID === c.CrimeMinorHeadID ? 1.0 : 0.0;
  }

  // 2. Crime major category match
  let crimeMajorScore = 0;
  if (q.crimeMinorHeadID !== undefined) {
    const qMajor = MINOR_TO_MAJOR[q.crimeMinorHeadID];
    const cMajor = c.CrimeMajorHeadID;
    crimeMajorScore = qMajor === cMajor ? 1.0 : 0.0;
  }

  // 3. District exact match
  let districtScore = 0;
  if (q.districtID !== undefined) {
    districtScore = q.districtID === c.DistrictID ? 1.0 : 0.0;
  }

  // 4. Geo proximity
  let geoScore = 0;
  if (q.latitude !== undefined && q.longitude !== undefined) {
    const dist = haversine(q.latitude, q.longitude, c.latitude, c.longitude);
    // 0 km → 1.0, 50 km → 0.5, 200 km → 0.0
    geoScore = Math.max(0, 1 - dist / 200);
  }

  // 5. Time of day
  let timeScore = 0;
  if (q.hour !== undefined) {
    timeScore = hourBucket(q.hour) === hourBucket(c.Hour) ? 1.0 : 0.0;
  }

  // 6. Victim/accused pattern
  let patternScore = 0;
  const hasV = q.victimCount !== undefined;
  const hasA = q.accusedCount !== undefined;
  if (hasV || hasA) {
    const vDiff = hasV ? Math.abs((q.victimCount ?? 0) - c.VictimCount) : 0;
    const aDiff = hasA ? Math.abs((q.accusedCount ?? 0) - c.AccusedCount) : 0;
    patternScore = Math.max(0, 1 - (vDiff + aDiff) * 0.2);
  }

  // 7. Risk & socioeconomic signal
  const riskScore = c.HighRisk === 1 ? 0.7 : 0.3;

  // Weighted sum — only include dimensions where query provided data
  let numerator = 0;
  let denominator = 0;

  const add = (weight: number, score: number, active: boolean) => {
    if (active) { numerator += weight * score; denominator += weight; }
  };

  add(W.crimeMinor, crimeMinorScore, q.crimeMinorHeadID !== undefined);
  add(W.crimeMajor, crimeMajorScore, q.crimeMinorHeadID !== undefined);
  add(W.district,   districtScore,   q.districtID !== undefined);
  add(W.geo,        geoScore,        q.latitude !== undefined);
  add(W.timeOfDay,  timeScore,       q.hour !== undefined);
  add(W.pattern,    patternScore,    hasV || hasA);
  add(W.risk,       riskScore,       true);

  const rawScore = denominator > 0 ? numerator / denominator : 0;
  const score = Math.round(rawScore * 100);

  // Reasons
  const reasons: string[] = [];
  if (crimeMinorScore === 1.0) reasons.push(`Exact crime: ${CRIME_MINOR_MAP[c.CrimeMinorHeadID]}`);
  else if (crimeMajorScore === 1.0) reasons.push(`Same category: ${CRIME_MAJOR_MAP[c.CrimeMajorHeadID]}`);
  if (districtScore === 1.0) reasons.push(`Same district: ${DISTRICT_MAP[c.DistrictID]}`);
  if (geoScore > 0.7) reasons.push(`Within ${Math.round(haversine(q.latitude!, q.longitude!, c.latitude, c.longitude))} km`);
  if (timeScore === 1.0) reasons.push(`Same time-of-day: ${hourBucket(c.Hour)}`);
  if (patternScore > 0.7) reasons.push(`Matching victim/accused count`);
  if (c.HasRepeatOffender === 1) reasons.push('Repeat offender involved');
  if (c.HighRisk === 1) reasons.push('High-risk classification');

  return {
    case: c,
    score,
    breakdown: {
      crimeType:  Math.round(crimeMinorScore * 100),
      category:   Math.round(crimeMajorScore * 100),
      district:   Math.round(districtScore * 100),
      geo:        Math.round(geoScore * 100),
      timeOfDay:  Math.round(timeScore * 100),
      pattern:    Math.round(patternScore * 100),
      risk:       Math.round(riskScore * 100),
    },
    matchReasons: reasons.length > 0 ? reasons : ['Partial feature overlap'],
    districtName:  DISTRICT_MAP[c.DistrictID] || `District ${c.DistrictID}`,
    crimeTypeName: CRIME_MINOR_MAP[c.CrimeMinorHeadID] || `Type ${c.CrimeMinorHeadID}`,
    crimeCategory: CRIME_MAJOR_MAP[c.CrimeMajorHeadID] || `Cat ${c.CrimeMajorHeadID}`,
  };
}

export async function findSimilarCases(
  query: QueryParams,
  topK = 10,
  threshold = 30,
): Promise<SimilarCase[]> {
  const dataset = await loadFactCases();

  return dataset
    .map(c => scoreCase(query, c))
    .filter(r => r.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
