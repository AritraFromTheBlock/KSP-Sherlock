/**
 * KSP SHERLOCK - MongoDB Cloud API Service
 * 
 * Provides live querying and mutation against MongoDB Atlas through the backend API,
 * with zero-latency fallback to local static JSON datasets if offline or backend is unreachable.
 */

import { MAP_COPILOT_BASE_URL } from '../config/apiConfig';
import accusedFallback from '../data/accusedData.json';
import casesFallback from '../data/caseSummariesData.json';
import { CriminalProfile, CaseSummary } from '../types';

export interface OffenderQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  riskLevel?: string;
}

export interface OffenderResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: CriminalProfile[];
  source: 'mongodb' | 'cache_fallback';
}

export interface CaseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
}

export interface CaseResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: CaseSummary[];
  source: 'mongodb' | 'cache_fallback';
}

class MongoApiService {
  private get baseUrl(): string {
    // Uses VITE_DB_API_ENDPOINT if configured, otherwise falls back to the Assistant/Map Copilot base URL
    const envUrl = import.meta.env.VITE_DB_API_ENDPOINT;
    if (envUrl) return envUrl.replace(/\/+$/, '');
    
    const copilotUrl = MAP_COPILOT_BASE_URL || 'https://ksp-sherlock-ai.onrender.com';
    try {
      const parsed = new URL(copilotUrl);
      return `${parsed.protocol}//${parsed.host}`;
    } catch {
      return 'https://ksp-sherlock-ai.onrender.com';
    }
  }

  /**
   * Fetch paginated and filtered offender profiles
   */
  async getOffenders(params: OffenderQueryParams = {}): Promise<OffenderResponse> {
    const { page = 1, limit = 24, search = '', status = 'All', riskLevel = 'All' } = params;

    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search: search.trim(),
        status,
        riskLevel,
      });

      const res = await fetch(`${this.baseUrl}/offenders?${query.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.data)) {
          return {
            total: json.total || json.data.length,
            page: json.page || page,
            limit: json.limit || limit,
            totalPages: json.totalPages || Math.ceil((json.total || json.data.length) / limit),
            data: json.data,
            source: 'mongodb',
          };
        }
      }
    } catch (err) {
      console.warn('[MongoApiService] Remote fetch failed, using local offline dataset:', err);
    }

    // Local in-memory filtering fallback
    const all = accusedFallback as CriminalProfile[];
    const filtered = all.filter(p => {
      const matchesSearch = !search || 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.alias.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === 'All' || p.status === status;
      const matchesRisk = riskLevel === 'All' || p.riskLevel === riskLevel;
      return matchesSearch && matchesStatus && matchesRisk;
    });

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const slice = filtered.slice((page - 1) * limit, page * limit);

    return {
      total,
      page,
      limit,
      totalPages,
      data: slice,
      source: 'cache_fallback',
    };
  }

  /**
   * Fetch paginated and filtered case summaries
   */
  async getCases(params: CaseQueryParams = {}): Promise<CaseResponse> {
    const { page = 1, limit = 24, search = '', status = 'All', priority = 'All' } = params;

    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search: search.trim(),
        status,
        priority,
      });

      const res = await fetch(`${this.baseUrl}/cases?${query.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.data)) {
          return {
            total: json.total || json.data.length,
            page: json.page || page,
            limit: json.limit || limit,
            totalPages: json.totalPages || Math.ceil((json.total || json.data.length) / limit),
            data: json.data,
            source: 'mongodb',
          };
        }
      }
    } catch (err) {
      console.warn('[MongoApiService] Remote cases fetch failed, using local offline dataset:', err);
    }

    // Local in-memory filtering fallback
    const all = casesFallback as CaseSummary[];
    const filtered = all.filter(c => {
      const matchesSearch = !search || 
        c.caseNumber.toLowerCase().includes(search.toLowerCase()) || 
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        (c.summary && c.summary.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = status === 'All' || c.status === status;
      const matchesPriority = priority === 'All' || c.priority === priority;
      return matchesSearch && matchesStatus && matchesPriority;
    });

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const slice = filtered.slice((page - 1) * limit, page * limit);

    return {
      total,
      page,
      limit,
      totalPages,
      data: slice,
      source: 'cache_fallback',
    };
  }

  /**
   * Create a new Offender Profile in MongoDB
   */
  async createOffender(profile: Partial<CriminalProfile>): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/offenders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, data };
      }
      return { success: false, error: `HTTP ${res.status}` };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Create a new Case in MongoDB
   */
  async createCase(caseData: Partial<CaseSummary>): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(caseData),
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, data };
      }
      return { success: false, error: `HTTP ${res.status}` };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}

export const mongoApiService = new MongoApiService();
export default mongoApiService;
