import React from 'react';
import { GraphNode } from '../../utils/crimeGraphDataLoader';
import { Network, MapPin, ShieldAlert, Users, Calendar, AlertTriangle, ArrowRight } from 'lucide-react';

interface EntityDetailsPanelProps {
  selectedNode: GraphNode | null;
  onSelectNode: (node: GraphNode | null) => void;
  allNodes: GraphNode[];
}

export const EntityDetailsPanel: React.FC<EntityDetailsPanelProps> = ({
  selectedNode,
  onSelectNode,
  allNodes,
}) => {
  if (!selectedNode) {
    return (
      <div className="w-full lg:w-80 shrink-0 bg-panel border border-edge rounded-xl p-6 flex flex-col h-full">
        <h3 className="text-sm font-mono font-semibold text-slate-400 uppercase tracking-wider mb-4 border-b border-edge pb-2">
          Entity Details
        </h3>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
          <div className="w-16 h-16 rounded-full bg-abyss border border-edge flex items-center justify-center mb-4 text-neon-bright shadow-neon-sm">
            <Network className="w-7 h-7" />
          </div>
          <p className="text-xs font-mono text-slate-300 font-medium mb-1">No Entity Selected</p>
          <p className="text-xs text-slate-500 max-w-[200px]">
            Click any node on the graph or search above to view full crime intelligence details.
          </p>
        </div>
      </div>
    );
  }

  // Find parent or connected node if available
  const parentNode = selectedNode.parentId
    ? allNodes.find((n) => n.id === selectedNode.parentId)
    : null;

  return (
    <div className="w-full lg:w-80 shrink-0 bg-panel border border-edge rounded-xl p-5 flex flex-col h-full overflow-y-auto">
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-edge pb-3 mb-4">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider"
          style={{
            backgroundColor: `${selectedNode.color}20`,
            color: selectedNode.color,
            border: `1px solid ${selectedNode.color}50`,
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: selectedNode.color }}
          />
          {selectedNode.type} ENTITY
        </span>
      </div>

      {/* Entity Title & Core Details */}
      <div className="mb-5">
        <h2 className="text-lg font-display font-bold text-slate-100 break-words leading-snug">
          {selectedNode.label}
        </h2>

        {selectedNode.districtName && selectedNode.type !== 'District' && (
          <p className="text-xs font-mono text-slate-400 mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            {selectedNode.districtName}
          </p>
        )}
      </div>

      {/* Dynamic Key Metrics Grid */}
      <div className="space-y-4 flex-1">
        {/* DISTRICT NODE DETAILS */}
        {selectedNode.type === 'District' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="bg-abyss/80 border border-edge/80 p-3 rounded-lg flex items-center justify-between">
              <span className="text-slate-400">Total Cases:</span>
              <span className="font-bold text-blue-400 text-sm">{selectedNode.caseCount}</span>
            </div>

            <div className="bg-abyss/80 border border-edge/80 p-3 rounded-lg flex items-center justify-between">
              <span className="text-slate-400">High Risk Cases:</span>
              <span className="font-bold text-red-400 text-sm">{selectedNode.highRiskCount}</span>
            </div>

            <div className="bg-abyss/80 border border-edge/80 p-3 rounded-lg flex items-center justify-between">
              <span className="text-slate-400">Repeat Offenders:</span>
              <span className="font-bold text-amber-400 text-sm">{selectedNode.repeatOffenderCount}</span>
            </div>

            <div className="bg-abyss/80 border border-edge/80 p-3 rounded-lg flex items-center justify-between">
              <span className="text-slate-400">Avg Arrests/Case:</span>
              <span className="font-bold text-emerald-400 text-sm">{selectedNode.avgArrestCount}</span>
            </div>
          </div>
        )}

        {/* CRIME MAJOR HEAD DETAILS */}
        {selectedNode.type === 'CrimeMajor' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="bg-abyss/80 border border-edge/80 p-3 rounded-lg flex items-center justify-between">
              <span className="text-slate-400">Category Cases:</span>
              <span className="font-bold text-purple-400 text-sm">{selectedNode.totalCases}</span>
            </div>

            <div className="bg-abyss/80 border border-edge/80 p-3 rounded-lg flex items-center justify-between">
              <span className="text-slate-400">% of District Cases:</span>
              <span className="font-bold text-neon-bright text-sm">{selectedNode.districtPercentage}</span>
            </div>

            {selectedNode.majorHeadName && (
              <div className="bg-abyss/80 border border-edge/80 p-3 rounded-lg">
                <span className="text-slate-500 block mb-1">Major Classification:</span>
                <span className="font-semibold text-slate-200">{selectedNode.majorHeadName}</span>
              </div>
            )}
          </div>
        )}

        {/* CRIME MINOR HEAD DETAILS */}
        {selectedNode.type === 'CrimeMinor' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="bg-abyss/80 border border-edge/80 p-3 rounded-lg flex items-center justify-between">
              <span className="text-slate-400">Subtype Total:</span>
              <span className="font-bold text-orange-400 text-sm">{selectedNode.totalCases}</span>
            </div>

            {selectedNode.majorHeadName && (
              <div className="bg-abyss/80 border border-edge/80 p-3 rounded-lg">
                <span className="text-slate-500 block mb-1">Parent Category:</span>
                <span className="font-semibold text-purple-400">{selectedNode.majorHeadName}</span>
              </div>
            )}
          </div>
        )}

        {/* CASE STATUS DETAILS */}
        {selectedNode.type === 'CaseStatus' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="bg-abyss/80 border border-edge/80 p-3 rounded-lg flex items-center justify-between">
              <span className="text-slate-400">Status Count:</span>
              <span className="font-bold text-emerald-400 text-sm">{selectedNode.caseCount}</span>
            </div>

            <div className="bg-abyss/80 border border-edge/80 p-3 rounded-lg">
              <span className="text-slate-500 block mb-1">Investigation Phase:</span>
              <span className="font-semibold text-emerald-300">{selectedNode.statusName}</span>
            </div>
          </div>
        )}

        {/* CASE NODE DETAILS */}
        {selectedNode.type === 'Case' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="bg-abyss/80 border border-edge/80 p-3 rounded-lg space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>FIR Number:</span>
                <span className="text-slate-200 font-bold">{selectedNode.crimeNo}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Date Registered:</span>
                <span className="text-slate-200">{selectedNode.regDate}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Coordinates:</span>
                <span className="text-slate-200">
                  {selectedNode.latitude?.toFixed(4)}, {selectedNode.longitude?.toFixed(4)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-abyss/80 border border-edge/80 p-2 rounded-lg">
                <div className="text-[10px] text-slate-500">Victims</div>
                <div className="text-sm font-bold text-slate-200">{selectedNode.victimCount}</div>
              </div>
              <div className="bg-abyss/80 border border-edge/80 p-2 rounded-lg">
                <div className="text-[10px] text-slate-500">Accused</div>
                <div className="text-sm font-bold text-slate-200">{selectedNode.accusedCount}</div>
              </div>
              <div className="bg-abyss/80 border border-edge/80 p-2 rounded-lg">
                <div className="text-[10px] text-slate-500">Arrests</div>
                <div className="text-sm font-bold text-emerald-400">{selectedNode.arrestCount}</div>
              </div>
            </div>

            <div className="bg-abyss/80 border border-edge/80 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> High Risk Case:
                </span>
                <span
                  className={`font-bold ${
                    selectedNode.highRisk ? 'text-red-400' : 'text-slate-500'
                  }`}
                >
                  {selectedNode.highRisk ? 'YES' : 'NO'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-edge/40">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Repeat Offender:
                </span>
                <span
                  className={`font-bold ${
                    selectedNode.repeatOffender ? 'text-amber-400' : 'text-slate-500'
                  }`}
                >
                  {selectedNode.repeatOffender ? 'YES' : 'NO'}
                </span>
              </div>
            </div>

            {selectedNode.complainantAge && selectedNode.complainantAge > 0 && (
              <div className="bg-abyss/80 border border-edge/80 p-3 rounded-lg flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" /> Complainant Info:
                </span>
                <span className="text-slate-200 font-semibold">
                  {selectedNode.complainantAge} yrs ({selectedNode.complainantGender})
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Parent Hierarchy Navigation Link */}
      {parentNode && (
        <div className="mt-4 pt-3 border-t border-edge">
          <p className="text-[10px] font-mono text-slate-500 uppercase mb-1.5">Connected Parent Node</p>
          <button
            onClick={() => onSelectNode(parentNode)}
            className="w-full flex items-center justify-between p-2.5 rounded-lg bg-abyss hover:bg-slate-800 border border-edge text-xs font-mono text-slate-300 transition-colors text-left"
          >
            <span className="truncate">{parentNode.label}</span>
            <ArrowRight className="w-3.5 h-3.5 text-neon-bright shrink-0 ml-2" />
          </button>
        </div>
      )}
    </div>
  );
};
