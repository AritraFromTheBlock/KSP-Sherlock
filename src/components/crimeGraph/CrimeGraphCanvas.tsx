import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GraphData, GraphNode, GraphEdge } from '../../utils/crimeGraphDataLoader';
import { ZoomIn, ZoomOut, Maximize2, RefreshCw } from 'lucide-react';

interface CrimeGraphCanvasProps {
  graphData: GraphData;
  selectedNodeId: string | null;
  onSelectNode: (node: GraphNode | null) => void;
}

export const CrimeGraphCanvas: React.FC<CrimeGraphCanvasProps> = ({
  graphData,
  selectedNodeId,
  onSelectNode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Transform / View State
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Hover & Drag State
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const isDraggingCanvas = useRef<boolean>(false);
  const isDraggingNode = useRef<string | null>(null);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Node position cache (persists physics position across renders)
  const nodePositionsRef = useRef<Map<string, { x: number; y: number; vx: number; vy: number }>>(
    new Map()
  );

  // Build Adjacency List for Connected Element Highlighting
  const adjacencyMap = useMemoAdjacency(graphData.edges);

  // Initialize node positions if missing
  useEffect(() => {
    const posMap = nodePositionsRef.current;
    graphData.nodes.forEach((n) => {
      if (!posMap.has(n.id)) {
        posMap.set(n.id, {
          x: n.x || (Math.random() - 0.5) * 400,
          y: n.y || (Math.random() - 0.5) * 400,
          vx: 0,
          vy: 0,
        });
      }
    });
  }, [graphData]);

  // Center or Fit Graph view
  const fitGraphToScreen = useCallback(() => {
    setZoom(0.85);
    setPan({ x: 0, y: 0 });
  }, []);

  // Center specific node by ID
  const centerOnNodeId = useCallback(
    (nodeId: string) => {
      const pos = nodePositionsRef.current.get(nodeId);
      if (pos) {
        setPan({ x: -pos.x * zoom, y: -pos.y * zoom });
      }
    },
    [zoom]
  );

  // Expose global AI Controller methods on window.crimeGraphController
  useEffect(() => {
    (window as any).crimeGraphController = {
      focusDistrict: (districtName: string) => {
        const found = graphData.nodes.find(
          (n) => n.type === 'District' && n.label.toLowerCase().includes(districtName.toLowerCase())
        );
        if (found) {
          onSelectNode(found);
          centerOnNodeId(found.id);
        }
      },
      highlightCategory: (categoryName: string) => {
        const found = graphData.nodes.find(
          (n) =>
            (n.type === 'CrimeMajor' || n.type === 'CrimeMinor') &&
            n.label.toLowerCase().includes(categoryName.toLowerCase())
        );
        if (found) {
          onSelectNode(found);
          centerOnNodeId(found.id);
        }
      },
      highlightHighRisk: () => {
        const highRisk = graphData.nodes.find((n) => n.type === 'Case' && n.highRisk);
        if (highRisk) {
          onSelectNode(highRisk);
          centerOnNodeId(highRisk.id);
        }
      },
      filterByStatus: (statusName: string) => {
        const found = graphData.nodes.find(
          (n) => n.type === 'CaseStatus' && n.label.toLowerCase().includes(statusName.toLowerCase())
        );
        if (found) {
          onSelectNode(found);
          centerOnNodeId(found.id);
        }
      },
      centerNode: (nodeId: string) => {
        const found = graphData.nodes.find((n) => n.id === nodeId);
        if (found) {
          onSelectNode(found);
          centerOnNodeId(found.id);
        }
      },
      resetView: () => fitGraphToScreen(),
    };

    return () => {
      delete (window as any).crimeGraphController;
    };
  }, [graphData, onSelectNode, centerOnNodeId, fitGraphToScreen]);

  // Main Physics Simulation & Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const handleCanvasResize = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };

    handleCanvasResize();
    window.addEventListener('resize', handleCanvasResize);

    const posMap = nodePositionsRef.current;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // --- 1. FORCE-DIRECTED PHYSICS SIMULATION STEP ---
      const nodes = graphData.nodes;
      const edges = graphData.edges;

      // Repulsion force between all nodes
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        const p1 = posMap.get(n1.id);
        if (!p1) continue;

        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const p2 = posMap.get(n2.id);
          if (!p2) continue;

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const distSq = dx * dx + dy * dy + 0.1;
          const dist = Math.sqrt(distSq);

          if (dist < 320) {
            const force = 1200 / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (isDraggingNode.current !== n1.id) {
              p1.vx -= fx;
              p1.vy -= fy;
            }
            if (isDraggingNode.current !== n2.id) {
              p2.vx += fx;
              p2.vy += fy;
            }
          }
        }
      }

      // Edge spring attraction force
      edges.forEach((edge) => {
        const p1 = posMap.get(edge.source);
        const p2 = posMap.get(edge.target);
        if (!p1 || !p2) return;

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const desiredDist = 110;
        const force = (dist - desiredDist) * 0.025;

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (isDraggingNode.current !== edge.source) {
          p1.vx += fx;
          p1.vy += fy;
        }
        if (isDraggingNode.current !== edge.target) {
          p2.vx -= fx;
          p2.vy -= fy;
        }
      });

      // Update positions with velocity damping & central gravity
      nodes.forEach((n) => {
        const p = posMap.get(n.id);
        if (!p) return;

        if (isDraggingNode.current !== n.id) {
          // Central gravity
          p.vx -= p.x * 0.0015;
          p.vy -= p.y * 0.0015;

          // Damping
          p.vx *= 0.85;
          p.vy *= 0.85;

          p.x += p.vx;
          p.y += p.vy;
        }
      });

      // --- 2. CANVAS DRAWING STEP ---
      ctx.save();
      ctx.translate(w / 2 + pan.x, h / 2 + pan.y);
      ctx.scale(zoom, zoom);

      const activeHighlightId = hoveredNodeId || selectedNodeId;
      const connectedSet = activeHighlightId
        ? adjacencyMap.get(activeHighlightId) || new Set([activeHighlightId])
        : null;

      // Draw Edges
      edges.forEach((edge) => {
        const p1 = posMap.get(edge.source);
        const p2 = posMap.get(edge.target);
        if (!p1 || !p2) return;

        const isHighlighted =
          activeHighlightId &&
          (edge.source === activeHighlightId || edge.target === activeHighlightId);

        const isDimmed = connectedSet && !isHighlighted;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = isHighlighted
          ? '#38bdf8'
          : isDimmed
          ? 'rgba(51, 65, 85, 0.15)'
          : edge.color || 'rgba(51, 65, 85, 0.4)';
        ctx.lineWidth = isHighlighted ? 2.5 : 1.2;
        ctx.stroke();
      });

      // Draw Nodes
      nodes.forEach((n) => {
        const p = posMap.get(n.id);
        if (!p) return;

        const isSelected = selectedNodeId === n.id;
        const isHovered = hoveredNodeId === n.id;
        const isConnected = connectedSet ? connectedSet.has(n.id) : true;
        const isDimmed = connectedSet && !isConnected;

        ctx.save();
        ctx.globalAlpha = isDimmed ? 0.25 : 1.0;

        // Outer Selection Glow Ring
        if (isSelected || isHovered) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, n.radius + 6, 0, Math.PI * 2);
          ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255, 255, 255, 0.2)';
          ctx.fill();
          ctx.strokeStyle = isSelected ? '#38bdf8' : '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Node Circle Body
        ctx.beginPath();
        ctx.arc(p.x, p.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Node Label
        ctx.font = `${Math.max(10, Math.min(13, n.radius * 0.85))}px monospace`;
        ctx.fillStyle = isDimmed ? 'rgba(148, 163, 184, 0.3)' : '#f8fafc';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw label text under node
        const labelText =
          n.label.length > 18 ? n.label.substring(0, 16) + '…' : n.label;
        ctx.fillText(labelText, p.x, p.y + n.radius + 12);

        ctx.restore();
      });

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleCanvasResize);
    };
  }, [graphData, zoom, pan, selectedNodeId, hoveredNodeId, adjacencyMap]);

  // Screen to World Coords helper
  const screenToWorld = (screenX: number, screenY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const w = canvas.width;
    const h = canvas.height;

    const mouseX = screenX - rect.left;
    const mouseY = screenY - rect.top;

    const worldX = (mouseX - w / 2 - pan.x) / zoom;
    const worldY = (mouseY - h / 2 - pan.y) / zoom;

    return { x: worldX, y: worldY };
  };

  // Find node under mouse position
  const findNodeAtPos = (worldX: number, worldY: number): GraphNode | null => {
    const posMap = nodePositionsRef.current;
    for (let i = graphData.nodes.length - 1; i >= 0; i--) {
      const n = graphData.nodes[i];
      const p = posMap.get(n.id);
      if (p) {
        const dx = worldX - p.x;
        const dy = worldY - p.y;
        if (Math.sqrt(dx * dx + dy * dy) <= n.radius + 4) {
          return n;
        }
      }
    }
    return null;
  };

  // Mouse Event Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const { x: wX, y: wY } = screenToWorld(e.clientX, e.clientY);
    const clickedNode = findNodeAtPos(wX, wY);

    if (clickedNode) {
      isDraggingNode.current = clickedNode.id;
      onSelectNode(clickedNode);
    } else {
      isDraggingCanvas.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { x: wX, y: wY } = screenToWorld(e.clientX, e.clientY);

    // Node Dragging
    if (isDraggingNode.current) {
      const pos = nodePositionsRef.current.get(isDraggingNode.current);
      if (pos) {
        pos.x = wX;
        pos.y = wY;
        pos.vx = 0;
        pos.vy = 0;
      }
      return;
    }

    // Canvas Panning
    if (isDraggingCanvas.current) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Hover Detection
    const hoverTarget = findNodeAtPos(wX, wY);
    setHoveredNodeId(hoverTarget ? hoverTarget.id : null);
  };

  const handleMouseUp = () => {
    isDraggingNode.current = null;
    isDraggingCanvas.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
    setZoom((prev) => Math.max(0.3, Math.min(3.0, prev * zoomFactor)));
  };

  return (
    <div className="relative w-full h-full min-h-[440px] overflow-hidden bg-abyss border border-edge rounded-xl select-none">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,rgba(46,155,255,0.4),transparent_60%)] pointer-events-none" />

      {/* Main Graph Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Floating Canvas Controls Overlay */}
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
          onClick={fitGraphToScreen}
          title="Fit View"
          className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <Maximize2 size={16} />
        </button>
        <button
          onClick={fitGraphToScreen}
          title="Reset Simulation"
          className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors border-l border-edge/60 pl-2 ml-1"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Graph Legend Overlay */}
      <div className="absolute top-4 left-4 flex flex-wrap items-center gap-3 bg-panel/90 border border-edge/80 px-3 py-2 rounded-lg text-xs font-mono backdrop-blur-md z-10 pointer-events-none">
        <span className="flex items-center gap-1.5 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" /> District
        </span>
        <span className="flex items-center gap-1.5 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]" /> Major
        </span>
        <span className="flex items-center gap-1.5 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" /> Minor
        </span>
        <span className="flex items-center gap-1.5 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" /> Status
        </span>
        <span className="flex items-center gap-1.5 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" /> Case
        </span>
      </div>
    </div>
  );
};

// Helper: Build Adjacency Map for quick neighbor lookups
function useMemoAdjacency(edges: GraphEdge[]) {
  const map = new Map<string, Set<string>>();
  edges.forEach((e) => {
    if (!map.has(e.source)) map.set(e.source, new Set());
    if (!map.has(e.target)) map.set(e.target, new Set());
    map.get(e.source)!.add(e.target);
    map.get(e.target)!.add(e.source);
  });
  return map;
}
