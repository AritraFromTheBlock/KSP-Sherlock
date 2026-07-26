import { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PendingAuthRoute } from './components/PendingAuthRoute'
import DashboardLayout from './components/layout/DashboardLayout'

// Eager load critical initial routes
import AuthPage from './components/LoginPage' // Using existing LoginPage component as AuthPage
import LandingPage from './pages/LandingPage'
import VerifyPage from './pages/OtpPage' // Using existing OtpPage component as VerifyPage

// Lazy load dashboard pages
const DashboardHome = lazy(() => import('./pages/DashboardHome'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const FIRSearch = lazy(() => import('./pages/FIRSearch'));
const CriminalNetwork = lazy(() => import('./pages/CriminalNetwork'));
const CrimeHeatmap = lazy(() => import('./pages/CrimeHeatmap'));
const CrimeAnalytics = lazy(() => import('./pages/CrimeAnalytics'));
const OffenderProfiling = lazy(() => import('./pages/OffenderProfiling'));
const CaseSummaries = lazy(() => import('./pages/CaseSummaries'));
const SimilarCases = lazy(() => import('./pages/SimilarCases'));
const EarlyWarning = lazy(() => import('./pages/EarlyWarning'));
const Reports = lazy(() => import('./pages/Reports'));
const ConversationHistory = lazy(() => import('./pages/ConversationHistory'));
const Administration = lazy(() => import('./pages/Administration'));
const Profile = lazy(() => import('./pages/Profile'));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center h-full w-full min-h-[50vh]">
    <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 1. Public Landing Route */}
          <Route path="/" element={<LandingPage />} />

          {/* 2. Public Auth Route (Sign In / Sign Up) */}
          <Route path="/auth" element={<AuthPage />} />

          {/* 3. Pending Auth (2FA Verification) Route */}
          <Route 
            path="/verify" 
            element={
              <PendingAuthRoute>
                <VerifyPage />
              </PendingAuthRoute>
            } 
          />

          {/* 4. Fully Protected Dashboard Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={
              <Suspense fallback={<PageLoader />}>
                <DashboardHome />
              </Suspense>
            } />
            <Route path="ai-assistant" element={
              <Suspense fallback={<PageLoader />}>
                <AIAssistant />
              </Suspense>
            } />
            <Route path="fir-search" element={
              <Suspense fallback={<PageLoader />}>
                <FIRSearch />
              </Suspense>
            } />
            <Route path="criminal-network" element={
              <Suspense fallback={<PageLoader />}>
                <CriminalNetwork />
              </Suspense>
            } />
            <Route path="crime-heatmap" element={
              <Suspense fallback={<PageLoader />}>
                <CrimeHeatmap />
              </Suspense>
            } />
            <Route path="crime-analytics" element={
              <Suspense fallback={<PageLoader />}>
                <CrimeAnalytics />
              </Suspense>
            } />
            <Route path="offender-profiling" element={
              <Suspense fallback={<PageLoader />}>
                <OffenderProfiling />
              </Suspense>
            } />
            <Route path="case-summaries" element={
              <Suspense fallback={<PageLoader />}>
                <CaseSummaries />
              </Suspense>
            } />
            <Route path="similar-cases" element={
              <Suspense fallback={<PageLoader />}>
                <SimilarCases />
              </Suspense>
            } />
            <Route path="early-warning" element={
              <Suspense fallback={<PageLoader />}>
                <EarlyWarning />
              </Suspense>
            } />
            <Route path="reports" element={
              <Suspense fallback={<PageLoader />}>
                <Reports />
              </Suspense>
            } />
            <Route path="conversation-history" element={
              <Suspense fallback={<PageLoader />}>
                <ConversationHistory />
              </Suspense>
            } />
            <Route path="administration" element={
              <Suspense fallback={<PageLoader />}>
                <Administration />
              </Suspense>
            } />
            <Route path="profile" element={
              <Suspense fallback={<PageLoader />}>
                <Profile />
              </Suspense>
            } />
          </Route>

          {/* Fallback for unmatched routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
