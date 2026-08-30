import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Layers,
  Zap,
  FileText,
  Calendar,
  Crosshair,
  RefreshCw,
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

  const runPredictionWithData = async (payload: EscalationRequest) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await predictEscalationRisk(payload);

      setResult(response);
      setLastSubmittedPayload({ ...payload });

      if (response.status === 'success') {
        const newHistoryItem: HistoryItem = {
          id: `INF-${Date.now().toString().slice(-6)}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          request: { ...payload },
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

  const handleRunPrediction = () => {
    runPredictionWithData(formData);
  };

  // Auto-run initial prediction on component mount
  useState(() => {
    runPredictionWithData(formData);
  });

  const handleResetForm = () => {
    setFormData({
      incident_number: 1,
      days_since_last_incident: 30,
      GravityOffenceID: 1,
      max_gravity_so_far: 1,
      prior_arrest_made: 0,
      accused_has_other_victims: 0,
    });
    setErrorMessage(null);
  };

  // Display calculations
  const probabilityPercent = result ? (result.risk_probability * 100).toFixed(1) : null;
  const isEscalation = result?.prediction === 1;

  // Selected Gravity object lookups
  const currentGravity = GRAVITY_LEVELS.find(g => g.id === formData.GravityOffenceID) || GRAVITY_LEVELS[0];
  const maxGravity = GRAVITY_LEVELS.find(g => g.id === formData.max_gravity_so_far) || GRAVITY_LEVELS[0];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col p-4 sm:p-6 gap-3.5 overflow-hidden">
      
      {/* 1. Header Bar */}
      <div className="bg-[#0f172a]/95 border border-slate-800/90 rounded-xl px-5 py-3 shadow-md backdrop-blur-sm shrink-0 flex items-center justify-between gap-3">
        {/* Left: Title & Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg sm:text-xl font-display font-bold text-slate-100 tracking-tight leading-none">
                AI Escalation Prediction Engine
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Catalyst ML Active
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-1">
              6-Feature Threat Propensity Pipeline · Karnataka State Police
            </p>
          </div>
        </div>

        {/* Right: Pipeline Details */}
        <div className="hidden sm:flex items-center gap-3.5 text-xs font-mono text-slate-400 bg-[#0b1120] border border-slate-800 px-4 py-2 rounded-lg">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-400" /> 6-Feature Ensemble
          </span>
          <span className="text-slate-700">|</span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" /> Serverless Host
          </span>
        </div>
      </div>

      {/* 2. Main Workspace: Two-Column Unified Structured Grid */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        
        {/* LEFT COLUMN: Unified Incident & Offender Parameters Form (5 cols) */}
        <div className="lg:col-span-5 bg-[#0f172a]/95 border border-slate-800/90 rounded-xl p-5 sm:p-6 flex flex-col justify-between overflow-y-auto shadow-md">
          
          <div className="space-y-4">
            {/* Form Section Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-indigo-950/40 border border-indigo-800/40 text-indigo-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
                  Offence Attributes & History
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">6 Features</span>
            </div>

            {/* Row 1: Incident No & Days Since Last Incident */}
            <div className="grid grid-cols-2 gap-3.5">
              {/* Feature 1: incident_number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                  Incident Seq #
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.incident_number}
                  onChange={e => {
                    setFormData({ ...formData, incident_number: Math.max(1, parseInt(e.target.value) || 1) });
                  }}
                  className="w-full bg-[#0b1120] border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-200 font-mono focus:border-indigo-500 outline-none transition-all"
                  placeholder="1"
                />
              </div>

              {/* Feature 2: days_since_last_incident */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                    Days Interval
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    {showDatePicker ? 'Num' : 'Date'}
                  </button>
                </div>

                {showDatePicker ? (
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={e => handleDateChange(e.target.value)}
                    className="w-full bg-[#0b1120] border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 font-mono focus:border-indigo-500 outline-none"
                  />
                ) : (
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={formData.days_since_last_incident}
                    onChange={e => {
                      setFormData({ ...formData, days_since_last_incident: Math.max(0, parseInt(e.target.value) || 0) });
                    }}
                    className="w-full bg-[#0b1120] border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-200 font-mono focus:border-indigo-500 outline-none transition-all"
                    placeholder="30"
                  />
                )}
              </div>
            </div>

            {/* Quick Days Preset Chips */}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-[11px] font-mono text-slate-400">Quick Interval:</span>
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
                    setFormData(prev => ({ ...prev, days_since_last_incident: p.val }));
                  }}
                  className={`text-xs px-2.5 py-1 rounded font-mono border transition-all cursor-pointer ${
                    formData.days_since_last_incident === p.val
                      ? 'bg-indigo-950/60 border-indigo-500/80 text-indigo-300 font-bold'
                      : 'bg-[#0b1120] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Row 2: Gravity Levels */}
            <div className="space-y-3 pt-1">
              {/* Feature 3: GravityOffenceID */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                  Current Offence Gravity
                </label>
                <div className="relative">
                  <select
                    value={formData.GravityOffenceID}
                    onChange={e => {
                      setFormData({ ...formData, GravityOffenceID: parseInt(e.target.value) });
                    }}
                    className="w-full bg-[#0b1120] border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:border-indigo-500 outline-none transition-all cursor-pointer font-medium appearance-none pr-9 truncate"
                  >
                    {GRAVITY_LEVELS.map(level => (
                      <option key={level.id} value={level.id} className="bg-[#0f172a] text-slate-200 py-1.5">
                        {level.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Feature 4: max_gravity_so_far */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                  Max Historical Gravity Recorded
                </label>
                <div className="relative">
                  <select
                    value={formData.max_gravity_so_far}
                    onChange={e => {
                      setFormData({ ...formData, max_gravity_so_far: parseInt(e.target.value) });
                    }}
                    className="w-full bg-[#0b1120] border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:border-indigo-500 outline-none transition-all cursor-pointer font-medium appearance-none pr-9 truncate"
                  >
                    {GRAVITY_LEVELS.map(level => (
                      <option key={level.id} value={level.id} className="bg-[#0f172a] text-slate-200 py-1.5">
                        {level.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 3: Binary Toggles */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Feature 5: prior_arrest_made */}
              <div className="p-3 rounded-lg bg-[#0b1120] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-slate-300">Prior Arrest</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    formData.prior_arrest_made === 1
                      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40'
                      : 'text-slate-400 border-slate-700 bg-slate-800/60'
                  }`}>
                    {formData.prior_arrest_made === 1 ? 'YES' : 'NO'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, prior_arrest_made: 1 });
                    }}
                    className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      formData.prior_arrest_made === 1
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#0f172a] text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, prior_arrest_made: 0 });
                    }}
                    className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      formData.prior_arrest_made === 0
                        ? 'bg-slate-700 text-white border border-slate-600'
                        : 'bg-[#0f172a] text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Feature 6: accused_has_other_victims */}
              <div className="p-3 rounded-lg bg-[#0b1120] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-slate-300">Other Victims</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    formData.accused_has_other_victims === 1
                      ? 'text-rose-400 border-rose-500/30 bg-rose-950/40'
                      : 'text-slate-400 border-slate-700 bg-slate-800/60'
                  }`}>
                    {formData.accused_has_other_victims === 1 ? 'YES' : 'NO'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, accused_has_other_victims: 1 });
                    }}
                    className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      formData.accused_has_other_victims === 1
                        ? 'bg-rose-600 text-white'
                        : 'bg-[#0f172a] text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, accused_has_other_victims: 0 });
                    }}
                    className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      formData.accused_has_other_victims === 0
                        ? 'bg-slate-700 text-white border border-slate-600'
                        : 'bg-[#0f172a] text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3">
            <button
              onClick={handleRunPrediction}
              disabled={loading}
              className="flex-1 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs sm:text-sm tracking-wider uppercase shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Predicting...
                </>
              ) : (
                <>
                  <Crosshair className="w-4 h-4" />
                  Predict Escalation Risk
                </>
              )}
            </button>

            <button
              onClick={handleResetForm}
              disabled={loading}
              className="px-4 py-3 rounded-lg bg-[#0b1120] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              Reset
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Tactical Verdict & ML Output (7 cols) */}
        <div className="lg:col-span-7 bg-[#0f172a]/95 border border-slate-800/90 rounded-xl p-5 sm:p-6 flex flex-col justify-between overflow-y-auto shadow-md">
          
          <div className="space-y-4">
            {/* Verdict Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-indigo-950/40 border border-indigo-800/40 text-indigo-400 flex items-center justify-center">
                  <Crosshair className="w-4 h-4" />
                </div>
                <span className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
                  Tactical Verdict Output
                </span>
              </div>
              {result?.latencyMs && (
                <span className="text-xs font-mono text-slate-400">
                  Latency: <span className="text-emerald-400 font-bold">{result.latencyMs}ms</span>
                </span>
              )}
            </div>

            {/* Verdict Box & Confidence */}
            {result && result.status === 'success' ? (
              <div className="space-y-3.5">
                
                {/* Classification Verdict Banner */}
                <div className={`p-4 sm:p-4.5 rounded-xl border flex items-center justify-between gap-4 ${
                  isEscalation
                    ? 'bg-rose-950/30 border-rose-800/60 text-rose-300'
                    : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                }`}>
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2.5 rounded-lg shrink-0 ${
                      isEscalation ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60' : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                    }`}>
                      {isEscalation ? <AlertOctagon className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Classification</div>
                      <div className="text-base sm:text-xl font-display font-bold tracking-wide">
                        {isEscalation ? 'ESCALATION IMMINENT' : 'LOW RISK / CONTAINED'}
                      </div>
                    </div>
                  </div>

                  {/* Confidence Badge */}
                  <div className="text-right">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Risk Probability</div>
                    <div className={`text-2xl sm:text-3xl font-mono font-bold ${isEscalation ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {probabilityPercent}%
                    </div>
                  </div>
                </div>

                {/* Inference Vector Breakdown Chips */}
                {lastSubmittedPayload && (
                  <div className="p-3 sm:p-3.5 rounded-xl bg-[#0b1120] border border-slate-800 space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                      Evaluated Inference Vector
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs font-mono">
                      <div className="p-2 rounded-lg bg-[#0f172a] border border-slate-800 text-center">
                        <span className="text-slate-400 block text-[10px]">Incident</span>
                        <span className="text-slate-100 font-bold text-xs sm:text-sm">#{lastSubmittedPayload.incident_number}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#0f172a] border border-slate-800 text-center">
                        <span className="text-slate-400 block text-[10px]">Interval</span>
                        <span className="text-slate-100 font-bold text-xs sm:text-sm">{lastSubmittedPayload.days_since_last_incident}d</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#0f172a] border border-slate-800 text-center">
                        <span className="text-slate-400 block text-[10px]">Offence</span>
                        <span className="text-indigo-300 font-bold text-xs sm:text-sm">Lvl {lastSubmittedPayload.GravityOffenceID}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#0f172a] border border-slate-800 text-center">
                        <span className="text-slate-400 block text-[10px]">Max Hist</span>
                        <span className="text-amber-400 font-bold text-xs sm:text-sm">Lvl {lastSubmittedPayload.max_gravity_so_far}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#0f172a] border border-slate-800 text-center">
                        <span className="text-slate-400 block text-[10px]">Arrest</span>
                        <span className={`font-bold text-xs sm:text-sm ${lastSubmittedPayload.prior_arrest_made ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {lastSubmittedPayload.prior_arrest_made ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#0f172a] border border-slate-800 text-center">
                        <span className="text-slate-400 block text-[10px]">Victims</span>
                        <span className={`font-bold text-xs sm:text-sm ${lastSubmittedPayload.accused_has_other_victims ? 'text-rose-400' : 'text-slate-300'}`}>
                          {lastSubmittedPayload.accused_has_other_victims ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Law Enforcement Action Plan */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-[#0b1120] border border-slate-800 space-y-2">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-indigo-400" />
                    Tactical Advisory Directive
                  </span>
                  
                  {isEscalation ? (
                    <ul className="text-xs sm:text-sm text-slate-300 space-y-1.5 list-disc list-inside leading-normal">
                      <li><span className="font-semibold text-rose-300">Preventive Detention:</span> Review Section 151 CrPC detention review.</li>
                      <li><span className="font-semibold text-rose-300">Target Surveillance:</span> Issue Beat Patrol alert for active suspect zones.</li>
                      <li><span className="font-semibold text-rose-300">Victim Protection:</span> Dispatch direct protective warning advisory to complainants.</li>
                    </ul>
                  ) : (
                    <ul className="text-xs sm:text-sm text-slate-300 space-y-1.5 list-disc list-inside leading-normal">
                      <li><span className="font-semibold text-emerald-300">Standard Inquiry:</span> Maintain regular judicial inquiry steps.</li>
                      <li><span className="font-semibold text-emerald-300">Routine Log:</span> Low threat escalation propensity detected.</li>
                    </ul>
                  )}
                </div>

              </div>
            ) : (
              <div className="py-10 text-center space-y-2.5">
                <div className="w-12 h-12 rounded-full border border-indigo-400/40 text-indigo-400 flex items-center justify-center mx-auto text-xl font-serif">
                  i
                </div>
                <h3 className="text-sm font-bold text-slate-200">Awaiting Parameters</h3>
                <p className="text-xs font-mono text-slate-400 max-w-xs mx-auto">
                  Click 'Predict Escalation Risk' to run threat assessment.
                </p>
              </div>
            )}
          </div>

          {/* Audit History Log */}
          <div className="pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-indigo-400" />
                Recent Inference History ({history.length})
              </span>
            </div>

            {history.length > 0 ? (
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {history.slice(0, 3).map((item) => {
                  const isHigh = item.response.prediction === 1;
                  return (
                    <div
                      key={item.id}
                      className="p-2 rounded-lg bg-[#0b1120] border border-slate-800/80 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isHigh ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                        <span className="text-slate-300 font-semibold">{item.id}</span>
                        <span className="text-slate-500">({item.timestamp})</span>
                      </div>
                      <span className={`font-bold ${isHigh ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {(item.response.risk_probability * 100).toFixed(0)}% Risk
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs font-mono text-slate-500 text-center py-2">
                Inference audit trail will log here upon execution.
              </p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}