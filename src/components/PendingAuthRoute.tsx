import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ShieldCheck } from 'lucide-react';

interface PendingAuthRouteProps {
  children: React.ReactNode;
}

export const PendingAuthRoute: React.FC<PendingAuthRouteProps> = ({ children }) => {
  const { isAuthenticated, isPendingAuth, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-abyss text-slate-200">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-neon/20 bg-panel/60 p-8 shadow-neon-lg backdrop-blur-xl">
          <div className="relative">
            <ShieldCheck className="h-12 w-12 text-neon-bright animate-pulse" />
            <Loader2 className="absolute -bottom-1 -right-1 h-5 w-5 animate-spin text-neon-glow" />
          </div>
          <div className="text-center font-mono">
            <p className="text-sm font-semibold tracking-wider text-slate-200 uppercase">
              Verifying Session State
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If already fully authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  // If they are pending auth (Firebase logged in, but no OTP), let them view this page
  if (isPendingAuth) {
    return <>{children}</>;
  }

  // If they aren't logged in at all, kick them out to /auth
  return <Navigate to="/auth" state={{ from: location }} replace />;
};

export default PendingAuthRoute;
