import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[SHERLOCK-CRASH] Uncaught boundary error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center rounded-xl border border-red-500/30 bg-panel/85 backdrop-blur-md max-w-2xl mx-auto my-12 shadow-lg">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 border border-red-500/30 text-red-400 mb-6 animate-pulse">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <h2 className="font-display text-xl font-bold tracking-wide text-slate-100">
            {this.props.fallbackTitle || 'Intelligence Console Exception'}
          </h2>

          <p className="mt-2.5 font-body text-xs text-slate-400 leading-relaxed max-w-md">
            The SHERLOCK UI thread encountered an unexpected exception. Rest of the command system remains unaffected.
          </p>

          {this.state.error && (
            <div className="mt-4 px-4 py-2.5 bg-void/80 border border-edge/80 rounded-lg text-left text-[11px] font-mono text-red-400 max-w-md overflow-x-auto">
              Code: {this.state.error.message || 'Unknown Execution Error'}
            </div>
          )}

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-1.5 px-4 py-2 bg-neon/15 text-neon-bright border border-neon/30 hover:bg-neon hover:text-void rounded-lg font-mono text-xs font-bold transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>RESTART CONSOLE</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 mt-6 font-mono text-[9px] text-slate-500 uppercase tracking-wider">
            <ShieldAlert className="h-3.5 w-3.5 text-slate-600" />
            <span>KSP CRITICAL SYSTEM SHIELD</span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
