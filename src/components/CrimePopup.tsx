import React from 'react';
import { MLHotspot } from '../services/hotspotService';
import { ShieldAlert, Compass, Globe, Sparkles } from 'lucide-react';

interface CrimePopupProps {
  location: MLHotspot;
}

export const CrimePopup: React.FC<CrimePopupProps> = ({ location }) => {
  const getRiskColorClass = (risk: MLHotspot['risk_level']) => {
    switch (risk) {
      case 'High': return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'Medium': return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
      case 'Low':
      default:
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    }
  };

  return (
    <div className="p-2.5 min-w-[210px] max-w-[270px] font-sans text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-2 mb-3">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-slate-500 block">
            Crime Hotspot
          </span>
          <h3 className="font-display font-bold text-sm text-slate-100 mt-0.5">
            Hotspot Information
          </h3>
        </div>
        <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded border ${getRiskColorClass(location.risk_level)}`}>
          {location.risk_level} Risk
        </span>
      </div>

      {/* Details List */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded border border-slate-800/80">
          <span className="text-slate-400 flex items-center gap-1.5 font-mono text-[10px] uppercase">
            <Sparkles className="w-3.5 h-3.5 text-neon" />
            Risk Score
          </span>
          <span className="font-mono font-bold text-slate-200">
            {location.risk_score.toFixed(4)}
          </span>
        </div>

        <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded border border-slate-800/80">
          <span className="text-slate-400 flex items-center gap-1.5 font-mono text-[10px] uppercase">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
            Cluster ID
          </span>
          <span className="font-mono font-bold text-slate-200">C-{location.cluster}</span>
        </div>

        <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded border border-slate-800/80">
          <span className="text-slate-400 flex items-center gap-1.5 font-mono text-[10px] uppercase">
            <Compass className="w-3.5 h-3.5 text-slate-500" />
            Latitude
          </span>
          <span className="font-mono text-slate-200">{location.latitude}</span>
        </div>

        <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded border border-slate-800/80">
          <span className="text-slate-400 flex items-center gap-1.5 font-mono text-[10px] uppercase">
            <Compass className="w-3.5 h-3.5 text-slate-500" />
            Longitude
          </span>
          <span className="font-mono text-slate-200">{location.longitude}</span>
        </div>

        <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded border border-slate-800/80">
          <span className="text-slate-400 flex items-center gap-1.5 font-mono text-[10px] uppercase">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            Coordinates
          </span>
          <span className="font-mono text-[10px] text-slate-400">
            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </span>
        </div>
      </div>

      {/* Alert badge */}
      <div className="mt-3 flex items-center gap-1.5 text-[9px] font-mono text-slate-500 justify-center">
        <ShieldAlert className="w-3.5 h-3.5 text-neon" />
        <span>KSP SPATIAL ML INTEL</span>
      </div>
    </div>
  );
};

export default CrimePopup;
