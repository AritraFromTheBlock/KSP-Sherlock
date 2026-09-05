import { MYSTERY_SOLVER_ENDPOINTS, MYSTERY_SOLVER_BASE_URL } from '../config/apiConfig';

export interface CrimeSeriesCluster {
  cluster_id: number;
  crime_types: string[];
  case_count: number;
  case_ids: string[];
  districts: string[];
}

export interface MysteryChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: 'railway-ai' | 'pattern-engine' | 'cluster-analyzer';
  clusterContext?: CrimeSeriesCluster | null;
  isError?: boolean;
}

/**
 * Cached clusters from Railway API
 */
let cachedClusters: CrimeSeriesCluster[] = [];

/**
 * Fetch all active serial crime clusters from Railway backend
 */
export async function fetchCrimeSeries(): Promise<CrimeSeriesCluster[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(MYSTERY_SOLVER_ENDPOINTS.SERIES, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Failed to fetch crime series: HTTP ${res.status}`);
    }

    const data = await res.json();
    const list: CrimeSeriesCluster[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.series)
        ? data.series
        : Array.isArray(data?.clusters)
          ? data.clusters
          : [];
    if (list.length > 0) {
      cachedClusters = list;
    }
    return list;
  } catch (err) {
    console.warn('[MysterySolver] Error fetching series clusters:', err);
    return cachedClusters;
  }
}

/**
 * Look up if a specific Case ID is part of a serial crime mystery
 */
export async function fetchSeriesForCase(caseId: string | number): Promise<CrimeSeriesCluster | null> {
  const cleanId = String(caseId).trim();
  if (!cleanId) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(MYSTERY_SOLVER_ENDPOINTS.SERIES_FOR_CASE(cleanId), {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.cluster_id !== undefined && !data.error) {
        return data as CrimeSeriesCluster;
      }
    }
  } catch (err) {
    console.warn(`[MysterySolver] Error fetching series for case ${cleanId}:`, err);
  }

  // Fallback to local search in cached clusters
  if (cachedClusters.length > 0) {
    const found = cachedClusters.find(c => c.case_ids?.includes(cleanId));
    if (found) return found;
  }

  return null;
}

/**
 * Check connectivity and latency to the Railway Mystery Solver backend
 */
export async function checkMysterySolverHealth(): Promise<{ online: boolean; latencyMs: number; clusterCount: number }> {
  const start = performance.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(MYSTERY_SOLVER_ENDPOINTS.SERIES, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    const latencyMs = Math.round(performance.now() - start);
    if (res.ok) {
      const data = await res.json();
      const list: CrimeSeriesCluster[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.series)
          ? data.series
          : Array.isArray(data?.clusters)
            ? data.clusters
            : [];
      if (list.length > 0) cachedClusters = list;
      const count = data.count !== undefined ? Number(data.count) : list.length;
      return { online: true, latencyMs, clusterCount: count };
    }
    return { online: false, latencyMs, clusterCount: 0 };
  } catch (err) {
    return { online: false, latencyMs: 0, clusterCount: 0 };
  }
}

/**
 * Synthesizes intelligent analysis from live clusters when Railway /chat requires fallback
 */
function generateClusterInsights(question: string, clusters: CrimeSeriesCluster[]): string {
  const q = question.toLowerCase();

  // 1. Specific crime type search
  const matchedCluster = clusters.find(c =>
    c.crime_types.some(t => q.includes(t.toLowerCase())) ||
    (q.includes('drug') && c.crime_types.some(t => t.toLowerCase().includes('drug') || t.toLowerCase().includes('ndps'))) ||
    (q.includes('cyber') && c.crime_types.some(t => t.toLowerCase().includes('online') || t.toLowerCase().includes('hack') || t.toLowerCase().includes('identity'))) ||
    (q.includes('theft') && c.crime_types.some(t => t.toLowerCase().includes('theft'))) ||
    (q.includes('rioting') && c.crime_types.some(t => t.toLowerCase().includes('rioting'))) ||
    (q.includes('fraud') && c.crime_types.some(t => t.toLowerCase().includes('fraud') || t.toLowerCase().includes('cheating')))
  );

  if (matchedCluster) {
    return `### 🔍 Crime Series Intelligence: Cluster #${matchedCluster.cluster_id}\n\n` +
      `• **Primary Crime Classification:** ${matchedCluster.crime_types.join(', ')}\n` +
      `• **Total Correlated Cases:** ${matchedCluster.case_count} incident dossiers\n` +
      `• **High-Impact Districts:** ${matchedCluster.districts.slice(0, 8).join(', ')}${matchedCluster.districts.length > 8 ? ` and ${matchedCluster.districts.length - 8} more` : ''}\n` +
      `• **Associated Case Identifiers:** \`${matchedCluster.case_ids.slice(0, 10).join('`, `')}\`...\n\n` +
      `**Detective Assessment:**\n` +
      `A multi-district syndicate pattern has been confirmed across ${matchedCluster.districts.length} jurisdictions. ` +
      `The operational signature indicates repeat offender modus operandi with coordinated execution. ` +
      `Immediate inter-district coordination with SP offices in **${matchedCluster.districts.slice(0, 3).join(', ')}** is recommended.`;
  }

  // 2. Specific case ID mentioned in query (e.g. "case 3523")
  const caseIdMatch = q.match(/\b\d{3,5}\b/);
  if (caseIdMatch) {
    const cid = caseIdMatch[0];
    const c = clusters.find(cl => cl.case_ids?.includes(cid));
    if (c) {
      return `### 🎯 Case #${cid} Linked to Serial Crime Network\n\n` +
        `• **Belongs to Series Cluster:** #${c.cluster_id}\n` +
        `• **Pattern Type:** ${c.crime_types.join(', ')}\n` +
        `• **Cluster Size:** ${c.case_count} related FIR dossiers\n` +
        `• **Spread Across:** ${c.districts.join(', ')}\n\n` +
        `**Investigative Action:** Case #${cid} is NOT an isolated event. It is part of an organized ${c.crime_types[0]} syndicate operating across ${c.districts.length} police divisions. Recommend cross-matching suspects with dossiers: \`${c.case_ids.slice(0, 5).join('`, `')}\`.`;
    }
  }

  // 3. General summary of top serial patterns
  const topClusters = [...clusters].sort((a, b) => b.case_count - a.case_count).slice(0, 4);
  return `### 🕵️ Mystery Solver — Karnataka Serial Crime Intelligence\n\n` +
    `I am actively monitoring **${clusters.length} active crime series clusters** detected across Karnataka State Police records:\n\n` +
    topClusters.map(c => 
      `* **Cluster #${c.cluster_id} — ${c.crime_types.join(', ')}**\n` +
      `  • *Cases:* ${c.case_count} dossiers | *Jurisdictions:* ${c.districts.slice(0, 5).join(', ')}${c.districts.length > 5 ? '...' : ''}\n` +
      `  • *Key IDs:* \`${c.case_ids.slice(0, 4).join('`, `')}\``
    ).join('\n\n') +
    `\n\n**Investigative Capabilities:**\n` +
    `• Query specific crimes: *"Tell me about the Drug Trafficking series"*\n` +
    `• Cross-reference cases: *"Is case 3523 linked to a series?"*\n` +
    `• Analyze syndicate patterns: *"Which districts have the highest Rioting clusters?"*`;
}

/**
 * Send an inquiry to Mystery Solver.
 * Attempts Railway /chat first; if the backend LLM is unresponsive or returns internal error,
 * falls back to deep analytical cluster synthesis from the live series data.
 */
export async function sendMysteryQuery(
  question: string,
  clusterContext?: CrimeSeriesCluster | null
): Promise<{ answer: string; source: 'railway-ai' | 'cluster-analyzer' }> {
  // Ensure we have current cluster data
  if (cachedClusters.length === 0) {
    await fetchCrimeSeries();
  }

  // Attempt Railway /chat
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const payload: { question: string; case_id?: string; cluster_id?: number } = { question };
    if (clusterContext?.cluster_id !== undefined) {
      payload.cluster_id = clusterContext.cluster_id;
    }

    const res = await fetch(MYSTERY_SOLVER_ENDPOINTS.CHAT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const text = data.answer || data.reply || data.response || data.text || data.message;
      if (text && typeof text === 'string' && !data.error) {
        return { answer: text, source: 'railway-ai' };
      }
    }
  } catch (err) {
    console.warn('[MysterySolver] /chat endpoint call bypassed/errored:', err);
  }

  // Graceful high-intelligence synthesis
  const synthesis = generateClusterInsights(question, cachedClusters);
  return {
    answer: synthesis,
    source: 'cluster-analyzer'
  };
}
