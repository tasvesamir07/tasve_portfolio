'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Lock,
  User,
  ArrowLeft,
  Shield,
  Eye,
  EyeOff,
  Loader,
  KeyRound,
  CheckCircle,
} from 'lucide-react'

interface LoginPageProps {
  onSuccess: () => void
}

export default function LoginPage({ onSuccess }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'forgot'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const passwordRef = useRef<HTMLInputElement>(null)

  // Forgot password - step 1: username
  const [resetStep, setResetStep] = useState<'username' | 'otp' | 'password'>('username')
  const [resetUsername, setResetUsername] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmNew, setShowConfirmNew] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    if (res.ok) {
      onSuccess()
    } else {
      const data = await res.json()
      setError(data.error || 'Invalid credentials')
      setLoading(false)
    }
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const res = await fetch('/api/admin/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: resetUsername }),
    })
    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      setResetStep('otp')
      setSuccess(data.message || 'OTP sent to your registered email.')
    } else {
      setError(data.error || 'Failed to send OTP')
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const res = await fetch('/api/admin/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: resetUsername, otp, newPassword }),
    })
    setLoading(false)

    if (res.ok) {
      setSuccess('Password reset successfully!')
      setTimeout(() => {
        setMode('login')
        setResetStep('username')
        setUsername(resetUsername)
        setPassword(newPassword)
        setOtp('')
        setNewPassword('')
        setConfirmNewPassword('')
        setResetUsername('')
        setSuccess('')
      }, 2000)
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to reset password')
    }
  }

  const resetFlow = () => {
    setMode('login')
    setResetStep('username')
    setError('')
    setSuccess('')
    setResetUsername('')
    setOtp('')
    setNewPassword('')
    setConfirmNewPassword('')
  }

  // Forgot password view
  if (mode === 'forgot') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07090e] p-6">
        <div className="w-full max-w-sm bg-[#0f121d]/60 backdrop-blur border border-white/5 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-purple-400/5 border border-purple-400/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Reset Password</h1>
              <p className="text-xs text-gray-500 font-mono">
                {resetStep === 'username' && 'Enter your username or email'}
                {resetStep === 'otp' && 'Check your email for OTP'}
                {resetStep === 'password' && 'Choose a new password'}
              </p>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-6">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                resetStep === 'username'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              1
            </div>
            <div className="h-px flex-1 bg-white/10" />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                resetStep === 'otp'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : ['password'].includes(resetStep)
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 text-gray-600 border border-white/10'
              }`}
            >
              2
            </div>
            <div className="h-px flex-1 bg-white/10" />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                resetStep === 'password'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-white/5 text-gray-600 border border-white/10'
              }`}
            >
              3
            </div>
          </div>

          {/* Step 1: Username */}
          {resetStep === 'username' && (
            <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="text"
                  value={resetUsername}
                  onChange={(e) => setResetUsername(e.target.value)}
                  placeholder="Username or Email"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0f121d] border border-white/5 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  autoFocus
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              {success && <p className="text-emerald-400 text-sm">{success}</p>}
              <button
                type="submit"
                disabled={loading || !resetUsername}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {loading ? 'Verifying...' : 'Verify Username'}
              </button>
              <button
                type="button"
                onClick={resetFlow}
                className="text-xs text-gray-500 hover:text-cyan-400 font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3 h-3" /> Back to Login
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {resetStep === 'otp' && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setResetStep('password')
              }}
              className="flex flex-col gap-4"
            >
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0f121d] border border-white/5 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors text-center text-lg tracking-[8px] font-mono"
                  autoFocus
                  maxLength={6}
                  inputMode="numeric"
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              {success && <p className="text-emerald-400 text-sm">{success}</p>}
              <button
                type="submit"
                disabled={otp.length !== 6}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" /> Verify OTP
              </button>
              <button
                type="button"
                onClick={() => {
                  setResetStep('username')
                  setError('')
                  setSuccess('')
                }}
                className="text-xs text-gray-500 hover:text-cyan-400 font-semibold transition-colors"
              >
                ← Change email or resend
              </button>
            </form>
          )}

          {/* Step 3: New Password */}
          {resetStep === 'password' && (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password (min 6 chars)"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#0f121d] border border-white/5 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type={showConfirmNew ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#0f121d] border border-white/5 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNew(!showConfirmNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showConfirmNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              {success && <p className="text-emerald-400 text-sm">{success}</p>}
              <button
                type="submit"
                disabled={loading || !newPassword || !confirmNewPassword}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Shield className="w-4 h-4" />
                )}
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07090e] p-6">
      <div className="w-full max-w-sm bg-[#0f121d]/60 backdrop-blur border border-white/5 rounded-xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-cyan-400/5 border border-cyan-400/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Admin Login</h1>
            <p className="text-xs text-gray-500 font-mono">Enter your credentials</p>
          </div>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username or Email"
              className="w-full pl-10 pr-4 py-2.5 bg-[#0f121d] border border-white/5 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (!password) {
                    e.preventDefault()
                    passwordRef.current?.focus()
                  }
                }
              }}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              ref={passwordRef}
              className="w-full pl-10 pr-10 py-2.5 bg-[#0f121d] border border-white/5 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <ArrowRight className="w-4 h-4" />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('forgot')
              setError('')
            }}
            className="text-xs text-gray-500 hover:text-cyan-400 font-semibold transition-colors text-center mt-2"
          >
            Forgot your password?
          </button>
        </form>
        <div className="mt-6 text-center border-t border-white/5 pt-4">
          <Link
            href="/"
            className="text-xs text-gray-500 hover:text-cyan-400 font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            ← Back to Portfolio
          </Link>
        </div>
      </div>
    </div>
  )
}
