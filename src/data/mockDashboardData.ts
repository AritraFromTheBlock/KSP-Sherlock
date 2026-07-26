export interface LiveAlertItem {
  id: string;
  title: string;
  location: string;
  timestamp: string;
  priority: 'High' | 'Medium' | 'Low';
  type: 'fir' | 'offender' | 'fraud' | 'hotspot';
}

export interface MissionTask {
  id: string;
  label: string;
  completed: boolean;
  category: string;
}

export interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  path: string;
  iconName: 'bot' | 'search' | 'map' | 'fileText' | 'barChart';
  color: string;
  badge?: string;
}

export interface AISuggestionItem {
  id: string;
  text: string;
  confidence: number;
  district: string;
  impactLevel: 'High' | 'Medium' | 'Moderate';
  recommendedAction: string;
}

export interface FeedItem {
  id: string;
  time: string;
  title: string;
  details: string;
  category: 'hotspot' | 'risk' | 'fir' | 'summary';
}

export interface SystemHealthItem {
  id: string;
  name: string;
  status: 'Operational' | 'Degraded' | 'Offline';
  latency: string;
  uptime: string;
}

export interface OfficerTimelineItem {
  id: string;
  time: string;
  action: string;
  target: string;
  category: 'view' | 'ai' | 'assign' | 'close';
}

export const dailyIntelligenceBriefData = {
  officerName: 'Inspector Singh',
  role: 'Station House Officer | Bengaluru Urban Division',
  lastUpdated: new Date().toISOString(),
  headline: 'Daily Intelligence Summary & Tactical Overview',
  summaryBullets: [
    { text: 'Crime increased by 6% compared to yesterday.', highlight: '6%' },
    { text: 'Two new hotspot regions detected in Koramangala & Indiranagar.', highlight: 'Two new hotspot regions' },
    { text: 'Cyber fraud cases rising sharply in Bengaluru Urban tech corridor.', highlight: 'Cyber fraud cases rising' },
    { text: 'Three high-priority investigations require immediate officer sign-off.', highlight: 'Three investigations' }
  ],
  threatLevel: 'ELEVATED' as const,
  activeHotspotsCount: 8,
  pendingReviewCount: 3
};

export const liveAlertsData: LiveAlertItem[] = [
  {
    id: 'alt-001',
    title: 'High Risk FIR registered (#FIR-2026-8891)',
    location: 'Indiranagar Sector 4',
    timestamp: '10:48 AM',
    priority: 'High',
    type: 'fir'
  },
  {
    id: 'alt-002',
    title: 'Repeat offender detected near Malleswaram',
    location: 'Malleswaram Metro Station',
    timestamp: '10:32 AM',
    priority: 'High',
    type: 'offender'
  },
  {
    id: 'alt-003',
    title: 'Financial fraud alert flagged (₹14.2L UPI spike)',
    location: 'Cyber Crime Cell',
    timestamp: '10:15 AM',
    priority: 'Medium',
    type: 'fraud'
  },
  {
    id: 'alt-004',
    title: 'New crime hotspot identified in HSR Layout',
    location: 'HSR Sector 2 Grid 14',
    timestamp: '09:50 AM',
    priority: 'Medium',
    type: 'hotspot'
  },
  {
    id: 'alt-005',
    title: 'Vehicle theft pattern match detected',
    location: 'Koramangala 5th Block',
    timestamp: '09:12 AM',
    priority: 'Low',
    type: 'offender'
  }
];

export const initialMissionTasks: MissionTask[] = [
  {
    id: 'm1',
    label: 'Review High Risk Cases',
    completed: true,
    category: 'High Priority'
  },
  {
    id: 'm2',
    label: 'Monitor Crime Hotspots',
    completed: true,
    category: 'Surveillance'
  },
  {
    id: 'm3',
    label: 'Verify Financial Crime Alerts',
    completed: true,
    category: 'Cyber Cell'
  },
  {
    id: 'm4',
    label: 'Generate Investigation Summary',
    completed: false,
    category: 'Case Reports'
  }
];

export const quickActionsData: QuickActionItem[] = [
  {
    id: 'qa-1',
    title: 'Open AI Assistant',
    description: 'Query SHERLOCK Neural Engine for instant case intelligence & queries',
    path: '/dashboard/ai-assistant',
    iconName: 'bot',
    color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
    badge: 'AI Active'
  },
  {
    id: 'qa-2',
    title: 'Search FIR',
    description: 'Instant multi-parameter search across Karnataka FIR repository',
    path: '/dashboard/fir-search',
    iconName: 'search',
    color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
  },
  {
    id: 'qa-3',
    title: 'Crime Heatmap',
    description: 'Interactive geospatial visualization & live risk intensity grids',
    path: '/dashboard/crime-heatmap',
    iconName: 'map',
    color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
    badge: 'Live Map'
  },
  {
    id: 'qa-4',
    title: 'Generate Summary',
    description: 'Auto-synthesize docket narratives & charge sheet dossiers',
    path: '/dashboard/case-summaries',
    iconName: 'fileText',
    color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
  },
  {
    id: 'qa-5',
    title: 'Crime Analytics',
    description: 'Deep spatial-temporal trends & predictive incident metrics',
    path: '/dashboard/crime-analytics',
    iconName: 'barChart',
    color: 'from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-400',
  }
];

export const aiSuggestionsData: AISuggestionItem[] = [
  {
    id: 'sug-1',
    text: 'Increase patrol units in District 14 due to high predicted night-time incident rate.',
    confidence: 94,
    district: 'District 14 (Koramangala)',
    impactLevel: 'High',
    recommendedAction: 'Deploy Night Beat Alpha'
  },
  {
    id: 'sug-2',
    text: 'Repeat offender activity detected in District 5 matching modus operandi #MOD-882.',
    confidence: 88,
    district: 'District 5 (Malleswaram)',
    impactLevel: 'High',
    recommendedAction: 'Issue Intercept Advisory'
  },
  {
    id: 'sug-3',
    text: 'Vehicle theft spike likely between 9PM and 12AM based on 30-day temporal clustering.',
    confidence: 82,
    district: 'District 9 (HSR Layout)',
    impactLevel: 'Moderate',
    recommendedAction: 'Set up ANPR Checkpoints'
  }
];

export const intelligenceFeedData: FeedItem[] = [
  {
    id: 'feed-1',
    time: '10:42 AM',
    title: 'Hotspot updated',
    details: 'Geofence risk score elevated for Indiranagar Sector 4',
    category: 'hotspot'
  },
  {
    id: 'feed-2',
    time: '10:35 AM',
    title: 'Risk score recalculated',
    details: 'AI model updated threat index across 12 station precincts',
    category: 'risk'
  },
  {
    id: 'feed-3',
    time: '10:10 AM',
    title: 'New FIR indexed',
    details: 'FIR-2026-8891 successfully vector-embedded into search index',
    category: 'fir'
  },
  {
    id: 'feed-4',
    time: '09:58 AM',
    title: 'Case Summary Generated',
    details: 'Dossier #CS-9941 ready for Station House Officer review',
    category: 'summary'
  }
];

export const systemHealthData: SystemHealthItem[] = [
  { id: 'sh-1', name: 'Database', status: 'Operational', latency: '4ms', uptime: '99.99%' },
  { id: 'sh-2', name: 'AI Engine', status: 'Operational', latency: '18ms', uptime: '99.95%' },
  { id: 'sh-3', name: 'ML Models', status: 'Operational', latency: '12ms', uptime: '99.98%' },
  { id: 'sh-4', name: 'API', status: 'Operational', latency: '6ms', uptime: '100%' },
  { id: 'sh-5', name: 'Authentication', status: 'Operational', latency: '3ms', uptime: '100%' },
  { id: 'sh-6', name: 'Map Service', status: 'Operational', latency: '15ms', uptime: '99.90%' },
];

export const officerTimelineData: OfficerTimelineItem[] = [
  {
    id: 'ot-1',
    time: '09:12 AM',
    action: 'Viewed FIR-1023',
    target: 'Case Dossier: Cyber Extortion',
    category: 'view'
  },
  {
    id: 'ot-2',
    time: '09:15 AM',
    action: 'Generated AI Summary',
    target: 'Synthesized 14 witness statements & phone logs',
    category: 'ai'
  },
  {
    id: 'ot-3',
    time: '09:20 AM',
    action: 'Assigned Investigation',
    target: 'Assigned Sub-Inspector Kumar to Field Surveillance',
    category: 'assign'
  },
  {
    id: 'ot-4',
    time: '09:45 AM',
    action: 'Closed Case',
    target: 'Case #CR-4402 - Stolen Vehicle Recovered',
    category: 'close'
  }
];
