import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  RotateCcw,
  Search,
  Shield,
  Layers,
  MapPin,
  FileText,
  Copy,
  Check,
  AlertCircle,
  Wifi,
  WifiOff,
  ChevronRight,
  Fingerprint,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import {
  fetchCrimeSeries,
  fetchSeriesForCase,
  checkMysterySolverHealth,
  sendMysteryQuery,
  CrimeSeriesCluster,
  MysteryChatMessage
} from '../services/mysterySolverService';

/**
 * Lightweight inline markdown renderer for Mystery Solver output.
 */
function renderMarkdown(text: string): React.ReactNode {
  return text.split('\n').map((line, lineIdx) => {
    // Check if line is a header
    if (line.startsWith('### ')) {
      return (
        <h4 key={lineIdx} className="text-neon-bright font-bold text-base mt-2 mb-1">
          {line.replace('### ', '')}
        </h4>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h3 key={lineIdx} className="text-neon-glow font-bold text-lg mt-3 mb-1">
          {line.replace('## ', '')}
        </h3>
      );
    }

    // Parse inline bold (**text**), code (`text`), and italic (*text*)
    const parseInline = (raw: string): React.ReactNode[] => {
      const parts: React.ReactNode[] = [];
      const regex = /\*\*(.+?)\*\*|`(.+?)`|\*(.+?)\*/g;
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(raw)) !== null) {
        if (match.index > lastIndex) {
          parts.push(raw.slice(lastIndex, match.index));
        }
        if (match[1] !== undefined) {
          parts.push(
            <strong key={match.index} className="text-slate-100 font-semibold">
              {match[1]}
            </strong>
          );
        } else if (match[2] !== undefined) {
          parts.push(
            <code
              key={match.index}
              className="bg-navy-dark px-1.5 py-0.5 rounded text-[11px] font-mono text-neon border border-edge"
            >
              {match[2]}
            </code>
          );
        } else if (match[3] !== undefined) {
          parts.push(
            <em key={match.index} className="text-slate-300 italic">
              {match[3]}
            </em>
          );
        }
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < raw.length) {
        parts.push(raw.slice(lastIndex));
      }
      return parts;
    };

    const isBullet = /^[•\-\*]\s/.test(line);
    const content = isBullet ? line.replace(/^[•\-\*]\s/, '') : line;

    if (!line.trim()) {
      return <div key={lineIdx} className="h-2" />;
    }

    return (
      <div key={lineIdx} className={`leading-relaxed ${isBullet ? 'flex items-start gap-2 pl-2 my-0.5' : 'my-0.5'}`}>
        {isBullet && <span className="text-neon text-xs mt-1">▸</span>}
        <span className="flex-1">{parseInline(content)}</span>
      </div>
    );
  });
}

const INITIAL_GREETING: MysteryChatMessage = {
  id: 'init-msg',
  role: 'assistant',
  content: `### 🕵️ Welcome to Mystery Solver\n\nI can help you analyze serial crime patterns, cross-reference cases, and investigate multi-district syndicates.\n\n*Select an active crime series on the right or type your inquiry below to begin.*`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  source: 'pattern-engine'
};

const SUGGESTED_QUERIES = [
  "Analyze the Drug Trafficking syndicate in Cluster #26",
  "Is Case #3523 linked to an ongoing crime series?",
  "Investigate the Cross-District Identity Theft series (Cluster #22)",
  "Which crime series span the highest number of Karnataka districts?"
];

export default function MysterySolver() {
  const [messages, setMessages] = useState<MysteryChatMessage[]>([INITIAL_GREETING]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [clusters, setClusters] = useState<CrimeSeriesCluster[]>([]);
  const [loadingClusters, setLoadingClusters] = useState(true);
  const [selectedCluster, setSelectedCluster] = useState<CrimeSeriesCluster | null>(null);

  // Case lookup state
  const [caseLookupId, setCaseLookupId] = useState('');
  const [lookupResult, setLookupResult] = useState<CrimeSeriesCluster | null | 'not-found'>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Health state
  const [healthStatus, setHealthStatus] = useState<{ online: boolean; latencyMs: number }>({
    online: false,
    latencyMs: 0
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatLogRef = useRef<HTMLDivElement>(null);

  // On mount, reset page scroll so header is never cut off or shifted
  useEffect(() => {
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTop = 0;
    window.scrollTo(0, 0);
  }, []);

  // Auto-scroll ONLY inside chat log container
  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTo({
        top: chatLogRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  // Initial load: Clusters & Health
  useEffect(() => {
    let isMounted = true;

    async function init() {
      setLoadingClusters(true);
      const [seriesData, health] = await Promise.all([
        fetchCrimeSeries(),
        checkMysterySolverHealth()
      ]);
      if (isMounted) {
        setClusters(seriesData);
        setHealthStatus(health);
        setLoadingClusters(false);
      }
    }

    init();
    const interval = setInterval(async () => {
      const h = await checkMysterySolverHealth();
      if (isMounted) setHealthStatus(h);
    }, 45000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleSend = async (queryText?: string, clusterCtx?: CrimeSeriesCluster | null) => {
    const textToSend = (queryText || inputVal).trim();
    if (!textToSend || isLoading) return;

    const userMsg: MysteryChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      clusterContext: clusterCtx || selectedCluster
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputVal('');
    setIsLoading(true);

    try {
      const response = await sendMysteryQuery(textToSend, clusterCtx || selectedCluster);

      const assistantMsg: MysteryChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: response.source,
        clusterContext: clusterCtx || selectedCluster
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Investigation Query Error:** Unable to retrieve telemetry from the mystery analysis engine. Error: ${err?.message || 'Connection timeout'}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaseLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseLookupId.trim() || isLookingUp) return;

    setIsLookingUp(true);
    setLookupResult(null);

    const res = await fetchSeriesForCase(caseLookupId.trim());
    setLookupResult(res || 'not-found');
    setIsLookingUp(false);
  };

  const handleSelectCluster = (cluster: CrimeSeriesCluster) => {
    setSelectedCluster(cluster);
    handleSend(
      `Investigate Crime Series Cluster #${cluster.cluster_id}: ${cluster.crime_types.join(', ')} across ${cluster.districts.length} districts with ${cluster.case_count} linked cases.`,
      cluster
    );
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([INITIAL_GREETING]);
    setSelectedCluster(null);
    setLookupResult(null);
  };

  return (
    <div className="relative flex flex-col h-[calc(100vh-6.5rem)] w-full text-slate-100 overflow-hidden font-sans rounded-2xl">
      {/* Deep Steel Dark Blue Ambient Atmosphere */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at 45% 25%, #0f254c 0%, #081730 45%, #030a18 100%)',
        }}
      />

      {/* High-Tech Tactical Grid */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.14] -z-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="radar-grid" width="44" height="44" patternUnits="userSpaceOnUse">
            <path d="M 44 0 L 0 0 0 44" fill="none" stroke="#00e5ff" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#radar-grid)" />
      </svg>

      {/* Prominent Live Rotating Tactical Surveillance Radar (Center-Right) */}
      <div className="pointer-events-none absolute top-1/2 right-[12%] -translate-y-1/2 h-[700px] w-[700px] opacity-[0.45] -z-10 select-none">
        {/* Rotating Radar Conic Beam with Bright Leading Sweep */}
        <motion.div
          className="h-full w-full rounded-full"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(0, 229, 255, 0.08) 310deg, rgba(0, 240, 255, 0.45) 358deg, rgba(255, 255, 255, 0.95) 360deg)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 6.5, repeat: Infinity, ease: 'linear' }}
        />

        {/* Glowing Radar Core & Ping */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_16px_#00e5ff] animate-ping opacity-80" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-cyan-200 shadow-[0_0_10px_#00e5ff]" />

        {/* Concentric Distance Rings with Glowing Cyan Borders */}
        <div className="absolute inset-8 rounded-full border border-cyan-400/35" />
        <div className="absolute inset-20 rounded-full border border-cyan-400/25" />
        <div className="absolute inset-36 rounded-full border border-cyan-400/20" />
        <div className="absolute inset-52 rounded-full border border-cyan-400/15" />

        {/* Crosshair Axes */}
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-cyan-400/25 shadow-[0_0_6px_#00e5ff]" />
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-cyan-400/25 shadow-[0_0_6px_#00e5ff]" />

        {/* Diagonal Bearing Markers */}
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-cyan-400/15 rotate-45" />
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-cyan-400/15 -rotate-45" />

        {/* Active Radar Target Blips */}
        <motion.div
          className="absolute w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#00e5ff]"
          style={{ top: '28%', left: '62%' }}
          animate={{ opacity: [0.1, 1, 0.2], scale: [0.8, 1.4, 0.9] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b]"
          style={{ top: '64%', left: '38%' }}
          animate={{ opacity: [0.2, 1, 0.1], scale: [0.9, 1.3, 0.9] }}
          transition={{ duration: 4.1, repeat: Infinity, delay: 1, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]"
          style={{ top: '42%', left: '76%' }}
          animate={{ opacity: [0.15, 0.95, 0.2], scale: [0.8, 1.3, 0.8] }}
          transition={{ duration: 3.6, repeat: Infinity, delay: 1.8, ease: 'easeInOut' }}
        />
      </div>

      {/* Secondary Ambient Echo (Top-Left) */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-[480px] w-[480px] opacity-[0.25] -z-10 select-none">
        <motion.div
          className="h-full w-full rounded-full"
          style={{
            background:
              'conic-gradient(from 180deg, transparent 0deg, transparent 280deg, rgba(46, 155, 255, 0.45) 360deg)',
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-10 rounded-full border border-blue-400/20" />
        <div className="absolute inset-24 rounded-full border border-blue-400/15" />
        <div className="absolute inset-38 rounded-full border border-blue-400/10" />
      </div>

      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-cyan-800/40 bg-[#091322]/80 px-4 py-3 rounded-xl backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-neon/10 border border-neon/30 flex items-center justify-center text-neon-bright shadow-neon-sm">
            <Search className="w-5 h-5 text-neon-bright" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-wide text-slate-100">
              MYSTERY <span className="text-neon-glow">SOLVER</span>
            </h1>
          </div>
        </div>

        {/* Status indicator & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-dark border border-edge text-xs font-mono">
            {healthStatus.online ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Railway API Connected</span>
                <span className="text-slate-500">({healthStatus.latencyMs}ms)</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400">Offline / Pattern Sync</span>
              </>
            )}
          </div>

          <button
            onClick={handleResetChat}
            title="Reset Conversation"
            className="p-1.5 rounded bg-panel hover:bg-edge text-slate-400 hover:text-slate-200 border border-edge transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Chat (8 cols) + Right Series Explorer (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 overflow-hidden min-h-0">
        {/* LEFT COLUMN: Mystery Solver Chat */}
        <div className="lg:col-span-8 flex flex-col h-full bg-[#091322]/85 border border-cyan-800/40 rounded-xl backdrop-blur-xl overflow-hidden shadow-2xl">
          {/* Active Context Bar if a cluster is focused */}
          {selectedCluster && (
            <div className="bg-neon/10 border-b border-neon/20 px-4 py-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-neon-bright font-mono">
                <Fingerprint className="w-4 h-4" />
                <span>Focusing on Crime Series Cluster #{selectedCluster.cluster_id}:</span>
                <span className="font-semibold text-slate-100">{selectedCluster.crime_types.join(', ')}</span>
                <span className="text-slate-400">({selectedCluster.case_count} cases)</span>
              </div>
              <button
                onClick={() => setSelectedCluster(null)}
                className="text-slate-400 hover:text-slate-200 text-xs hover:underline font-mono"
              >
                Clear Focus
              </button>
            </div>
          )}

          {/* Chat Messages Log */}
          <div ref={chatLogRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map(msg => {
                const isUser = msg.role === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-lg bg-neon/15 border border-neon/30 flex items-center justify-center text-neon-bright flex-shrink-0 mt-1 shadow-neon-sm">
                        <Search className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] md:max-w-[78%] rounded-xl p-4 text-sm flex flex-col justify-between ${
                        isUser
                          ? 'bg-neon/15 border border-neon/30 text-slate-100 rounded-tr-none'
                          : msg.isError
                          ? 'bg-red-950/40 border border-red-500/40 text-red-200 rounded-tl-none'
                          : 'bg-navy-dark/90 border border-edge text-slate-200 rounded-tl-none shadow-md'
                      }`}
                    >
                      {/* Content */}
                      <div className="text-slate-200 text-xs md:text-sm">
                        {renderMarkdown(msg.content)}
                      </div>

                      {/* Footer with Timestamp and Copy button shifted to bottom-right */}
                      <div className="flex items-center justify-end gap-2 mt-2 pt-1 text-[10px] font-mono text-slate-400">
                        <span>{msg.timestamp}</span>
                        {!isUser && (
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="p-1 rounded hover:bg-panel text-slate-400 hover:text-slate-200 transition-colors"
                            title="Copy to clipboard"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0 mt-1">
                        <Shield className="w-4 h-4 text-neon" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Thinking / Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 text-slate-400 text-xs font-mono"
              >
                <div className="w-8 h-8 rounded-lg bg-neon/15 border border-neon/30 flex items-center justify-center text-neon-bright">
                  <Activity className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-navy-dark/90 border border-edge rounded-lg px-4 py-2.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neon animate-ping" />
                  <span>Cross-referencing crime clusters & detecting modus operandi signatures...</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Suggested Query Chips */}
          <div className="px-4 py-2 border-t border-edge/60 bg-navy-dark/40 overflow-x-auto flex items-center gap-2 scrollbar-none">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider whitespace-nowrap">
              Quick Inquiries:
            </span>
            {SUGGESTED_QUERIES.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="whitespace-nowrap text-[11px] font-mono px-2.5 py-1 rounded-full bg-panel hover:bg-neon/10 text-slate-300 hover:text-neon-bright border border-edge hover:border-neon/40 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 md:p-4 border-t border-edge bg-panel/90">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder="Ask Mystery Solver about crime series, syndicate links, or case patterns..."
                disabled={isLoading}
                className="flex-1 bg-navy-dark border border-edge rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon font-sans transition-all"
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || isLoading}
                className={`px-4 py-2.5 rounded-lg flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-semibold transition-all ${
                  inputVal.trim() && !isLoading
                    ? 'bg-neon text-navy-darker hover:bg-neon-bright shadow-neon-sm cursor-pointer'
                    : 'bg-edge text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>Solve</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Crime Series & Fast Case Cross-Reference */}
        <div className="lg:col-span-4 flex flex-col h-full space-y-4 overflow-hidden">
          {/* 1. Case ID Cross-Reference Search Card */}
          <div className="bg-[#091322]/85 border border-cyan-800/40 rounded-xl p-4 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-4 h-4 text-neon" />
              <h2 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">
                Case Cross-Reference Look-Up
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Verify if a specific Case ID belongs to an ongoing crime series cluster.
            </p>
            <form onSubmit={handleCaseLookup} className="flex gap-2 mb-3">
              <input
                type="text"
                value={caseLookupId}
                onChange={e => setCaseLookupId(e.target.value)}
                placeholder="e.g. 3523, 5694, 9935"
                className="flex-1 bg-navy-dark border border-edge rounded px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-neon font-mono"
              />
              <button
                type="submit"
                disabled={!caseLookupId.trim() || isLookingUp}
                className="px-3 py-1.5 rounded bg-panel hover:bg-edge text-neon-bright border border-neon/30 hover:border-neon font-mono text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {isLookingUp ? 'Searching...' : 'Check'}
              </button>
            </form>

            {/* Lookup Result Box */}
            {lookupResult && lookupResult !== 'not-found' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-lg bg-neon/10 border border-neon/30 text-xs font-mono space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-neon-bright font-bold">MATCH FOUND: Cluster #{lookupResult.cluster_id}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon/20 text-neon-bright">
                    {lookupResult.case_count} Cases
                  </span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  <strong>Modus Operandi:</strong> {lookupResult.crime_types.join(', ')}
                </p>
                <p className="text-slate-400 text-[10px] truncate">
                  <strong>Districts:</strong> {lookupResult.districts.slice(0, 4).join(', ')}...
                </p>
                <button
                  onClick={() => handleSelectCluster(lookupResult)}
                  className="w-full mt-2 py-1 bg-neon text-navy-darker rounded font-semibold text-[11px] flex items-center justify-center gap-1 hover:bg-neon-bright transition-colors"
                >
                  <span>Investigate In Chat</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </motion.div>
            )}

            {lookupResult === 'not-found' && (
              <div className="p-2.5 rounded bg-slate-900/60 border border-edge text-[11px] text-slate-400 font-mono">
                No active serial crime cluster found for Case #{caseLookupId}. This may be an isolated offense.
              </div>
            )}
          </div>

          {/* 2. Detected Crime Series List */}
          <div className="flex-1 bg-[#091322]/85 border border-cyan-800/40 rounded-xl p-4 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden min-h-0">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-edge">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-neon-bright" />
                <h2 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">
                  Detected Crime Series
                </h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-navy-dark text-neon border border-edge">
                {clusters.length} Clusters Active
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {loadingClusters ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-500 gap-2">
                  <Activity className="w-6 h-6 animate-spin text-neon" />
                  <span className="text-xs font-mono">Loading active crime clusters...</span>
                </div>
              ) : clusters.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-mono">
                  No crime series detected.
                </div>
              ) : (
                clusters.map(cluster => {
                  const isSelected = selectedCluster?.cluster_id === cluster.cluster_id;
                  return (
                    <div
                      key={cluster.cluster_id}
                      onClick={() => handleSelectCluster(cluster)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer group ${
                        isSelected
                          ? 'bg-neon/15 border-neon shadow-neon-sm'
                          : 'bg-navy-dark/60 hover:bg-navy-dark border-edge hover:border-neon/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-mono text-xs font-bold text-neon-bright flex items-center gap-1.5">
                          <Fingerprint className="w-3.5 h-3.5 text-neon" />
                          Cluster #{cluster.cluster_id}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-panel text-slate-300 border border-edge">
                          {cluster.case_count} Cases
                        </span>
                      </div>

                      <div className="text-xs font-medium text-slate-200 mb-1 group-hover:text-neon transition-colors">
                        {cluster.crime_types.join(', ')}
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                        <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                        <span className="truncate">
                          {cluster.districts.slice(0, 3).join(', ')}
                          {cluster.districts.length > 3 ? ` +${cluster.districts.length - 3} more` : ''}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
