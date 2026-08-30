import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Activity,
  AlertCircle,
  Compass,
  Globe,
  Sparkles,
  Send,
  Bot,
  Cpu,
  Clock
} from 'lucide-react';
import { getMLHotspots, HotspotType } from '../services/hotspotService';
import { filterHotspots } from '../utils/searchUtils';
import { CITY_COORDINATES } from '../utils/mapUtils';
import { selectedHotspotStore } from '../utils/selectedHotspotStore';
import { mapActions, KARNATAKA_CENTER } from '../utils/mapActions';
import { handleHeatmapChatQuery } from '../utils/chatHeatmapController';
import CrimeMap from '../components/CrimeMap';

interface MiniMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isError?: boolean;
  investigator_summary?: any;
  explanation?: any;
  advanced_analytics?: any;
}

export default function CrimeHeatmap() {
  const [locations, setLocations] = useState<HotspotType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Mini assistant states
  const [chatInputValue, setChatInputValue] = useState('');
  const [chatMessages, setChatMessages] = useState<MiniMessage[]>([
    {
      id: 'init-msg',
      sender: 'ai',
      text: 'Map Copilot active. Type commands like "Show high-risk areas in Bengaluru" or "Reset map".'
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatThinkingIndex, setChatThinkingIndex] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const COPILOT_THINKING_STEPS = [
    'Analyzing...',
    'Thinking...',
    'Brainstorming...',
    'Reasoning...',
    'Correlating...',
    'Synthesizing...'
  ];

  useEffect(() => {
    if (!isChatLoading) {
      setChatThinkingIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setChatThinkingIndex((prev) => (prev + 1) % COPILOT_THINKING_STEPS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isChatLoading]);

  // Subscribe to the global reactive state store
  const [storeState, setStoreState] = useState(selectedHotspotStore.getState());

  useEffect(() => {
    const unsubscribe = selectedHotspotStore.subscribe((newState) => {
      setStoreState(newState);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  const {
    selectedHotspot: selectedCrime,
    activeDistrict: selectedDistrict,
    activeRisk: selectedRisk,
    searchQuery,
    mapCenter,
    mapZoom
  } = storeState;

  // Fetch ML Hotspots on component mount
  const loadHotspots = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMLHotspots();
      setLocations(data);
    } catch (e: any) {
      console.error('[HEATMAP-LOAD] Load failed:', e);
      setError(e.message || 'Unknown network error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHotspots();
  }, []);

  // Extract unique districts list dynamically from inferred hotspots
  const uniqueDistricts = useMemo(() => {
    const districts = Array.from(new Set(locations.map((loc) => loc.district)));
    return ['All', ...districts.sort()];
  }, [locations]);

  // Combined Search, District, and Risk filtering
  const filteredLocations = useMemo(() => {
    return filterHotspots(locations, selectedDistrict, selectedRisk, searchQuery);
  }, [locations, selectedDistrict, selectedRisk, searchQuery]);

  // Cluster counts mapped to UI Counter cards directly using the ML predictions
  const stats = useMemo(() => {
    const high = locations.filter((l) => l.risk_level === 'High').length;
    const medium = locations.filter((l) => l.risk_level === 'Medium').length;
    const low = locations.filter((l) => l.risk_level === 'Low').length;
    return { total: locations.length, high, medium, low };
  }, [locations]);

  // Handle local Mini assistant message transmission
  const handleMiniChatSend = async () => {
    const query = chatInputValue.trim();
    if (!query || isChatLoading) return;

    // Check context constraint for hotspot explanation command
    const isHotspotQuery = query.toLowerCase().includes('why is this hotspot high risk');
    
    if (isHotspotQuery && !selectedCrime) {
      const warningMsg: MiniMessage = {
        id: `msg-${Date.now()}-warn`,
        sender: 'ai',
        text: 'Please select a hotspot first.'
      };
      setChatMessages(prev => [
        ...prev,
        { id: `msg-${Date.now()}-user`, sender: 'user', text: query },
        warningMsg
      ]);
      setChatInputValue('');
      return;
    }

    const userMsg: MiniMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: query
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInputValue('');
    setIsChatLoading(true);

    try {
      const result = await handleHeatmapChatQuery(query, 'en', selectedCrime);

      const aiMsg: MiniMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: result.replyText,
        investigator_summary: result.response.investigator_summary,
        explanation: result.response.explanation,
        advanced_analytics: result.response.advanced_analytics,
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (e: any) {
      const errorMsg: MiniMessage = {
        id: `msg-${Date.now()}-err`,
        sender: 'ai',
        text: e.message || 'Unable to communicate with FastAPI intelligence service (http://localhost:8000).',
        isError: true
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // City Shortcuts and command routing (updates the global store state directly)
  const handleChatbotCommand = (commandType: string) => {
    switch (commandType) {
      case 'bengaluru':
        mapActions.filterMap('Bengaluru Urban', 'All');
        mapActions.zoomToCoordinate(CITY_COORDINATES.BENGALURU.center[0], CITY_COORDINATES.BENGALURU.center[1], CITY_COORDINATES.BENGALURU.zoom);
        break;
      case 'mysuru':
        mapActions.filterMap('Mysuru', 'All');
        mapActions.zoomToCoordinate(CITY_COORDINATES.MYSURU.center[0], CITY_COORDINATES.MYSURU.center[1], CITY_COORDINATES.MYSURU.zoom);
        break;
      case 'hubballi':
        mapActions.filterMap('Hubballi-Dharwad', 'All');
        mapActions.zoomToCoordinate(CITY_COORDINATES.HUBBALLI.center[0], CITY_COORDINATES.HUBBALLI.center[1], CITY_COORDINATES.HUBBALLI.zoom);
        break;
      case 'high-risk':
        mapActions.filterMap('All', 'High');
        mapActions.zoomToCoordinate(KARNATAKA_CENTER[0], KARNATAKA_CENTER[1], 7);
        break;
      case 'reset':
        mapActions.resetMap();
        loadHotspots();
        break;
      default:
        break;
    }
  };

  const handleSelectLocation = (loc: HotspotType) => {
    mapActions.setSelectedHotspot(loc);
  };

  const getRiskColorClass = (risk: HotspotType['risk_level']) => {
    switch (risk) {
      case 'High': return 'text-red-400 border-red-500/40 bg-red-500/10';
      case 'Medium': return 'text-orange-400 border-orange-500/40 bg-orange-500/10';
      case 'Low':
      default:
        return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 w-full pb-8"
    >
      {/* PAGE HEADER & METRIC COUNTERS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neon/10 border border-neon/30 text-neon-bright shadow-lg shadow-neon/10">
            <MapPin className="h-6 w-6 text-neon-bright" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold tracking-wide text-slate-100">
                Spatial Crime Heatmap
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-neon/10 text-neon border border-neon/30 rounded-full">
                ML CLUSTERS LOADED
              </span>
            </div>
            <p className="text-xs font-mono uppercase tracking-widest text-slate-400 mt-0.5">
              Karnataka State Police • Machine Learning Generated Hotspots
            </p>
          </div>
        </div>

        {/* Risk Level Counter Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg text-center">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Hotspots</span>
            <span className="text-lg font-bold text-slate-200 font-mono">{stats.total}</span>
          </div>
          <div className="bg-red-950/30 border border-red-900/40 p-2.5 rounded-lg text-center">
            <span className="text-[10px] font-mono uppercase text-red-400 block">High Risk</span>
            <span className="text-lg font-bold text-red-400 font-mono">{stats.high}</span>
          </div>
          <div className="bg-orange-950/30 border border-orange-900/40 p-2.5 rounded-lg text-center">
            <span className="text-[10px] font-mono uppercase text-orange-400 block">Med Risk</span>
            <span className="text-lg font-bold text-orange-400 font-mono">{stats.medium}</span>
          </div>
          <div className="bg-emerald-950/30 border border-emerald-900/40 p-2.5 rounded-lg text-center">
            <span className="text-[10px] font-mono uppercase text-emerald-400 block">Low Risk</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">{stats.low}</span>
          </div>
        </div>
      </div>

      {/* FILTER BAR & CHATBOT QUICK CONTROLS */}
      <div className="flex flex-col gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search cluster ID, district, coords..."
              value={searchQuery}
              onChange={(e) => selectedHotspotStore.updateState({ searchQuery: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-neon/50 transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Risk Selector */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-500 px-2 flex items-center gap-1 font-mono text-[11px]">
                <Filter className="w-3 h-3" /> Risk:
              </span>
              {(['All', 'High', 'Medium', 'Low'] as const).map((risk) => (
                <button
                  key={risk}
                  onClick={() => selectedHotspotStore.updateState({ activeRisk: risk, selectedHotspot: null })}
                  className={`px-2.5 py-1 rounded-md transition-all font-medium text-xs cursor-pointer ${
                    selectedRisk === risk
                      ? risk === 'High'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : risk === 'Medium'
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                        : risk === 'Low'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-700 text-slate-100'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {risk}
                </button>
              ))}
            </div>

            {/* District Selector */}
            <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-500 font-mono text-[11px]">District:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => selectedHotspotStore.updateState({ activeDistrict: e.target.value, selectedHotspot: null })}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
              >
                {uniqueDistricts.map((d) => (
                  <option key={d} value={d} className="bg-slate-900 text-slate-200">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => handleChatbotCommand('reset')}
              className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors cursor-pointer"
              title="Reset View"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chatbot Action Shortcuts */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 overflow-x-auto text-xs">
          <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1 whitespace-nowrap">
            <Sparkles className="w-3 h-3 text-neon" /> Chatbot Shortcuts:
          </span>
          <button
            onClick={() => handleChatbotCommand('bengaluru')}
            className="px-2.5 py-1 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded border border-slate-700/50 transition-colors whitespace-nowrap cursor-pointer"
          >
            "Zoom to Bengaluru"
          </button>
          <button
            onClick={() => handleChatbotCommand('mysuru')}
            className="px-2.5 py-1 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded border border-slate-700/50 transition-colors whitespace-nowrap cursor-pointer"
          >
            "Zoom to Mysuru"
          </button>
          <button
            onClick={() => handleChatbotCommand('hubballi')}
            className="px-2.5 py-1 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded border border-slate-700/50 transition-colors whitespace-nowrap cursor-pointer"
          >
            "Zoom to Hubballi"
          </button>
          <button
            onClick={() => handleChatbotCommand('high-risk')}
            className="px-2.5 py-1 bg-red-950/40 hover:bg-red-900/40 text-red-300 rounded border border-red-800/50 transition-colors whitespace-nowrap cursor-pointer"
          >
            "Show High Risk Crimes"
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA: LEAFLET MAP & SIDEBAR LIST / SELECTED DETAILS */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:h-[720px] lg:min-h-[600px]">
        {/* Leaflet Map Area */}
        <div className="lg:col-span-2 h-[450px] lg:h-full flex flex-col relative rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
          
          {/* loading spinner over map */}
          {isLoading && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-neon-bright animate-spin" />
              <span className="font-mono text-xs text-slate-400">Loading crime hotspots...</span>
            </div>
          )}

          {/* Error view */}
          {error && (
            <div className="absolute inset-0 bg-slate-950/90 z-50 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <AlertCircle className="w-10 h-10 text-red-500" />
              <span className="font-display font-bold text-sm text-slate-200">Unable to load hotspot data from backend.</span>
              <span className="text-[11px] font-mono text-slate-500 max-w-md">{error}</span>
              <button
                onClick={loadHotspots}
                className="mt-2 px-4 py-1.5 bg-neon/20 hover:bg-neon/30 text-neon-bright border border-neon/40 rounded-lg text-xs font-mono flex items-center gap-2 cursor-pointer transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
              </button>
            </div>
          )}

          {/* Reusable Leaflet CrimeMap Component */}
          {!error && (
            <CrimeMap
              locations={filteredLocations}
              selectedCrime={selectedCrime}
              onMarkerClick={handleSelectLocation}
              center={mapCenter}
              zoom={mapZoom}
              className="w-full h-full flex-1"
            />
          )}
        </div>

        {/* Right Sidebar: Map Assistant, Details & List feed */}
        <div className="flex flex-col gap-4 h-[650px] lg:h-full overflow-hidden">
          
          {/* Top Half: Hotspot details or placeholder */}
          <div className="shrink-0">
            {selectedCrime ? (
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 shadow-xl flex flex-col gap-2.5 animate-fade-in">
                <div className="flex items-start justify-between border-b border-slate-800 pb-1.5">
                  <div>
                    <span className="text-[9px] font-mono uppercase text-neon tracking-wider">
                      Selected Hotspot
                    </span>
                    <h3 className="font-bold text-xs text-slate-100 font-display">Hotspot Information</h3>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${getRiskColorClass(selectedCrime.risk_level)}`}>
                    {selectedCrime.risk_level} Risk
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="bg-slate-950 p-1.5 rounded border border-slate-800 col-span-2">
                    <span className="text-slate-500 block text-[9px] uppercase font-mono">Location Identifier</span>
                    <span className="font-mono font-bold text-slate-200">{selectedCrime.id}</span>
                  </div>
                  <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[9px] uppercase font-mono">Latitude</span>
                    <span className="font-mono text-slate-200">{selectedCrime.latitude}</span>
                  </div>
                  <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[9px] uppercase font-mono">Longitude</span>
                    <span className="font-mono text-slate-200">{selectedCrime.longitude}</span>
                  </div>
                  <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[9px] uppercase font-mono">Risk Score</span>
                    <span className="font-mono font-bold text-slate-200">{selectedCrime.risk_score.toFixed(4)}</span>
                  </div>
                  <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[9px] uppercase font-mono">Cluster ID</span>
                    <span className="font-mono text-slate-200">C-{selectedCrime.cluster}</span>
                  </div>
                </div>

                <button
                  onClick={() => selectedHotspotStore.updateState({ selectedHotspot: null })}
                  className="w-full py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors cursor-pointer"
                >
                  Deselect Hotspot
                </button>
              </div>
            ) : (
              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800 text-center flex flex-col items-center justify-center py-4 text-slate-500">
                <Compass className="w-6 h-6 text-slate-600 mb-1 animate-pulse" />
                <p className="text-[10px] font-mono uppercase tracking-wider">Click any marker on the map</p>
                <p className="text-[9px] text-slate-600">To inspect specific hotspot coordinates</p>
              </div>
            )}
          </div>

          {/* Interactive AI Map Copilot */}
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 flex-[1.2] flex flex-col overflow-hidden">
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800 mb-2 shrink-0">
              <Bot className="w-4 h-4 text-neon-bright animate-pulse" />
              <span className="font-display text-[11px] font-bold uppercase tracking-wider text-slate-300">
                AI Map Copilot
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping ml-auto" />
            </div>

            {/* Scrollable message threads */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar text-[11px]">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-lg px-2.5 py-1.5 border shadow ${
                    msg.sender === 'user'
                      ? 'bg-neon/10 border-neon/30 text-slate-200'
                      : msg.isError
                      ? 'bg-red-500/10 border-red-500/30 text-red-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}>
                    <p className="leading-normal">{msg.text}</p>

                    {/* Investigator Summary (Step 6) */}
                    {msg.investigator_summary && (
                      <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] space-y-1">
                        <span className="font-mono text-neon font-bold uppercase tracking-wider block">Investigator Summary</span>
                        {msg.investigator_summary.executive_summary && (
                          <p className="text-slate-400 leading-snug">{msg.investigator_summary.executive_summary}</p>
                        )}
                        {msg.investigator_summary.recommended_actions && Array.isArray(msg.investigator_summary.recommended_actions) && msg.investigator_summary.recommended_actions.length > 0 && (
                          <div className="text-slate-400">
                            <span className="text-slate-500 block font-mono font-semibold">Recommended Actions:</span>
                            <ul className="list-disc list-inside space-y-0.5">
                              {msg.investigator_summary.recommended_actions.map((act: string, idx: number) => (
                                <li key={idx}>{act}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Explanation (Step 6) */}
                    {msg.explanation && (
                      <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-orange-400 font-bold uppercase tracking-wider">XAI Evidence</span>
                          {msg.explanation.confidence_score !== undefined && (
                            <span className="font-mono text-slate-500 text-[9px]">Confidence: {(msg.explanation.confidence_score * 100).toFixed(0)}%</span>
                          )}
                        </div>
                        {msg.explanation.primary_evidence && Array.isArray(msg.explanation.primary_evidence) && (
                          <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                            {msg.explanation.primary_evidence.map((ev: string, idx: number) => (
                              <li key={idx}>{ev}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {/* Advanced Analytics (Step 6) */}
                    {msg.advanced_analytics && (
                      <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] space-y-1">
                        <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider block">Advanced Analytics</span>
                        {msg.advanced_analytics.district_comparison?.higher_risk_district && (
                          <p className="text-slate-400">
                            District Compare: {msg.advanced_analytics.district_comparison.higher_risk_district} is at higher risk.
                          </p>
                        )}
                        {msg.advanced_analytics.temporal_trends?.summary && (
                          <p className="text-slate-400">{msg.advanced_analytics.temporal_trends.summary}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-400 flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 animate-spin text-neon-bright" />
                    <span className="text-neon font-medium transition-all">
                      {COPILOT_THINKING_STEPS[chatThinkingIndex % COPILOT_THINKING_STEPS.length]}
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Micro chat input bar */}
            <div className="mt-2 relative flex items-center shrink-0">
              <input
                type="text"
                value={chatInputValue}
                onChange={(e) => setChatInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleMiniChatSend();
                }}
                disabled={isChatLoading}
                placeholder="Ask AI to filter or zoom map..."
                className="w-full bg-slate-950 border border-slate-800 rounded-full pl-3 pr-10 py-1.5 text-xs text-slate-200 outline-none focus:border-neon transition-all"
              />
              <button
                onClick={handleMiniChatSend}
                disabled={!chatInputValue.trim() || isChatLoading}
                className="absolute right-1 w-7 h-7 flex items-center justify-center rounded-full bg-neon/20 hover:bg-neon hover:text-void text-neon-bright transition-all cursor-pointer disabled:opacity-40"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Incident Feed List (Bottom Section) */}
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2 shrink-0">
              <h3 className="font-display text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-neon" /> Hotspot Feed ({filteredLocations.length})
              </h3>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar text-[11px]">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((loc) => {
                  const isSelected = selectedCrime?.id === loc.id;
                  return (
                    <div
                      key={loc.id}
                      onClick={() => handleSelectLocation(loc)}
                      className={`p-2 rounded border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-slate-800 border-neon/50 text-slate-100 shadow-md'
                          : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-slate-100 text-[10px]">{loc.district}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          ({loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)})
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold">
                        <span className={`px-1.5 py-0.5 rounded border ${getRiskColorClass(loc.risk_level)}`}>
                          {loc.risk_level.substring(0, 4)}
                        </span>
                        <Eye className="w-3 h-3 text-slate-500" />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-slate-500 text-[10px]">
                  No hotspots match criteria.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
