import crimeDataRaw from './crimeGraphDataset.json';

const crimeData = crimeDataRaw as any;

export interface Incident {
  id: string;
  category: string;
  type: string;
  date: string; // ISO date string
  location: {
    lat: number;
    lng: number;
    address: string;
    district: string;
    station: string;
  };
  status: 'Open' | 'Investigating' | 'Closed' | 'Cold Case';
  officer: string;
  riskScore: number; // 0-100
}

export const CRIME_CATEGORIES = Object.values(crimeData.majors) as string[];
export const DISTRICTS = Object.values(crimeData.districts) as string[];

export const STATIONS: Record<string, string[]> = {};
DISTRICTS.forEach(d => {
  STATIONS[d] = [`${d} Central PS`, `${d} Rural PS`, `${d} East PS`];
});

// Generate realistic data based on the provided JSON
const generateMockIncidents = (): Incident[] => {
  return crimeData.cases.map((c: any) => {
    const districtName = crimeData.districts[c.DistrictID] || 'Unknown';
    
    let status: Incident['status'] = 'Open';
    const statusStr = crimeData.statuses[c.CaseStatusID];
    if (statusStr === 'Under Investigation') status = 'Investigating';
    else if (statusStr === 'Charge Sheeted' || statusStr === 'Closed') status = 'Closed';
    else if (statusStr === 'Undetected') status = 'Cold Case';

    const hour = c.Hour ? String(c.Hour).padStart(2, '0') : '12';
    
    return {
      id: `FIR-${c.CrimeNo}`,
      category: crimeData.majors[c.CrimeMajorHeadID] || 'Other',
      type: crimeData.minors[c.CrimeMinorHeadID]?.name || 'Unknown',
      date: `${c.CrimeRegisteredDate}T${hour}:00:00Z`,
      location: {
        lat: parseFloat(c.latitude),
        lng: parseFloat(c.longitude),
        address: 'Mapped Location',
        district: districtName,
        station: STATIONS[districtName] ? STATIONS[districtName][0] : 'General PS'
      },
      status: status,
      officer: `Officer ${c.CaseMasterID}`,
      riskScore: c.HighRisk === '1' ? Math.floor(85 + Math.random() * 15) : Math.floor(20 + Math.random() * 40)
    };
  });
};

export const MOCK_INCIDENTS = generateMockIncidents();

export const MOCK_TREND_DATA = [
  { date: '2026-07-01', incidents: 42, resolved: 28 },
  { date: '2026-07-05', incidents: 38, resolved: 30 },
  { date: '2026-07-10', incidents: 55, resolved: 25 },
  { date: '2026-07-15', incidents: 48, resolved: 35 },
  { date: '2026-07-20', incidents: 61, resolved: 40 },
  { date: '2026-07-25', incidents: 39, resolved: 20 },
];

export const MOCK_CATEGORY_DATA = CRIME_CATEGORIES.map(c => {
  // compute real count from dataset
  const value = MOCK_INCIDENTS.filter(i => i.category === c).length;
  return {
    name: c,
    value: value > 0 ? value : Math.floor(Math.random() * 50) + 10 // fallback so charts don't look empty if filtered
  };
});

// Generates 24x7 heatmap data (Hour 0-23, Day 0-6)
export const MOCK_HEATMAP_DATA = Array.from({ length: 7 }, (_, day) => 
  Array.from({ length: 24 }, (_, hour) => ({
    day,
    hour,
    value: Math.floor(Math.random() * 100) // 0-100 incident heat
  }))
).flat();

export const MOCK_STATION_PERFORMANCE = [
  { station: 'Bengaluru Urban Central PS', assigned: 120, solved: 95, avgResponse: '8m', clearanceRate: 79 },
  { station: 'Mysuru Central PS', assigned: 150, solved: 102, avgResponse: '11m', clearanceRate: 68 },
  { station: 'Mangaluru Central PS', assigned: 90, solved: 82, avgResponse: '9m', clearanceRate: 91 },
  { station: 'Bengaluru Rural Central PS', assigned: 210, solved: 145, avgResponse: '14m', clearanceRate: 69 },
];

export const MOCK_AI_INSIGHTS = [
  { type: 'warning', message: 'Spike in cyber fraud cases detected in Bengaluru Urban over the last 72 hours.' },
  { type: 'recommendation', message: 'Re-allocate 2 patrol units to Mangaluru block 4 between 22:00-02:00 based on predictive modeling.' },
  { type: 'alert', message: 'FIR-2026-1142 matches MO of a known interstate vehicle theft syndicate.' },
  { type: 'info', message: 'Overall response time has improved by 12% across central division this week.' },
];
