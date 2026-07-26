import rawDataset from '../data/crimeGraphDataset.json';

export interface GraphNode {
  id: string;
  label: string;
  type: 'District' | 'CrimeMajor' | 'CrimeMinor' | 'CaseStatus' | 'Case';
  color: string;
  radius: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;

  // District specific
  districtName?: string;
  caseCount?: number;
  highRiskCount?: number;
  repeatOffenderCount?: number;
  avgArrestCount?: number;

  // Major Head specific
  majorHeadName?: string;
  totalCases?: number;
  districtPercentage?: string;

  // Minor Head specific
  minorHeadName?: string;

  // Status specific
  statusName?: string;

  // Case specific
  caseMasterId?: string;
  crimeNo?: string;
  regDate?: string;
  year?: string;
  latitude?: number;
  longitude?: number;
  victimCount?: number;
  accusedCount?: number;
  arrestCount?: number;
  highRisk?: boolean;
  repeatOffender?: boolean;
  complainantAge?: number;
  complainantGender?: string;

  // Parent tracking for drill-down
  parentId?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  color?: string;
}

export interface GraphFilterOptions {
  districtId?: string;
  majorHeadId?: string;
  minorHeadId?: string;
  caseStatusId?: string;
  highRiskOnly?: boolean;
  repeatOffenderOnly?: boolean;
  year?: string;
  searchQuery?: string;
  maxCasesLimit?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  summary: {
    totalDistricts: number;
    totalMajorCategories: number;
    totalMinorCategories: number;
    totalCasesDisplayed: number;
    totalHighRisk: number;
    totalRepeatOffenders: number;
  };
}

const DISTRICT_COLOR = '#3b82f6';   // Blue
const MAJOR_COLOR = '#a855f7';      // Purple
const MINOR_COLOR = '#f97316';      // Orange
const STATUS_COLOR = '#22c55e';     // Green
const CASE_COLOR = '#ef4444';       // Red

export function loadCrimeGraphData(filters: GraphFilterOptions = {}): GraphData {
  const { districts, majors, minors, statuses, cases } = rawDataset as {
    districts: Record<string, string>;
    majors: Record<string, string>;
    minors: Record<string, { name: string; majorId: string }>;
    statuses: Record<string, string>;
    cases: any[];
  };

  const limit = filters.maxCasesLimit || 150; // Performance-optimized default case node limit

  // 1. Filter raw cases based on filter options
  let filteredCases = cases.filter((c) => {
    if (filters.districtId && c.DistrictID !== filters.districtId) return false;
    if (filters.majorHeadId && c.CrimeMajorHeadID !== filters.majorHeadId) return false;
    if (filters.minorHeadId && c.CrimeMinorHeadID !== filters.minorHeadId) return false;
    if (filters.caseStatusId && c.CaseStatusID !== filters.caseStatusId) return false;
    if (filters.highRiskOnly && c.HighRisk !== '1') return false;
    if (filters.repeatOffenderOnly && c.HasRepeatOffender !== '1') return false;
    if (filters.year && c.Year !== filters.year) return false;

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const dName = districts[c.DistrictID]?.toLowerCase() || '';
      const majName = majors[c.CrimeMajorHeadID]?.toLowerCase() || '';
      const minName = minors[c.CrimeMinorHeadID]?.name.toLowerCase() || '';
      const statName = statuses[c.CaseStatusID]?.toLowerCase() || '';
      const cNo = String(c.CrimeNo || '').toLowerCase();
      const cId = String(c.CaseMasterID || '').toLowerCase();

      const matches =
        dName.includes(q) ||
        majName.includes(q) ||
        minName.includes(q) ||
        statName.includes(q) ||
        cNo.includes(q) ||
        cId.includes(q);

      if (!matches) return false;
    }

    return true;
  });

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();
  const nodeMap = new Map<string, GraphNode>();

  const addEdge = (source: string, target: string, color?: string) => {
    const key = `${source}->${target}`;
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push({ id: key, source, target, color: color || '#334155' });
    }
  };

  // Aggregation maps
  const districtStats: Record<string, { total: number; highRisk: number; repeat: number; arrests: number }> = {};
  const majorStats: Record<string, { total: number; districtId: string }> = {};
  const minorStats: Record<string, { total: number; districtId: string; majorId: string }> = {};
  const statusStats: Record<string, { total: number; districtId: string; majorId: string; minorId: string }> = {};

  // Process aggregations from filtered cases
  filteredCases.forEach((c) => {
    const dId = c.DistrictID;
    const majId = c.CrimeMajorHeadID;
    const minId = c.CrimeMinorHeadID;
    const statId = c.CaseStatusID;

    // District stats
    if (!districtStats[dId]) {
      districtStats[dId] = { total: 0, highRisk: 0, repeat: 0, arrests: 0 };
    }
    districtStats[dId].total += 1;
    if (c.HighRisk === '1') districtStats[dId].highRisk += 1;
    if (c.HasRepeatOffender === '1') districtStats[dId].repeat += 1;
    districtStats[dId].arrests += Number(c.ArrestCount || 0);

    // Major stats key: dId_majId
    const majKey = `${dId}_${majId}`;
    if (!majorStats[majKey]) {
      majorStats[majKey] = { total: 0, districtId: dId };
    }
    majorStats[majKey].total += 1;

    // Minor stats key: dId_majId_minId
    const minKey = `${dId}_${majId}_${minId}`;
    if (!minorStats[minKey]) {
      minorStats[minKey] = { total: 0, districtId: dId, majorId: majId };
    }
    minorStats[minKey].total += 1;

    // Status stats key: dId_majId_minId_statId
    const statKey = `${dId}_${majId}_${minId}_${statId}`;
    if (!statusStats[statKey]) {
      statusStats[statKey] = { total: 0, districtId: dId, majorId: majId, minorId: minId };
    }
    statusStats[statKey].total += 1;
  });

  // 1. Create District Nodes
  Object.keys(districtStats).forEach((dId) => {
    const st = districtStats[dId];
    const nodeId = `district-${dId}`;
    const dName = districts[dId] || `District #${dId}`;

    const dNode: GraphNode = {
      id: nodeId,
      label: dName,
      type: 'District',
      color: DISTRICT_COLOR,
      radius: Math.min(28, 16 + Math.log2(st.total + 1) * 2),
      districtName: dName,
      caseCount: st.total,
      highRiskCount: st.highRisk,
      repeatOffenderCount: st.repeat,
      avgArrestCount: Number((st.arrests / Math.max(1, st.total)).toFixed(2)),
    };

    nodeMap.set(nodeId, dNode);
    nodes.push(dNode);
  });

  // 2. Create Major Head Nodes
  Object.keys(majorStats).forEach((majKey) => {
    const [dId, majId] = majKey.split('_');
    const st = majorStats[majKey];
    const parentDist = districtStats[dId];
    const nodeId = `major-${dId}-${majId}`;
    const mName = majors[majId] || `Major #${majId}`;
    const pct = parentDist ? ((st.total / parentDist.total) * 100).toFixed(1) + '%' : '0%';

    const mNode: GraphNode = {
      id: nodeId,
      label: mName,
      type: 'CrimeMajor',
      color: MAJOR_COLOR,
      radius: Math.min(22, 12 + Math.log2(st.total + 1) * 1.8),
      majorHeadName: mName,
      totalCases: st.total,
      districtPercentage: pct,
      districtName: districts[dId],
      parentId: `district-${dId}`,
    };

    nodeMap.set(nodeId, mNode);
    nodes.push(mNode);
    addEdge(`district-${dId}`, nodeId, 'rgba(59, 130, 246, 0.4)');
  });

  // 3. Create Minor Head Nodes
  Object.keys(minorStats).forEach((minKey) => {
    const [dId, majId, minId] = minKey.split('_');
    const st = minorStats[minKey];
    const nodeId = `minor-${dId}-${majId}-${minId}`;
    const minInfo = minors[minId] || { name: `Minor #${minId}` };

    const minNode: GraphNode = {
      id: nodeId,
      label: minInfo.name,
      type: 'CrimeMinor',
      color: MINOR_COLOR,
      radius: Math.min(18, 10 + Math.log2(st.total + 1) * 1.5),
      minorHeadName: minInfo.name,
      totalCases: st.total,
      districtName: districts[dId],
      majorHeadName: majors[majId],
      parentId: `major-${dId}-${majId}`,
    };

    nodeMap.set(nodeId, minNode);
    nodes.push(minNode);
    addEdge(`major-${dId}-${majId}`, nodeId, 'rgba(168, 85, 247, 0.4)');
  });

  // 4. Create Case Status Nodes
  Object.keys(statusStats).forEach((statKey) => {
    const [dId, majId, minId, statId] = statKey.split('_');
    const st = statusStats[statKey];
    const nodeId = `status-${dId}-${majId}-${minId}-${statId}`;
    const sName = statuses[statId] || `Status #${statId}`;

    const sNode: GraphNode = {
      id: nodeId,
      label: sName,
      type: 'CaseStatus',
      color: STATUS_COLOR,
      radius: Math.min(15, 8 + Math.log2(st.total + 1) * 1.2),
      statusName: sName,
      caseCount: st.total,
      districtName: districts[dId],
      majorHeadName: majors[majId],
      minorHeadName: minors[minId]?.name,
      parentId: `minor-${dId}-${majId}-${minId}`,
    };

    nodeMap.set(nodeId, sNode);
    nodes.push(sNode);
    addEdge(`minor-${dId}-${majId}-${minId}`, nodeId, 'rgba(249, 115, 22, 0.4)');
  });

  // 5. Create Individual Case Nodes (up to maxCasesLimit)
  const caseSubset = filteredCases.slice(0, limit);
  let totalHighRisk = 0;
  let totalRepeat = 0;

  caseSubset.forEach((c) => {
    const dId = c.DistrictID;
    const majId = c.CrimeMajorHeadID;
    const minId = c.CrimeMinorHeadID;
    const statId = c.CaseStatusID;

    const nodeId = `case-${c.CaseMasterID}`;
    const statusNodeId = `status-${dId}-${majId}-${minId}-${statId}`;

    const isHigh = c.HighRisk === '1';
    const isRepeat = c.HasRepeatOffender === '1';

    if (isHigh) totalHighRisk++;
    if (isRepeat) totalRepeat++;

    const cNode: GraphNode = {
      id: nodeId,
      label: `FIR #${c.CrimeNo || c.CaseMasterID}`,
      type: 'Case',
      color: CASE_COLOR,
      radius: 6,
      caseMasterId: c.CaseMasterID,
      crimeNo: String(c.CrimeNo || c.CaseMasterID),
      regDate: c.CrimeRegisteredDate,
      year: c.Year,
      latitude: Number(c.latitude),
      longitude: Number(c.longitude),
      victimCount: Number(c.VictimCount || 0),
      accusedCount: Number(c.AccusedCount || 0),
      arrestCount: Number(c.ArrestCount || 0),
      highRisk: isHigh,
      repeatOffender: isRepeat,
      complainantAge: Number(c.ComplainantAge || 0),
      complainantGender: c.ComplainantGender || 'N/A',
      districtName: districts[dId],
      majorHeadName: majors[majId],
      minorHeadName: minors[minId]?.name,
      statusName: statuses[statId],
      parentId: statusNodeId,
    };

    nodeMap.set(nodeId, cNode);
    nodes.push(cNode);
    addEdge(statusNodeId, nodeId, 'rgba(34, 197, 94, 0.4)');
  });

  // Arrange initial positions in circular rings by node depth/type
  const dNodes = nodes.filter((n) => n.type === 'District');
  const mNodes = nodes.filter((n) => n.type === 'CrimeMajor');
  const minNodes = nodes.filter((n) => n.type === 'CrimeMinor');
  const sNodes = nodes.filter((n) => n.type === 'CaseStatus');
  const cNodes = nodes.filter((n) => n.type === 'Case');

  const arrangeRing = (list: GraphNode[], r: number) => {
    list.forEach((n, idx) => {
      const angle = (idx / list.length) * Math.PI * 2;
      n.x = Math.cos(angle) * r + (Math.random() - 0.5) * 20;
      n.y = Math.sin(angle) * r + (Math.random() - 0.5) * 20;
    });
  };

  arrangeRing(dNodes, 120);
  arrangeRing(mNodes, 260);
  arrangeRing(minNodes, 400);
  arrangeRing(sNodes, 540);
  arrangeRing(cNodes, 680);

  return {
    nodes,
    edges,
    summary: {
      totalDistricts: Object.keys(districtStats).length,
      totalMajorCategories: Object.keys(majors).length,
      totalMinorCategories: Object.keys(minors).length,
      totalCasesDisplayed: caseSubset.length,
      totalHighRisk,
      totalRepeatOffenders: totalRepeat,
    },
  };
}

export function getRawDatasetFilters() {
  const { districts, majors, minors, statuses } = rawDataset as any;
  return {
    districtsList: Object.entries(districts).map(([id, name]) => ({ id, name: String(name) })),
    majorsList: Object.entries(majors).map(([id, name]) => ({ id, name: String(name) })),
    minorsList: Object.entries(minors).map(([id, info]: any) => ({ id, name: String(info.name), majorId: String(info.majorId) })),
    statusesList: Object.entries(statuses).map(([id, name]) => ({ id, name: String(name) })),
    yearsList: ['2023', '2024', '2025', '2026'],
  };
}
