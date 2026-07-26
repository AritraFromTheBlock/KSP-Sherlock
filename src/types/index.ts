export interface User {
  id: string;
  name: string;
  role: 'Investigator' | 'Analyst' | 'Supervisor' | 'Admin';
  badge: string;
  avatar?: string;
}

export interface FIR {
  id: string;
  firNumber: string;
  date: string;
  complainant: string;
  accused: string;
  crimeType: string;
  status: 'Active' | 'Closed' | 'Pending' | 'Under Investigation';
  station: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface CrimeHotspot {
  id: string;
  lat: number;
  lng: number;
  intensity: number;
  crimeType: string;
  area: string;
  count: number;
}

export interface CrimeLocation {
  id: string;
  lat: number;
  lng: number;
  crimeType: string;
  district: string;
  risk: 'High' | 'Medium' | 'Low';
  fir: string;
  date: string;
}

export interface CriminalProfile {
  id: string;
  name: string;
  alias: string;
  age: number;
  photo?: string;
  cases: number;
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  knownAssociates: string[];
  lastKnownLocation: string;
  status: 'At Large' | 'In Custody' | 'On Bail' | 'Wanted';
  crimeHistory: string[];
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface NetworkNode {
  id: string;
  label: string;
  type: 'suspect' | 'victim' | 'witness' | 'location' | 'organization';
  x: number;
  y: number;
}

export interface NetworkLink {
  source: string;
  target: string;
  relationship: string;
  strength: number;
}

export interface CrimeAnalytics {
  month: string;
  theft: number;
  assault: number;
  fraud: number;
  cybercrime: number;
  narcotics: number;
}

export interface DashboardStats {
  totalFIRs: number;
  activeCases: number;
  pendingInvestigations: number;
  crimeHotspots: number;
  repeatOffenders: number;
  todaysAlerts: number;
}

export interface SidebarItem {
  icon: string;
  label: string;
  path: string;
  badge?: number;
}

export interface InvestigationTimeline {
  id: string;
  date: string;
  event: string;
  type: 'evidence' | 'arrest' | 'witness' | 'forensic' | 'hearing';
  caseId: string;
}

export interface CaseSummary {
  id: string;
  caseNumber: string;
  title: string;
  summary: string;
  status: 'Active' | 'Closed' | 'Pending';
  assignedTo: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  createdDate: string;
  lastUpdated: string;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  from: string;
  to: string;
  amount: number;
  type: 'suspicious' | 'flagged' | 'normal';
  category: string;
}
