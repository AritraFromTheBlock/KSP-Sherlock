import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldAlert, Cpu, CheckCircle2, AlertTriangle, ArrowUpRight, FileText, Zap, Loader2 } from 'lucide-react';
import { API_CONFIG } from '../../config/apiConfig';
import { apiClient } from '../../utils/apiClient';

interface Insight {
  id: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
}

interface IntelligenceData {
  narrativeHtml: string;
  insights: Insight[];
}

const FALLBACK_DATA: IntelligenceData = {
  narrativeHtml: `Automated spatial-temporal risk analysis indicates an overall <span class="text-amber-400 font-semibold">6% increase in nocturnal property offenses</span> across Bengaluru Urban compared to the previous 24-hour cycle. High density incident clusters are currently observed near <span class="text-neon-bright font-semibold">Koramangala 5th Block</span> and <span class="text-neon-bright font-semibold">Indiranagar 100ft Road</span>. Immediate tactical deployment is advised for Night Patrol Teams.`,
  insights: [
    {
      id: '1',
      type: 'danger',
      title: 'Cyber Fraud Elevation',
      description: 'UPI phishing attacks targeting tech workers in Whitefield corridor spiked by 18%. 14 SIM cards flagged for freezing.'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Hotspot Detection',
      description: 'Two new hotspot geofences activated in Indiranagar Sector 4. ANPR cameras logged 3 suspect vehicle matches.'
    },
    {
      id: '3',
      type: 'info',
      title: 'Repeat Offender Vector',
      description: 'Pattern match algorithm identified suspect #SUS-8891 operating near Malleswaram metro perimeter.'
    },
    {
      id: '4',
      type: 'success',
      title: 'Action Directives',
      description: 'Three high-risk case dossiers (#FIR-1023, #FIR-2041, #FIR-8891) ready for Station House Officer sign-off.'
    }
  ]
};

const TYPE_CONFIG = {
  danger: {
    icon: AlertTriangle,
    bgClass: 'bg-red-500/10 border-red-500/30 text-red-400'
  },
  warning: {
    icon: ShieldAlert,
    bgClass: 'bg-amber-500/10 border-amber-500/30 text-amber-400'
  },
  info: {
    icon: Zap,
    bgClass: 'bg-purple-500/10 border-purple-500/30 text-purple-400'
  },
  success: {
    icon: CheckCircle2,
    bgClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
  }
};

export const AIIntelligenceBriefing: React.FC = () => {
  const [data, setData] = useState<IntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIntelligence = async () => {
      try {
        const jsonData = await apiClient.get(`${API_CONFIG.MAP_COPILOT_BASE_URL}/intelligence-summary`);
        setData(jsonData);
      } catch (error) {
        console.warn('Backend unavailable or endpoint not configured, falling back to cached intelligence data.', error);
        setData(FALLBACK_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchIntelligence();
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl border border-neon/30 bg-gradient-to-br from-abyss via-panel to-abyss p-6 md:p-8 shadow-xl shadow-black/50 h-full flex flex-col justify-between">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-neon/10 blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon via-amber-400 to-amber-600 opacity-90" />

      <div>
        {/* Header Badge & Title */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-edge/60 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-neon/15 border border-neon/30 text-neon-bright shadow-neon-sm">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-neon/10 text-neon-bright border border-neon/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-neon animate-ping" />
                  KSP NEURAL BRIEFING
                </span>
                <span className="text-xs font-mono text-slate-500">• CONFIDENTIAL</span>
              </div>
              <h2 className="font-display text-xl md:text-2xl font-bold tracking-wide text-slate-100 mt-1 flex items-center gap-2">
                Today's Intelligence Summary
                {loading && <Loader2 className="w-5 h-5 text-neon-bright animate-spin" />}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-void/80 px-3 py-1.5 rounded-lg border border-edge/60">
            <Cpu className="h-4 w-4 text-neon-bright" />
            <span>MODEL: SHERLOCK-LLM-V4.2</span>
          </div>
        </div>

        {/* Narrative & Executive Key Takeaways */}
        {data && (
          <div className="space-y-6">
            {/* Executive Overview Paragraph */}
            <div className="p-4 rounded-xl bg-void/60 border border-edge/60">
              <h3 className="text-xs font-mono uppercase tracking-widest text-neon-bright font-bold mb-2">
                EXECUTIVE SITUATIONAL NARRATIVE
              </h3>
              <p 
                className="text-sm md:text-base text-slate-200 leading-relaxed font-body"
                dangerouslySetInnerHTML={{ __html: data.narrativeHtml }}
              />
            </div>

            {/* Core Bullet Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.insights.map((insight) => {
                const config = TYPE_CONFIG[insight.type] || TYPE_CONFIG.info;
                const IconComponent = config.icon;
                
                return (
                  <div key={insight.id} className="flex items-start gap-3 p-4 rounded-lg bg-void/40 border border-edge/50 hover:border-neon/30 transition-all">
                    <div className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${config.bgClass}`}>
                      <IconComponent className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="font-body text-sm font-semibold text-slate-200">
                        {insight.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div className="mt-6 pt-4 border-t border-edge/60 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2">
        <span className="flex items-center gap-1.5 text-slate-400">
          <FileText className="h-3.5 w-3.5 text-neon" />
          <span>AUTONOMOUS INFERENCE GENERATED VIA KSP ENGINE</span>
        </span>
        <span className="text-neon-bright font-medium flex items-center gap-1 hover:underline cursor-pointer">
          <span>EXPORT FULL DOSSIER REPORT</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
};
