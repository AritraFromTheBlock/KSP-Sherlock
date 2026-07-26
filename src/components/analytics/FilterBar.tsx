import { Search } from 'lucide-react';
import { CRIME_CATEGORIES, DISTRICTS, STATIONS } from '../../data/mockCrimeData';

export interface FilterState {
  dateRange: string;
  district: string;
  station: string;
  category: string;
  status: string;
  search: string;
}

import { useCrimeAnalytics } from '../../context/CrimeAnalyticsContext';

export default function FilterBar() {
  const { filters, setFilters } = useCrimeAnalytics();
  const handleChange = (key: keyof FilterState, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const availableStations = filters.district 
    ? STATIONS[filters.district] || []
    : Object.values(STATIONS).flat();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 bg-panel border border-edge rounded-xl p-4">
      {/* Date Range */}
      <select 
        value={filters.dateRange}
        onChange={(e) => handleChange('dateRange', e.target.value)}
        className="w-full bg-abyss border border-edge rounded-lg px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-neon focus:shadow-neon-sm font-mono uppercase tracking-wider"
      >
        <option value="7d">Last 7 Days</option>
        <option value="30d">Last 30 Days</option>
        <option value="90d">Last 3 Months</option>
        <option value="ytd">Year to Date</option>
      </select>

      {/* District */}
      <select 
        value={filters.district}
        onChange={(e) => handleChange('district', e.target.value)}
        className="w-full bg-abyss border border-edge rounded-lg px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-neon focus:shadow-neon-sm font-mono uppercase tracking-wider"
      >
        <option value="">All Districts</option>
        {DISTRICTS.map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* Police Station */}
      <select 
        value={filters.station}
        onChange={(e) => handleChange('station', e.target.value)}
        className="w-full bg-abyss border border-edge rounded-lg px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-neon focus:shadow-neon-sm font-mono uppercase tracking-wider disabled:opacity-50"
        disabled={availableStations.length === 0}
      >
        <option value="">All Stations</option>
        {availableStations.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Category */}
      <select 
        value={filters.category}
        onChange={(e) => handleChange('category', e.target.value)}
        className="w-full bg-abyss border border-edge rounded-lg px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-neon focus:shadow-neon-sm font-mono uppercase tracking-wider"
      >
        <option value="">All Categories</option>
        {CRIME_CATEGORIES.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* Status */}
      <select 
        value={filters.status}
        onChange={(e) => handleChange('status', e.target.value)}
        className="w-full bg-abyss border border-edge rounded-lg px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-neon focus:shadow-neon-sm font-mono uppercase tracking-wider"
      >
        <option value="">All Statuses</option>
        <option value="Open">Open</option>
        <option value="Investigating">Investigating</option>
        <option value="Closed">Closed</option>
        <option value="Cold Case">Cold Case</option>
      </select>

      {/* Search */}
      <div className="relative group">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-neon-bright" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          placeholder="Search FIR/Officer..."
          className="w-full rounded-lg border border-edge bg-abyss py-2.5 pl-9 pr-3 font-mono text-xs text-slate-200 outline-none transition-all placeholder:text-slate-600 focus:border-neon focus:shadow-neon-sm uppercase tracking-wider"
        />
      </div>
    </div>
  );
}
