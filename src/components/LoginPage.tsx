import { useState, FormEvent, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
// @ts-ignore: framer-motion has no declaration file in this project
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye,
  EyeOff,
  ShieldCheck,
  ChevronDown,
  Lock,
  User,
  Loader2,
  ScanLine,
  ArrowLeft,
} from 'lucide-react'
import AnimatedBackground from './AnimatedBackground'
import { useAuth } from '../context/AuthContext'

type Role = 'Investigator' | 'Analyst' | 'Supervisor' | 'Admin'
const ROLES: Role[] = ['Investigator', 'Analyst', 'Supervisor', 'Admin']

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, loginWithGoogle, loginWithEmail, signupWithEmail, loading: authLoading, error: authError, clearError } = useAuth()

  const [officerId, setOfficerId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<Role | ''>('')
  const [roleOpen, setRoleOpen] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [localError, setLocalError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [fullName, setFullName] = useState('')

  const searchParams = new URLSearchParams(location.search)
  const initialMode = searchParams.get('mode')
  const [isSignUp, setIsSignUp] = useState(initialMode !== 'signin')

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setIsSignUp(params.get('mode') !== 'signin')
  }, [location.search])

  const from = (location.state as any)?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (currentUser) {
      navigate(from, { replace: true })
    }
  }, [currentUser, navigate, from])

  const handleGoogleLogin = async () => {
    setLocalError('')
    clearError()
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      // Navigation is handled by useEffect when currentUser changes
    } catch (err: any) {
      setLocalError(err.message || 'Google sign-in failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault()
    setLocalError('')
    setSuccessMessage('')
    clearError()

    if (!officerId || !password || !role) {
      setLocalError('All credentials fields are required.')
      return
    }

    try {
      if (isSignUp) {
        if (!fullName) {
          setLocalError('Full Name is required for registration.')
          return
        }
        await signupWithEmail(officerId, password, fullName)
        setSuccessMessage('Account created successfully. Please sign in.')
        setPassword('')
        setFullName('')
        navigate('/auth?mode=signin', { replace: true })
      } else {
        await loginWithEmail(officerId, password)
      }
    } catch (err: any) {
      setLocalError(err.message || 'Authentication failed.')
    }
  }

  const displayError = localError || authError

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-10 font-body">
      <AnimatedBackground />

      <Link
        to="/"
        className="absolute left-4 top-4 z-50 flex items-center gap-2 rounded-lg border border-neon/30 bg-panel/40 px-4 py-2 font-mono text-xs uppercase tracking-wider text-slate-300 backdrop-blur-md transition-all hover:border-neon hover:bg-neon/10 hover:text-neon-bright sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header: badge + branding */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 flex flex-col items-center text-center"
        >
          <img src="https://raw.githubusercontent.com/AritraFromTheBlock/KSP-Sherlock/main/public/ksp-logo.svg" alt="Karnataka State Police" className="h-24 w-auto drop-shadow-md mb-2" />
          <div className="mt-2 flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-wide text-slate-200">
              KSP <span className="text-neon-bright">SHERLOCK</span>
            </h1>
          </div>
          <p className="mt-1 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">
            <ScanLine className="h-3 w-3 text-neon-glow" />
            Karnataka State Police &middot; AI Crime Analytics
          </p>
        </motion.div>

        {/* Glassmorphism card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative z-20 rounded-2xl border border-neon/20 bg-panel/60 p-7 shadow-neon-lg backdrop-blur-xl sm:p-8"
        >
          {/* Corner accents for an instrument-panel feel */}
          <span className="absolute left-3 top-3 h-3 w-3 border-l-2 border-t-2 border-neon-glow/60" />
          <span className="absolute right-3 top-3 h-3 w-3 border-r-2 border-t-2 border-neon-glow/60" />
          <span className="absolute bottom-3 left-3 h-3 w-3 border-b-2 border-l-2 border-neon-glow/60" />
          <span className="absolute bottom-3 right-3 h-3 w-3 border-b-2 border-r-2 border-neon-glow/60" />

          <div className="mb-6 flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
              {isSignUp ? 'Officer Registration Terminal' : 'Secure Access Terminal'}
            </span>
            <span className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] ${isSignUp ? 'border-amber-500/30 bg-amber-500/10 text-amber-500' : 'border-neon/30 bg-neon/10 text-neon-bright'}`}>
              <span className={`h-1.5 w-1.5 animate-pulseGlow rounded-full ${isSignUp ? 'bg-amber-500' : 'bg-neon-glow'}`} />
              {isSignUp ? 'REGISTER' : 'ENCRYPTED'}
            </span>
          </div>

          {/* Mode Toggle Segmented Control */}
          <div className="mb-6 flex rounded-lg border border-edge bg-abyss p-1">
            <button
              type="button"
              onClick={() => {
                navigate('/auth?mode=signin', { replace: true })
                setLocalError('')
                setSuccessMessage('')
              }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2 font-mono text-xs uppercase tracking-widest transition-all ${
                !isSignUp
                  ? 'bg-neon/10 text-neon-bright shadow-neon-sm border border-neon/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <User className="h-3.5 w-3.5" /> SIGN IN
            </button>
            <button
              type="button"
              onClick={() => {
                navigate('/auth?mode=signup', { replace: true })
                setLocalError('')
                setSuccessMessage('')
              }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2 font-mono text-xs uppercase tracking-widest transition-all ${
                isSignUp
                  ? 'bg-amber-500/10 text-amber-500 shadow-neon-sm border border-amber-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <User className="h-3.5 w-3.5" /> SIGN UP / REGISTER
            </button>
          </div>

          {/* Primary Authentication Option: Google Sign-In */}
          <div className="mb-6">
            <motion.button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || authLoading}
                whileHover={{ scale: googleLoading ? 1 : 1.015 }}
                whileTap={{ scale: googleLoading ? 1 : 0.985 }}
                className="relative flex w-full items-center justify-center gap-3 rounded-lg border border-slate-700 bg-slate-900/90 py-3 px-4 font-mono text-xs font-semibold uppercase tracking-wider text-slate-100 shadow-md hover:border-neon/40 hover:bg-slate-800 transition-all disabled:opacity-75"
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-neon-bright" />
                    <span>Authenticating with Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{isSignUp ? 'Sign up with Google' : 'Sign in with Google'}</span>
                  </>
                )}
              </motion.button>
          </div>

          <div className="my-6 flex items-center justify-center gap-4">
            <div className="h-px flex-1 bg-slate-700/60" />
            <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              OR OFFICER CREDENTIALS
            </div>
            <div className="h-px flex-1 bg-slate-700/60" />
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-5">
              {isSignUp && (
                <div>
                  <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-slate-400">
                    Full Name & Designation
                  </label>
                  <div className="group relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-neon-bright" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Inspector R. Sharma"
                      className="w-full rounded-lg border border-edge bg-abyss/80 py-2.5 pl-10 pr-3 font-mono text-sm text-slate-200 outline-none transition-all placeholder:text-slate-600 focus:border-neon focus:shadow-neon-sm"
                    />
                  </div>
                </div>
              )}

              {/* Officer ID */}
              <div>
                <label
                  htmlFor="officerId"
                  className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-slate-400"
                >
                  Officer Email
                </label>
              <div className="group relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-neon-bright" />
                <input
                  id="officerId"
                  type="text"
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  placeholder="KSP-XXXXX or officer@ksp.gov.in"
                  autoComplete="username"
                  className="w-full rounded-lg border border-edge bg-abyss/80 py-2.5 pl-10 pr-3 font-mono text-sm text-slate-200 outline-none transition-all placeholder:text-slate-600 focus:border-neon focus:shadow-neon-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block font-mono text-[11px] uppercase tracking-wider text-slate-400"
                >
                  Password
                </label>
                <button
                  type="button"
                  className="font-mono text-[11px] text-neon-bright/80 transition-colors hover:text-neon-bright hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="group relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-neon-bright" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-edge bg-abyss/80 py-2.5 pl-10 pr-10 font-mono text-sm text-slate-200 outline-none transition-all placeholder:text-slate-600 focus:border-neon focus:shadow-neon-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 transition-colors hover:text-neon-bright"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Role dropdown */}
            <div className="relative z-50">
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-slate-400">
                Role
              </label>
              <button
                type="button"
                onClick={() => setRoleOpen((v) => !v)}
                className={`flex w-full items-center justify-between rounded-lg border bg-slate-900 py-2.5 px-3 text-left text-sm transition-all ${
                  roleOpen ? 'border-neon shadow-neon-sm' : 'border-edge'
                } ${role ? 'text-slate-200' : 'text-slate-600'}`}
              >
                {role || 'Select role'}
                <ChevronDown
                  className={`h-4 w-4 text-slate-500 transition-transform ${roleOpen ? 'rotate-180 text-neon-bright' : ''}`}
                />
              </button>

              <AnimatePresence>
                {roleOpen && (
                  <motion.ul
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-[100] mt-1.5 w-full overflow-hidden rounded-lg border border-neon/30 bg-slate-900 shadow-neon-md backdrop-blur-xl"
                  >
                    {ROLES.map((r) => (
                      <li key={r}>
                        <button
                          type="button"
                          onClick={() => {
                            setRole(r)
                            setRoleOpen(false)
                          }}
                          className="flex w-full items-center px-3 py-2.5 text-left text-sm text-slate-300 transition-colors hover:bg-neon/10 hover:text-neon-bright bg-slate-900"
                        >
                          {r}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Remember me */}
            <label className="flex cursor-pointer items-center gap-2.5 select-none">
              <span
                onClick={() => setRememberMe((v) => !v)}
                className={`flex h-4 w-4 items-center justify-center rounded border transition-all ${
                  rememberMe ? 'border-neon bg-neon shadow-neon-sm' : 'border-edge bg-abyss/80'
                }`}
              >
                {rememberMe && (
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 fill-none stroke-abyss stroke-[2.5]">
                    <path d="M2 6.5L4.5 9L10 3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                Remember this terminal
              </span>
            </label>

            {/* Success message */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 p-3 font-mono text-xs text-green-400"
                >
                  {successMessage}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error message */}
            <AnimatePresence>
              {displayError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 font-mono text-xs text-red-400"
                >
                  {displayError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password Login submit */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-neon-dim via-neon to-neon-bright py-3 font-display text-sm font-semibold uppercase tracking-widest text-slate-900 shadow-neon-md transition-shadow"
            >
              <ShieldCheck className="h-4 w-4" />
              {isSignUp ? 'Create Officer Account' : 'Officer ID Login'}
            </motion.button>
            
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setLocalError('')
                  setSuccessMessage('')
                }}
                className="font-mono text-[11px] text-slate-400 transition-colors hover:text-neon-bright"
              >
                {isSignUp
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Sign Up"}
              </button>
            </div>
          </form>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-5 text-center font-mono text-[10px] uppercase tracking-widest text-slate-600"
        >
          Unauthorized access is a criminal offence &middot; All activity is logged
        </motion.p>
      </motion.div>
    </div>
  )
}
