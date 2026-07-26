import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Search, Activity, Shield, AlertTriangle,
  MapPin, Clock, Users, TrendingUp, ChevronRight,
  RefreshCw, BarChart3, X
} from 'lucide-react';
import {
  findSimilarCases,
  SimilarCase,
  DISTRICT_MAP,
  CRIME_MINOR_MAP,
  CRIME_MAJOR_MAP,
  MINOR_TO_MAJOR,
  QueryParams,
} from '../services/caseSimilarityEngine';

// ── Dimension arrays for dropdowns ───────────────────────────────────────────
const DISTRICTS = Object.entries(DISTRICT_MAP).map(([id, name]) => ({
  id: Number(id), name,
})).sort((a, b) => a.name.localeCompare(b.name));

const CRIME_TYPES = Object.entries(CRIME_MINOR_MAP).map(([id, name]) => ({
  id: Number(id), name,
  major: CRIME_MAJOR_MAP[MINOR_TO_MAJOR[Number(id)]] || '',
})).sort((a, b) => a.name.localeCompare(b.name));

const TIME_BUCKETS = [
  { label: 'Late Night (00–06)', value: 2 },
  { label: 'Morning (06–12)',    value: 9 },
  { label: 'Afternoon (12–18)', value: 15 },
  { label: 'Evening (18–24)',   value: 21 },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function scoreColor(s: number) {
  if (s >= 85) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
  if (s >= 70) return { text: 'text-neon',        bg: 'bg-neon/10',        border: 'border-neon/30' };
  if (s >= 55) return { text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30' };
  return         { text: 'text-slate-400',         bg: 'bg-slate-800/50',   border: 'border-slate-700/40' };
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="text-slate-500 w-20 shrink-0 font-mono">{label}</span>
      <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-neon rounded-full transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-slate-400 font-mono w-7 text-right">{value}</span>
    </div>
  );
}

function CaseCard({
  item, index, onSelect, isSelected,
}: {
  item: SimilarCase;
  index: number;
  onSelect: (i: SimilarCase) => void;
  isSelected: boolean;
}) {
  const col = scoreColor(item.score);
  const c = item.case;
  const dateStr = c.CrimeRegisteredDate?.split('T')[0] ?? String(c.Year);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => onSelect(item)}
      className={`group p-4 border rounded-xl cursor-pointer transition-all ${
        isSelected
          ? 'border-neon/60 bg-neon/5 shadow-neon-sm'
          : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Rank */}
        <div className="text-[10px] font-mono text-slate-600 w-5 shrink-0 pt-0.5">#{index + 1}</div>

        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="font-mono text-xs font-bold text-slate-200">
              FIR #{c.CaseMasterID}
            </span>
            <span className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold ${col.text} ${col.bg} ${col.border}`}>
              {item.score}% match
            </span>
            {c.HighRisk === 1 && (
              <span className="px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-[9px] font-mono text-red-400">
                HIGH RISK
              </span>
            )}
          </div>

          {/* Crime + District */}
          <div className="flex items-center gap-3 mb-1.5 text-xs">
            <span className="flex items-center gap-1 text-slate-300 font-medium">
              <Shield className="w-3 h-3 text-neon shrink-0" />
              {item.crimeTypeName}
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1 text-slate-400">
              <MapPin className="w-3 h-3 shrink-0" />
              {item.districtName}
            </span>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono mb-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {c.DayOfWeek}, {c.Hour}:00
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> {c.VictimCount}V / {c.AccusedCount}A
            </span>
            <span>{dateStr}</span>
          </div>

          {/* Match reasons */}
          <div className="flex flex-wrap gap-1">
            {item.matchReasons.slice(0, 3).map((r, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] font-mono text-slate-400">
                {r}
              </span>
            ))}
          </div>
        </div>

        <ChevronRight className={`w-4 h-4 shrink-0 mt-1 transition-colors ${
          isSelected ? 'text-neon' : 'text-slate-700 group-hover:text-slate-500'
        }`} />
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SimilarCases() {
  const [crimeTypeID, setCrimeTypeID] = useState<number | ''>('');
  const [districtID,  setDistrictID]  = useState<number | ''>('');
  const [hourBucket,  setHourBucket]  = useState<number | ''>('');
  const [victimCount, setVictimCount] = useState<number | ''>('');
  const [accusedCount,setAccusedCount]= useState<number | ''>('');
  const [threshold,   setThreshold]   = useState(30);

  const [results,   setResults]   = useState<SimilarCase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRun,    setHasRun]    = useState(false);
  const [selected,  setSelected]  = useState<SimilarCase | null>(null);
  const [loadTime,  setLoadTime]  = useState<number>(0);

  const handleRun = useCallback(async () => {
    setIsLoading(true);
    setSelected(null);
    setHasRun(true);
    const t0 = performance.now();

    const query: QueryParams = {};
    if (crimeTypeID !== '') query.crimeMinorHeadID = Number(crimeTypeID);
    if (districtID  !== '') query.districtID       = Number(districtID);
    if (hourBucket  !== '') query.hour             = Number(hourBucket);
    if (victimCount !== '') query.victimCount      = Number(victimCount);
    if (accusedCount!== '') query.accusedCount     = Number(accusedCount);

    try {
      const res = await findSimilarCases(query, 15, threshold);
      setResults(res);
      setLoadTime(Math.round(performance.now() - t0));
    } catch (err) {
      console.error('[SIMILAR-CASES] Engine error:', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [crimeTypeID, districtID, hourBucket, victimCount, accusedCount, threshold]);

  const handleClear = () => {
    setCrimeTypeID('');
    setDistrictID('');
    setHourBucket('');
    setVictimCount('');
    setAccusedCount('');
    setThreshold(30);
    setResults([]);
    setHasRun(false);
    setSelected(null);
  };

  const activeFilters = [crimeTypeID, districtID, hourBucket, victimCount, accusedCount]
    .filter(v => v !== '').length;

  const topScore = results[0]?.score ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-4rem)] flex flex-col p-4 sm:p-6 gap-4 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-200">AI Case Matching</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Multi-signal similarity engine · 10,000 Karnataka FIR records
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasRun && (
            <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              {results.length} matches · {loadTime}ms
            </span>
          )}
          {activeFilters > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 px-2 py-1 rounded border border-slate-800 hover:border-red-500/30 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 overflow-hidden">

        {/* ── Left Panel: Query Builder ── */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">

          {/* Engine Status */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-neon animate-pulse" />
            <div>
              <p className="text-[10px] font-mono text-slate-400">SHERLOCK SIMILARITY ENGINE</p>
              <p className="text-[9px] font-mono text-slate-600">
                KSP-ML-v2 · TF-IDF + Feature Vectors · 10k FIRs
              </p>
            </div>
          </div>

          {/* Crime Type */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-neon" /> Crime Type
            </h3>
            <select
              value={crimeTypeID}
              onChange={e => setCrimeTypeID(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon transition-colors cursor-pointer"
            >
              <option value="">Any crime type</option>
              {CRIME_TYPES.map(ct => (
                <option key={ct.id} value={ct.id}>
                  {ct.name} ({ct.major})
                </option>
              ))}
            </select>
            {crimeTypeID !== '' && (
              <div className="text-[10px] font-mono text-slate-500">
                Category: {CRIME_MAJOR_MAP[MINOR_TO_MAJOR[Number(crimeTypeID)]]}
              </div>
            )}
          </div>

          {/* District */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-neon" /> District
            </h3>
            <select
              value={districtID}
              onChange={e => setDistrictID(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon transition-colors cursor-pointer"
            >
              <option value="">Any district</option>
              {DISTRICTS.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Time + Counts */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neon" /> Incident Details
            </h3>

            <div>
              <label className="text-[10px] font-mono text-slate-500 mb-1 block">Time of Day</label>
              <select
                value={hourBucket}
                onChange={e => setHourBucket(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon transition-colors cursor-pointer"
              >
                <option value="">Any time</option>
                {TIME_BUCKETS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono text-slate-500 mb-1 block">Victims</label>
                <input
                  type="number" min={0} max={20}
                  value={victimCount}
                  onChange={e => setVictimCount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Any"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-500 mb-1 block">Accused</label>
                <input
                  type="number" min={0} max={20}
                  value={accusedCount}
                  onChange={e => setAccusedCount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Any"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Threshold */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-neon" /> Threshold: {threshold}%
            </h3>
            <input
              type="range" min={10} max={90} step={5}
              value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
              className="w-full accent-neon cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-600">
              <span>Broader (10%)</span><span>Stricter (90%)</span>
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={handleRun}
            disabled={isLoading || activeFilters === 0}
            className="w-full py-3 bg-gradient-to-r from-neon-dim via-neon to-neon-bright text-void font-bold text-sm uppercase tracking-wider rounded-xl shadow-neon-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> Scanning 10k FIRs…</>
              : <><Zap className="w-4 h-4" /> Run AI Match ({activeFilters} signal{activeFilters !== 1 ? 's' : ''})</>
            }
          </button>
        </div>

        {/* ── Right Panel: Results ── */}
        <div className="flex-1 min-w-0 flex gap-4 overflow-hidden">

          {/* Results List */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/40 border border-slate-800 rounded-xl">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between shrink-0">
              <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-neon" />
                {hasRun
                  ? `${results.length} cases matched`
                  : 'Similar Cases'}
              </span>
              {hasRun && results.length > 0 && (
                <span className="text-xs font-mono text-slate-500">
                  Best: {topScore}% · Threshold: {threshold}%
                </span>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-40 gap-3"
                  >
                    <div className="w-10 h-10 rounded-full border-2 border-neon border-t-transparent animate-spin" />
                    <p className="text-sm text-slate-400 font-mono">Running similarity engine…</p>
                  </motion.div>
                )}

                {!isLoading && !hasRun && (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-16">
                    <Search className="w-10 h-10 text-slate-700" />
                    <p className="text-slate-400 text-sm">Select at least one signal and run the engine</p>
                    <p className="text-slate-600 text-xs font-mono">
                      Crime type · District · Time · Victim/Accused pattern
                    </p>
                  </div>
                )}

                {!isLoading && hasRun && results.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-16">
                    <AlertTriangle className="w-10 h-10 text-amber-500/60" />
                    <p className="text-slate-400 text-sm">No matches above {threshold}% threshold</p>
                    <button
                      onClick={() => { setThreshold(t => Math.max(10, t - 10)); }}
                      className="text-xs text-neon underline cursor-pointer"
                    >
                      Lower threshold and retry
                    </button>
                  </div>
                )}

                {!isLoading && results.map((item, i) => (
                  <CaseCard
                    key={item.case.CaseMasterID}
                    item={item}
                    index={i}
                    onSelect={setSelected}
                    isSelected={selected?.case.CaseMasterID === item.case.CaseMasterID}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Detail Panel */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 288 }}
                exit={{ opacity: 0, width: 0 }}
                className="shrink-0 overflow-hidden"
              >
                <div className="w-72 h-full flex flex-col bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
                  {/* Detail header */}
                  <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-200 font-mono">
                      FIR #{selected.case.CaseMasterID}
                    </span>
                    <button onClick={() => setSelected(null)} className="text-slate-600 hover:text-slate-300 cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {/* Score badge */}
                    <div className={`p-3 rounded-xl border text-center ${scoreColor(selected.score).bg} ${scoreColor(selected.score).border}`}>
                      <div className={`text-3xl font-mono font-bold ${scoreColor(selected.score).text}`}>
                        {selected.score}%
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">Similarity Score</div>
                    </div>

                    {/* Score breakdown */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5" /> Signal Breakdown
                      </h4>
                      <ScoreBar label="Crime Type" value={selected.breakdown.crimeType} />
                      <ScoreBar label="Category"   value={selected.breakdown.category} />
                      <ScoreBar label="District"   value={selected.breakdown.district} />
                      <ScoreBar label="Geo Prox."  value={selected.breakdown.geo} />
                      <ScoreBar label="Time/Day"   value={selected.breakdown.timeOfDay} />
                      <ScoreBar label="Pattern"    value={selected.breakdown.pattern} />
                      <ScoreBar label="Risk Flag"  value={selected.breakdown.risk} />
                    </div>

                    {/* Match reasons */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                        Why It Matched
                      </h4>
                      {selected.matchReasons.map((r, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <span className="text-neon mt-0.5">›</span>
                          {r}
                        </div>
                      ))}
                    </div>

                    {/* Case fields */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                        Case Details
                      </h4>
                      {[
                        ['Crime',    selected.crimeTypeName],
                        ['Category',selected.crimeCategory],
                        ['District',selected.districtName],
                        ['Date',     selected.case.CrimeRegisteredDate?.split('T')[0]],
                        ['Day/Hour', `${selected.case.DayOfWeek}, ${selected.case.Hour}:00`],
                        ['Victims',  String(selected.case.VictimCount)],
                        ['Accused',  String(selected.case.AccusedCount)],
                        ['Arrests',  String(selected.case.ArrestCount)],
                        ['High Risk',selected.case.HighRisk === 1 ? 'Yes' : 'No'],
                        ['Complainant', `${selected.case.ComplainantAge}y ${selected.case.ComplainantGender}`],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between text-xs">
                          <span className="text-slate-500 font-mono">{label}</span>
                          <span className="text-slate-200 text-right max-w-[55%]">{value}</span>
                        </div>
                      ))}
                    </div>

                    {/* GPS */}
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[10px] font-mono text-slate-500">
                      <div className="text-slate-400 mb-1">GPS</div>
                      {selected.case.latitude.toFixed(5)}, {selected.case.longitude.toFixed(5)}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}