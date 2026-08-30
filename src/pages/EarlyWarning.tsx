import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Layers,
  Zap,
  TrendingUp,
  Shield,
  Users,
  FileText,
  Calendar,
  Scale,
  Crosshair,
  RefreshCw,
  Info,
  AlertTriangle,
  History,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  AlertOctagon
} from 'lucide-react';
import {
  EscalationRequest,
  EscalationResponse,
  GRAVITY_LEVELS,
  PRESET_SCENARIOS,
  ScenarioPreset,
  predictEscalationRisk,
} from '../services/escalationApi';

interface HistoryItem {
  id: string;
  timestamp: string;
  request: EscalationRequest;
  response: EscalationResponse;
}

export default function EarlyWarning() {
  // Form State initialized with realistic investigation data
  const [formData, setFormData] = useState<EscalationRequest>({
    incident_number: 1,
    days_since_last_incident: 45,
    GravityOffenceID: 1,
    max_gravity_so_far: 1,
    prior_arrest_made: 0,
    accused_has_other_victims: 0,
  });

  // UI / Async State
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<EscalationResponse | null>(null);
  const [lastSubmittedPayload, setLastSubmittedPayload] = useState<EscalationRequest | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Date calculator helper state
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [incidentDate, setIncidentDate] = useState<string>('');

  const handleDateChange = (dateStr: string) => {
    setIncidentDate(dateStr);
    if (!dateStr) return;
    const selectedDate = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - selectedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setFormData(prev => ({ ...prev, days_since_last_incident: diffDays }));
  };

  const handleApplyPreset = (preset: ScenarioPreset) => {
    setActivePreset(preset.id);
    setFormData({ ...preset.payload });
    setErrorMessage(null);
  };

  const handleRunPrediction = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await predictEscalationRisk(formData);

      setResult(response);
      setLastSubmittedPayload({ ...formData });

      if (response.status === 'success') {
        const newHistoryItem: HistoryItem = {
          id: `INF-${Date.now().toString().slice(-6)}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          request: { ...formData },
          response,
        };
        setHistory(prev => [newHistoryItem, ...prev.slice(0, 7)]); // Keep last 8 entries
      } else {
        setErrorMessage(response.error || 'Prediction failed. Check backend connectivity.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      incident_number: 1,
      days_since_last_incident: 30,
      GravityOffenceID: 1,
      max_gravity_so_far: 1,
      prior_arrest_made: 0,
      accused_has_other_victims: 0,
    });
    setActivePreset(null);
    setErrorMessage(null);
  };

  // Display calculations
  const probabilityPercent = result ? (result.risk_probability * 100).toFixed(1) : null;
  const isEscalation = result?.prediction === 1;

  // Selected Gravity object lookups
  const currentGravity = GRAVITY_LEVELS.find(g => g.id === formData.GravityOffenceID) || GRAVITY_LEVELS[0];
  const maxGravity = GRAVITY_LEVELS.find(g => g.id === formData.max_gravity_so_far) || GRAVITY_LEVELS[0];

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-5">
      
      {/* 1. Header Banner - Clean, Minimal & Production-Ready */}
      <div className="bg-[#0f172a]/95 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          {/* Left: Icon, Title & Status Badge */}
          <div className="flex items-center gap-3.5 flex-wrap">
            <div className="w-10 h-10 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-indigo-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-100 tracking-tight">
              AI Escalation Prediction Engine
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Catalyst ML Active
            </span>
          </div>

          {/* Right: Clean Metadata Group */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-8 bg-[#0b1120]/80 border border-slate-800/80 px-5 py-2.5 rounded-lg">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Target Pipeline</span>
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 mt-0.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> 6-Feature Ensemble
              </span>
            </div>
            <div className="w-px h-6 bg-slate-800 hidden sm:block" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Serverless Host</span>
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 mt-0.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Zoho Catalyst
              </span>
            </div>
            <div className="w-px h-6 bg-slate-800 hidden sm:block" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Total Inferences</span>
              <span className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
                {history.length > 0 ? history.length : 'Ready'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Quick Investigative Presets Section */}
      <div className="bg-[#0f172a]/95 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span className="text-emerald-400 font-bold">+</span>
            QUICK INVESTIGATIVE PRESETS & TEST SCENARIOS
          </span>
          <span className="text-xs text-indigo-400 font-medium hidden sm:inline">Populate Parameters</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Preset 1: High Escalation */}
          <button
            type="button"
            onClick={() => handleApplyPreset(PRESET_SCENARIOS[0])}
            className={`p-3.5 rounded-lg border text-left transition-all duration-150 flex items-center justify-between gap-3 ${
              activePreset === 'high-escalation'
                ? 'bg-[#131d33] border-rose-500/80 ring-1 ring-rose-500/30'
                : 'bg-[#0b1120] border-slate-800 hover:border-slate-700 hover:bg-[#111a2e]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-md bg-rose-950/40 border border-rose-900/50 flex items-center justify-center text-rose-400 shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-200 truncate">
                First-Time High Velocity Offender
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-800/40 shrink-0">
              High Risk Spike
            </span>
          </button>

          {/* Preset 2: Controlled Habitual */}
          <button
            type="button"
            onClick={() => handleApplyPreset(PRESET_SCENARIOS[1])}
            className={`p-3.5 rounded-lg border text-left transition-all duration-150 flex items-center justify-between gap-3 ${
              activePreset === 'controlled-repeat'
                ? 'bg-[#131d33] border-blue-500/80 ring-1 ring-blue-500/30'
                : 'bg-[#0b1120] border-slate-800 hover:border-slate-700 hover:bg-[#111a2e]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-md bg-blue-950/40 border border-blue-900/50 flex items-center justify-center text-blue-400 shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-200 truncate">
                Habitual Offender (Contained Pattern)
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-800/40 shrink-0">
              Controlled Risk
            </span>
          </button>

          {/* Preset 3: Multi-Victim Syndicate */}
          <button
            type="button"
            onClick={() => handleApplyPreset(PRESET_SCENARIOS[2])}
            className={`p-3.5 rounded-lg border text-left transition-all duration-150 flex items-center justify-between gap-3 ${
              activePreset === 'active-serial'
                ? 'bg-[#131d33] border-amber-500/80 ring-1 ring-amber-500/30'
                : 'bg-[#0b1120] border-slate-800 hover:border-slate-700 hover:bg-[#111a2e]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-md bg-amber-950/40 border border-amber-900/50 flex items-center justify-center text-amber-400 shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-200 truncate">
                Rapid Multi-Victim Syndicate
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/40 shrink-0">
              Rapid Progression
            </span>
          </button>
        </div>
      </div>

      {/* 3. Main Workspace: Two-Column Form & Tactical Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: Input Form (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Card 1: Current Incident Parameters */}
          <div className="bg-[#0f172a]/95 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-indigo-950/40 border border-indigo-800/40 text-indigo-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-200">Current Incident Parameters</h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Card 1 of 2</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Feature 1: incident_number */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-300">
                  INCIDENT SEQUENCE NO. <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.incident_number}
                    onChange={e => {
                      setActivePreset(null);
                      setFormData({ ...formData, incident_number: Math.max(1, parseInt(e.target.value) || 1) });
                    }}
                    className="w-full bg-[#0b1120] border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="1"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 pointer-events-none">
                    {formData.incident_number === 1 ? '1st Offence' : `${formData.incident_number}th In Series`}
                  </div>
                </div>
              </div>

              {/* Feature 2: days_since_last_incident */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-300">
                    DAYS SINCE LAST INCIDENT <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    {showDatePicker ? 'Direct Number' : 'Date Picker'}
                  </button>
                </div>

                {showDatePicker ? (
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={e => handleDateChange(e.target.value)}
                    className="w-full bg-[#0b1120] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:border-indigo-500 outline-none"
                  />
                ) : (
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      value={formData.days_since_last_incident}
                      onChange={e => {
                        setActivePreset(null);
                        setFormData({ ...formData, days_since_last_incident: Math.max(0, parseInt(e.target.value) || 0) });
                      }}
                      className="w-full bg-[#0b1120] border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="45"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 pointer-events-none">
                      Days
                    </div>
                  </div>
                )}
                
                {/* Quick Days Helper Pills */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  {[
                    { label: '0d', val: 0 },
                    { label: '7d', val: 7 },
                    { label: '14d', val: 14 },
                    { label: '30d', val: 30 },
                    { label: '90d', val: 90 },
                  ].map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setActivePreset(null);
                        setFormData(prev => ({ ...prev, days_since_last_incident: p.val }));
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded font-mono border transition-all ${
                        formData.days_since_last_incident === p.val
                          ? 'bg-indigo-950/60 border-indigo-500/80 text-indigo-300'
                          : 'bg-[#0b1120] border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Feature 3: GravityOffenceID */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-300">
                CURRENT OFFENCE GRAVITY LEVEL <span className="text-rose-400">*</span>
              </label>
              
              <div className="relative">
                <select
                  value={formData.GravityOffenceID}
                  onChange={e => {
                    setActivePreset(null);
                    setFormData({ ...formData, GravityOffenceID: parseInt(e.target.value) });
                  }}
                  className="w-full bg-[#0b1120] border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:border-indigo-500 outline-none transition-all cursor-pointer font-medium appearance-none pr-10"
                >
                  {GRAVITY_LEVELS.map(level => (
                    <option key={level.id} value={level.id} className="bg-[#0f172a] text-slate-200 py-1">
                      {level.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* Card 2: Suspect History & Aggravating Factors */}
          <div className="bg-[#0f172a]/95 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-amber-950/40 border border-amber-800/40 text-amber-400 flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-200">Suspect History & Aggravating Factors</h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Card 2 of 2</span>
            </div>

            {/* Feature 4: max_gravity_so_far */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-300">
                HIGHEST HISTORICAL GRAVITY RECORDED <span className="text-rose-400">*</span>
              </label>

              <div className="relative">
                <select
                  value={formData.max_gravity_so_far}
                  onChange={e => {
                    setActivePreset(null);
                    setFormData({ ...formData, max_gravity_so_far: parseInt(e.target.value) });
                  }}
                  className="w-full bg-[#0b1120] border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:border-indigo-500 outline-none transition-all cursor-pointer font-medium appearance-none pr-10"
                >
                  {GRAVITY_LEVELS.map(level => (
                    <option key={level.id} value={level.id} className="bg-[#0f172a] text-slate-200 py-1">
                      {level.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Features 5 & 6: Binary Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              
              {/* Feature 5: prior_arrest_made */}
              <div className="p-3.5 rounded-lg bg-[#0b1120] border border-slate-800 flex flex-col justify-between space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">Prior Arrest Executed</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    formData.prior_arrest_made === 1
                      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40'
                      : 'text-slate-400 border-slate-700 bg-slate-800/60'
                  }`}>
                    {formData.prior_arrest_made === 1 ? 'YES (1)' : 'NO (0)'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActivePreset(null);
                      setFormData({ ...formData, prior_arrest_made: 1 });
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
                      formData.prior_arrest_made === 1
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#0f172a] text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    Yes (1)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePreset(null);
                      setFormData({ ...formData, prior_arrest_made: 0 });
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
                      formData.prior_arrest_made === 0
                        ? 'bg-slate-700 text-white border border-slate-600'
                        : 'bg-[#0f172a] text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    No (0)
                  </button>
                </div>
              </div>

              {/* Feature 6: accused_has_other_victims */}
              <div className="p-3.5 rounded-lg bg-[#0b1120] border border-slate-800 flex flex-col justify-between space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">Other Victims Identified</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    formData.accused_has_other_victims === 1
                      ? 'text-rose-400 border-rose-500/30 bg-rose-950/40'
                      : 'text-slate-400 border-slate-700 bg-slate-800/60'
                  }`}>
                    {formData.accused_has_other_victims === 1 ? 'YES (1)' : 'NO (0)'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActivePreset(null);
                      setFormData({ ...formData, accused_has_other_victims: 1 });
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
                      formData.accused_has_other_victims === 1
                        ? 'bg-rose-600 text-white'
                        : 'bg-[#0f172a] text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    Yes (1)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePreset(null);
                      setFormData({ ...formData, accused_has_other_victims: 0 });
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
                      formData.accused_has_other_victims === 0
                        ? 'bg-slate-700 text-white border border-slate-600'
                        : 'bg-[#0f172a] text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    No (0)
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Action Button Controls */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={handleRunPrediction}
              disabled={loading}
              className="flex-1 sm:flex-initial px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Running Inference...
                </>
              ) : (
                <>
                  <Crosshair className="w-3.5 h-3.5" />
                  Predict Escalation Risk
                </>
              )}
            </button>

            <button
              onClick={handleResetForm}
              disabled={loading}
              className="px-4 py-3 rounded-lg bg-[#0f172a] border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center gap-2 hover:bg-[#111a2e]"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              Reset
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-900/50 text-rose-300 text-xs flex items-start gap-2.5"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Prediction Error: </span>
                <span>{errorMessage}</span>
              </div>
            </motion.div>
          )}

        </div>

        {/* RIGHT COLUMN: Results / Tactical Verdict (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Main Verdict Card */}
          <div className="bg-[#0f172a]/95 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-sm space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-indigo-950/40 border border-indigo-800/40 text-indigo-400 flex items-center justify-center">
                  <Crosshair className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  TACTICAL VERDICT OUTPUT
                </span>
              </div>
              {result?.latencyMs && (
                <span className="text-[11px] font-mono text-slate-400">
                  Latency: <span className="text-slate-300">{result.latencyMs}ms</span>
                </span>
              )}
            </div>

            {/* State A: Result Present */}
            {result && result.status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                
                {/* Classification Verdict Box */}
                <div className={`p-4 rounded-lg border flex items-center gap-3.5 ${
                  isEscalation
                    ? 'bg-rose-950/20 border-rose-800/60 text-rose-300'
                    : 'bg-emerald-950/20 border-emerald-800/60 text-emerald-300'
                }`}>
                  <div className={`p-2 rounded-md shrink-0 ${
                    isEscalation ? 'bg-rose-950/60 text-rose-400 border border-rose-800/50' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                  }`}>
                    {isEscalation ? <AlertOctagon className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Classification</div>
                    <div className="text-base sm:text-lg font-display font-bold tracking-tight">
                      {isEscalation ? 'ESCALATION IMMINENT' : 'LOW RISK / CONTROLLED'}
                    </div>
                  </div>
                </div>

                {/* Probability Gauge & Stat */}
                <div className="p-4 rounded-lg bg-[#0b1120] border border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Model Confidence
                    </span>
                    <div className="text-3xl font-mono font-bold mt-0.5 flex items-baseline gap-1">
                      <span className={isEscalation ? 'text-rose-400' : 'text-emerald-400'}>
                        {probabilityPercent}%
                      </span>
                      <span className="text-xs font-sans text-slate-400 font-normal">risk prob.</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                      Raw: <span className="text-slate-300">{result.risk_probability.toFixed(6)}</span>
                    </span>
                  </div>

                  <div className="w-28 flex flex-col items-center">
                    <div className="w-full bg-[#0f172a] rounded-full h-2.5 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isEscalation ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, Number(probabilityPercent)))}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 mt-1">
                      {isEscalation ? 'Tier: Critical' : 'Tier: Contained'}
                    </span>
                  </div>
                </div>

                {/* Evaluated Feature Breakdown */}
                {lastSubmittedPayload && (
                  <div className="p-3 rounded-lg bg-[#0b1120] border border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">
                      Inference Vector Breakdown
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                      <div className="p-1.5 rounded bg-[#0f172a] border border-slate-800 flex justify-between">
                        <span className="text-slate-400">Incident:</span>
                        <span className="text-slate-200 font-semibold">#{lastSubmittedPayload.incident_number}</span>
                      </div>
                      <div className="p-1.5 rounded bg-[#0f172a] border border-slate-800 flex justify-between">
                        <span className="text-slate-400">Interval:</span>
                        <span className="text-slate-200 font-semibold">{lastSubmittedPayload.days_since_last_incident}d</span>
                      </div>
                      <div className="p-1.5 rounded bg-[#0f172a] border border-slate-800 flex justify-between">
                        <span className="text-slate-400">Gravity:</span>
                        <span className="text-indigo-300 font-semibold">Lvl {lastSubmittedPayload.GravityOffenceID}</span>
                      </div>
                      <div className="p-1.5 rounded bg-[#0f172a] border border-slate-800 flex justify-between">
                        <span className="text-slate-400">Max Hist:</span>
                        <span className="text-amber-400 font-semibold">Lvl {lastSubmittedPayload.max_gravity_so_far}</span>
                      </div>
                      <div className="p-1.5 rounded bg-[#0f172a] border border-slate-800 flex justify-between">
                        <span className="text-slate-400">Arrest:</span>
                        <span className={lastSubmittedPayload.prior_arrest_made ? 'text-emerald-400' : 'text-rose-400'}>
                          {lastSubmittedPayload.prior_arrest_made ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="p-1.5 rounded bg-[#0f172a] border border-slate-800 flex justify-between">
                        <span className="text-slate-400">Victims:</span>
                        <span className={lastSubmittedPayload.accused_has_other_victims ? 'text-rose-400' : 'text-slate-300'}>
                          {lastSubmittedPayload.accused_has_other_victims ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Law Enforcement Action Plan */}
                <div className="p-3.5 rounded-lg bg-[#0b1120] border border-slate-800 space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                    Tactical Advisory Directive
                  </span>
                  
                  {isEscalation ? (
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      <li><span className="font-medium text-rose-300">Preventive Action:</span> Section 151 CrPC detention review.</li>
                      <li><span className="font-medium text-rose-300">Surveillance:</span> Assign Beat Patrol alert for known areas.</li>
                      <li><span className="font-medium text-rose-300">Protection:</span> Issue warning alert to target complainants.</li>
                    </ul>
                  ) : (
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      <li><span className="font-medium text-emerald-300">Standard Inquiry:</span> Maintain regular judicial inquiry.</li>
                      <li><span className="font-medium text-emerald-300">Routine Log:</span> Low escalation propensity detected.</li>
                    </ul>
                  )}
                </div>

              </motion.div>
            ) : (
              /* State B: Standby / Idle (Matches reference mockup) */
              <div className="py-12 px-4 text-center space-y-3">
                <div className="w-14 h-14 rounded-full border-2 border-indigo-400/40 text-indigo-400 flex items-center justify-center mx-auto text-2xl font-serif">
                  i
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Awaiting Investigation Parameters</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Fill in the 6 suspect attributes on the left or select a preset scenario.
                  </p>
                </div>
                
                <div className="pt-2">
                  <span className="inline-block px-5 py-2 rounded-lg bg-[#0b1120] border border-slate-800 text-xs font-mono text-slate-400 cursor-default">
                    Verdict will appear here
                  </span>
                </div>
              </div>
            )}

          </div>

          {/* Session History & Inference Audit Log */}
          <div className="bg-[#0f172a]/95 border border-slate-800 rounded-xl p-4 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-indigo-400" />
                Session Inference History ({history.length})
              </span>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
                >
                  Clear Log
                </button>
              )}
            </div>

            {history.length > 0 ? (
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {history.map((item, idx) => {
                  const itemEscalated = item.response.prediction === 1;
                  return (
                    <div
                      key={item.id || idx}
                      onClick={() => {
                        setFormData({ ...item.request });
                        setResult(item.response);
                        setLastSubmittedPayload({ ...item.request });
                      }}
                      className="p-2 rounded-md bg-[#0b1120] border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${itemEscalated ? 'bg-rose-500' : 'bg-emerald-400'}`} />
                        <div>
                          <div className="font-mono text-slate-200 font-medium">
                            #{item.request.incident_number} Offence ({item.request.days_since_last_incident}d)
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                          itemEscalated
                            ? 'text-rose-400 border-rose-800/40 bg-rose-950/50'
                            : 'text-emerald-400 border-emerald-800/40 bg-emerald-950/50'
                        }`}>
                          {(item.response.risk_probability * 100).toFixed(1)}%
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{item.timestamp}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-2.5 text-center text-xs text-slate-400">
                No past predictions run in this session yet.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}