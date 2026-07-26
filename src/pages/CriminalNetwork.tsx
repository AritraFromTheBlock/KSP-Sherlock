import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Network,
  Search,
  Filter,
  Loader2,
  AlertTriangle,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  UserCheck,
  FileText,
  Link as LinkIcon
} from 'lucide-react';

interface RawEdge {
  source: string;
  target: string;
  relation: string;
}

interface GraphNode {
  id: string;
  label: string;
  type: 'Accused' | 'Case';
  color: string;
  radius: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
}

export default function CriminalNetwork() {
  const [edges, setEdges] = useState<RawEdge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Transform / Camera State
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const isDraggingCanvas = useRef<boolean>(false);
  const isDraggingNode = useRef<string | null>(null);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const nodePosRef = useRef<Map<string, GraphNode>>(new Map());

  // Fetch /data/network.json
  const fetchNetworkData = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch('/data/network.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load /data/network.json`);
        return res.json();
      })
      .then((data: RawEdge[]) => {
        setEdges(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch network graph data');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchNetworkData();
  }, [fetchNetworkData]);

  // Derive unique nodes & graph structure from raw edges
  const { nodes, graphEdges, adjacency } = useMemo(() => {
    if (!edges || edges.length === 0) {
      return { nodes: [], graphEdges: [], adjacency: new Map<string, Set<string>>() };
    }

    const nodeMap = new Map<string, GraphNode>();
    const gEdges: GraphEdge[] = [];
    const adj = new Map<string, Set<string>>();

    edges.forEach((e, idx) => {
      const gEdgeId = `edge_${idx}`;
      gEdges.push({ id: gEdgeId, source: e.source, target: e.target, relation: e.relation });

      if (!adj.has(e.source)) adj.set(e.source, new Set());
      if (!adj.has(e.target)) adj.set(e.target, new Set());
      adj.get(e.source)!.add(e.target);
      adj.get(e.target)!.add(e.source);

      // Create unique nodes
      [e.source, e.target].forEach((nodeId) => {
        if (!nodeMap.has(nodeId)) {
          const isAccused = nodeId.startsWith('accused_');
          const cleanLabel = isAccused
            ? nodeId.replace('accused_', 'Offender ')
            : nodeId.replace('case_', 'Case ');

          const existingPos = nodePosRef.current.get(nodeId);

          const node: GraphNode = {
            id: nodeId,
            label: cleanLabel,
            type: isAccused ? 'Accused' : 'Case',
            color: isAccused ? '#ef4444' : '#3b82f6', // Red for Accused, Blue for Case
            radius: isAccused ? 14 : 10,
            x: existingPos ? existingPos.x : (Math.random() - 0.5) * 500,
            y: existingPos ? existingPos.y : (Math.random() - 0.5) * 500,
            vx: 0,
            vy: 0,
          };

          nodeMap.set(nodeId, node);
          nodePosRef.current.set(nodeId, node);
        }
      });
    });

    return {
      nodes: Array.from(nodeMap.values()),
      graphEdges: gEdges,
      adjacency: adj,
    };
  }, [edges]);

  // Filter nodes matching search query
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return nodes;
    const q = searchQuery.toLowerCase().trim();
    return nodes.filter(
      (n) => n.label.toLowerCase().includes(q) || n.id.toLowerCase().includes(q)
    );
  }, [nodes, searchQuery]);

  // Handle Canvas Zoom/Pan & Physics Render Loop
  useEffect(() => {
    if (loading || error || nodes.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const handleResize = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // --- Force Physics Simulation Step ---
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy + 0.1;
          const dist = Math.sqrt(distSq);

          if (dist < 280) {
            const force = 900 / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (isDraggingNode.current !== n1.id) {
              n1.vx -= fx;
              n1.vy -= fy;
            }
            if (isDraggingNode.current !== n2.id) {
              n2.vx += fx;
              n2.vy += fy;
            }
          }
        }
      }

      // Edge Spring Attraction Force
      graphEdges.forEach((e) => {
        const n1 = nodePosRef.current.get(e.source);
        const n2 = nodePosRef.current.get(e.target);
        if (!n1 || !n2) return;

        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const desired = 100;
        const force = (dist - desired) * 0.02;

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (isDraggingNode.current !== e.source) {
          n1.vx += fx;
          n1.vy += fy;
        }
        if (isDraggingNode.current !== e.target) {
          n2.vx -= fx;
          n2.vy -= fy;
        }
      });

      // Position update with damping
      nodes.forEach((n) => {
        if (isDraggingNode.current !== n.id) {
          n.vx -= n.x * 0.0012;
          n.vy -= n.y * 0.0012;
          n.vx *= 0.86;
          n.vy *= 0.86;
          n.x += n.vx;
          n.y += n.vy;
        }
      });

      // --- Drawing Step ---
      ctx.save();
      ctx.translate(w / 2 + pan.x, h / 2 + pan.y);
      ctx.scale(zoom, zoom);

      const activeId = hoveredNodeId || (selectedNode ? selectedNode.id : null);
      const connectedSet = activeId ? adjacency.get(activeId) || new Set([activeId]) : null;

      // Draw Edges
      graphEdges.forEach((e) => {
        const n1 = nodePosRef.current.get(e.source);
        const n2 = nodePosRef.current.get(e.target);
        if (!n1 || !n2) return;

        const isHighlighted = activeId && (e.source === activeId || e.target === activeId);
        const isDimmed = connectedSet && !isHighlighted;

        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.strokeStyle = isHighlighted
          ? '#38bdf8'
          : isDimmed
          ? 'rgba(51, 65, 85, 0.12)'
          : 'rgba(51, 65, 85, 0.45)';
        ctx.lineWidth = isHighlighted ? 2.5 : 1.2;
        ctx.stroke();
      });

      // Draw Nodes
      nodes.forEach((n) => {
        const isSelected = selectedNode?.id === n.id;
        const isHovered = hoveredNodeId === n.id;
        const isConnected = connectedSet ? connectedSet.has(n.id) || n.id === activeId : true;
        const isDimmed = connectedSet && !isConnected;

        ctx.save();
        ctx.globalAlpha = isDimmed ? 0.2 : 1.0;

        if (isSelected || isHovered) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 6, 0, Math.PI * 2);
          ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255, 255, 255, 0.2)';
          ctx.fill();
          ctx.strokeStyle = isSelected ? '#38bdf8' : '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = '11px monospace';
        ctx.fillStyle = isDimmed ? 'rgba(148, 163, 184, 0.3)' : '#f8fafc';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.label, n.x, n.y + n.radius + 12);

        ctx.restore();
      });

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [nodes, graphEdges, zoom, pan, selectedNode, hoveredNodeId, adjacency, loading, error]);

  // Coordinate math
  const screenToWorld = (screenX: number, screenY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const w = canvas.width;
    const h = canvas.height;
    return {
      x: (screenX - rect.left - w / 2 - pan.x) / zoom,
      y: (screenY - rect.top - h / 2 - pan.y) / zoom,
    };
  };

  const findNodeAtPos = (wX: number, wY: number): GraphNode | null => {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const dx = wX - n.x;
      const dy = wY - n.y;
      if (Math.sqrt(dx * dx + dy * dy) <= n.radius + 4) return n;
    }
    return null;
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const { x: wX, y: wY } = screenToWorld(e.clientX, e.clientY);
    const targetNode = findNodeAtPos(wX, wY);

    if (targetNode) {
      isDraggingNode.current = targetNode.id;
      setSelectedNode(targetNode);
    } else {
      isDraggingCanvas.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { x: wX, y: wY } = screenToWorld(e.clientX, e.clientY);

    if (isDraggingNode.current) {
      const n = nodePosRef.current.get(isDraggingNode.current);
      if (n) {
        n.x = wX;
        n.y = wY;
        n.vx = 0;
        n.vy = 0;
      }
      return;
    }

    if (isDraggingCanvas.current) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const hoverTarget = findNodeAtPos(wX, wY);
    setHoveredNodeId(hoverTarget ? hoverTarget.id : null);
  };

  const handleMouseUp = () => {
    isDraggingNode.current = null;
    isDraggingCanvas.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.88;
    setZoom((z) => Math.max(0.3, Math.min(3.0, z * factor)));
  };

  const resetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Connected edges for entity inspector
  const connectedEdges = useMemo(() => {
    if (!selectedNode) return [];
    return graphEdges.filter(
      (e) => e.source === selectedNode.id || e.target === selectedNode.id
    );
  }, [selectedNode, graphEdges]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col p-4 sm:p-6 gap-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-200">
            Criminal Network Graph
          </h1>
          <p className="text-sm font-mono text-slate-400 mt-1">
            Real NetworkX intelligence visualization derived from network.json
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search offender or case..."
              className="bg-abyss border border-edge rounded-lg pl-9 pr-4 py-2 text-sm font-mono text-slate-200 outline-none w-64 focus:border-neon focus:shadow-neon-sm transition-all"
            />
          </div>
          <button
            onClick={fetchNetworkData}
            title="Reload Network Data"
            className="flex items-center gap-2 px-3 py-2 bg-panel border border-edge rounded-lg text-sm font-mono text-slate-300 hover:bg-edge/50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4">
        {/* Graph Canvas Container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 bg-abyss border border-edge rounded-xl relative overflow-hidden flex items-center justify-center select-none"
        >
          {loading && (
            <div className="flex flex-col items-center gap-3 text-slate-400 font-mono text-sm">
              <Loader2 className="w-8 h-8 animate-spin text-neon-bright" />
              <span>Fetching /data/network.json...</span>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-3 text-red-400 font-mono text-sm max-w-md text-center p-6 bg-red-950/20 border border-red-500/30 rounded-xl">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <span className="font-bold">Network Data Error</span>
              <span className="text-xs text-slate-400">{error}</span>
              <button
                onClick={fetchNetworkData}
                className="mt-2 px-4 py-1.5 bg-red-500/20 border border-red-500/40 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors text-xs"
              >
                Retry Fetch
              </button>
            </div>
          )}

          {!loading && !error && nodes.length === 0 && (
            <div className="flex flex-col items-center gap-2 text-slate-400 font-mono text-sm">
              <Network className="w-12 h-12 text-slate-600" />
              <span>No network graph nodes found in dataset.</span>
            </div>
          )}

          {!loading && !error && nodes.length > 0 && (
            <>
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                className="w-full h-full cursor-grab active:cursor-grabbing block"
              />

              {/* Floating Graph Overlay Controls */}
              <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-panel/90 border border-edge/80 p-1.5 rounded-lg shadow-lg backdrop-blur-md z-10">
                <button
                  onClick={() => setZoom((z) => Math.min(3.0, z * 1.2))}
                  title="Zoom In"
                  className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={() => setZoom((z) => Math.max(0.3, z * 0.8))}
                  title="Zoom Out"
                  className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <ZoomOut size={16} />
                </button>
                <button
                  onClick={resetView}
                  title="Reset View"
                  className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <Maximize2 size={16} />
                </button>
              </div>

              {/* Graph Node Type Legend */}
              <div className="absolute top-4 left-4 flex items-center gap-4 bg-panel/90 border border-edge/80 px-3 py-2 rounded-lg text-xs font-mono backdrop-blur-md z-10">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" /> Accused Node
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" /> Linked Case Node
                </span>
              </div>
            </>
          )}
        </motion.div>

        {/* Entity Properties Sidebar */}
        <div className="w-full lg:w-80 shrink-0 bg-panel border border-edge rounded-xl p-6 flex flex-col">
          <h3 className="text-sm font-mono font-medium text-slate-400 uppercase tracking-wider mb-4 border-b border-edge pb-2">
            Entity Details
          </h3>

          {!selectedNode ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-abyss border border-edge flex items-center justify-center mb-4 text-slate-500">
                <Network className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-400 font-mono">
                Select a node or edge on the graph to view properties and connections.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col font-mono text-xs space-y-4 overflow-y-auto">
              <div className="bg-abyss/80 border border-edge p-3 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                    style={{
                      backgroundColor: `${selectedNode.color}20`,
                      color: selectedNode.color,
                      border: `1px solid ${selectedNode.color}50`,
                    }}
                  >
                    {selectedNode.type === 'Accused' ? (
                      <UserCheck className="w-3 h-3" />
                    ) : (
                      <FileText className="w-3 h-3" />
                    )}
                    {selectedNode.type} Node
                  </span>
                  <span className="text-[10px] text-slate-500">ID: {selectedNode.id}</span>
                </div>

                <div className="text-sm font-bold text-slate-100 pt-1">{selectedNode.label}</div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                  Connected Edges ({connectedEdges.length})
                </span>

                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {connectedEdges.map((e) => {
                    const targetId = e.source === selectedNode.id ? e.target : e.source;
                    const targetNode = nodePosRef.current.get(targetId);

                    return (
                      <button
                        key={e.id}
                        onClick={() => targetNode && setSelectedNode(targetNode)}
                        className="w-full flex items-center justify-between p-2 rounded bg-abyss border border-edge/60 hover:bg-slate-800 text-left transition-colors"
                      >
                        <span className="text-slate-300 truncate">
                          {targetNode ? targetNode.label : targetId}
                        </span>
                        <span className="text-[10px] text-neon-bright flex items-center gap-1 shrink-0 ml-2">
                          <LinkIcon className="w-3 h-3" /> {e.relation}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}