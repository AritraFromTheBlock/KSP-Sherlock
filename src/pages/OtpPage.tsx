import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert, Loader2, ArrowRight, Smartphone, RefreshCw, Key } from 'lucide-react'
import AnimatedBackground from '../components/AnimatedBackground'
import { useAuth } from '../context/AuthContext'

export default function VerifyPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [localLoading, setLocalLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [resendCooldown, setResendCooldown] = useState(30)
  const [isResending, setIsResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  
  const navigate = useNavigate()
  const { verify2FA } = useAuth()

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setErrorMsg('')

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/[^0-9]/g, '')
    if (pastedData) {
      const newOtp = [...otp]
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i]
      }
      setOtp(newOtp)
      if (pastedData.length === 6) {
        inputRefs.current[5]?.focus()
      } else {
        inputRefs.current[pastedData.length]?.focus()
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length !== 6) {
      setErrorMsg('Please enter a 6-digit OTP code.')
      return
    }

    setLocalLoading(true)
    setErrorMsg('')

    const success = await verify2FA(code)
    
    setLocalLoading(false)
    if (success) {
      navigate('/dashboard', { replace: true })
    } else {
      setErrorMsg('Invalid access code. Please try again.')
    }
  }

  const handleResend = () => {
    if (resendCooldown > 0) return
    setIsResending(true)
    
    // Simulate sending SMS
    setTimeout(() => {
      setIsResending(false)
      setResendCooldown(30)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    }, 1500)
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-10 font-body bg-void">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-20 w-full max-w-md rounded-2xl border border-neon/30 bg-panel/80 p-8 shadow-neon-lg backdrop-blur-xl"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neon/10 border border-neon/30 mb-4">
            <Key className="h-8 w-8 text-neon-bright" />
          </div>
          <h2 className="text-xl font-display font-bold text-slate-200 uppercase tracking-widest">
            Two-Factor Auth
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Enter the 6-digit secure code sent to your registered mobile device to access the terminal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center font-mono text-2xl font-bold bg-abyss/80 border border-edge rounded-lg text-neon outline-none focus:border-neon focus:shadow-neon-sm transition-all"
              />
            ))}
          </div>

          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 flex items-center gap-2 text-xs text-red-400"
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={localLoading}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-neon-dim via-neon to-neon-bright py-3 font-display text-sm font-semibold uppercase tracking-widest text-slate-900 shadow-neon-md transition-shadow disabled:opacity-70"
          >
            {localLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>Verify & Authenticate <ArrowRight className="h-4 w-4" /></>
            )}
          </motion.button>
        </form>

        <div className="mt-6 flex flex-col items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || isResending}
            className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-slate-400 hover:text-neon-bright transition-colors disabled:opacity-50 disabled:hover:text-slate-400"
          >
            {isResending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
            {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend Code'}
          </button>
          
          <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
            <Smartphone className="w-3 h-3" /> Secure Verification Gateway
          </div>
        </div>
      </motion.div>
    </div>
  )
}
