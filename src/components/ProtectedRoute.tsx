import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ShieldCheck } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();
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
              Verifying Security Credentials
            </p>
            <p className="text-xs text-slate-500 mt-1">Authenticating terminal session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isOtpVerified = sessionStorage.getItem('otpVerified') === 'true';
  if (!isOtpVerified) {
    return <Navigate to="/otp" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
