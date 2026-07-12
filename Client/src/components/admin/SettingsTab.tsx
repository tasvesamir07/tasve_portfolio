'use client'

import { useState, useEffect } from 'react'
import { Save, Loader, Key, ShieldCheck, Eye, EyeOff, Mail } from 'lucide-react'

const inputClass = "w-full px-3 py-2 bg-[#0f121d] border border-white/5 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"

export default function SettingsTab({ showToast }: { showToast: (msg: string) => void }) {
  const [adminInfo, setAdminInfo] = useState<{ username: string; display_name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/auth')
      .then(r => r.json())
      .then(d => {
        if (d.authenticated) {
          const info = { username: d.username || 'admin', display_name: d.display_name || 'Admin', email: d.email || '' }
          setAdminInfo(info)
          setDisplayName(info.display_name)
          setEmail(info.email)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    setError('')
    const res = await fetch('/api/admin/auth/update-admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name: displayName, email }),
    })
    setSavingProfile(false)
    if (res.ok) {
      showToast('Settings saved')
      setAdminInfo(prev => prev ? { ...prev, display_name: displayName, email } : prev)
    } else {
      setError('Failed to save settings')
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSavingPassword(true)
    const res = await fetch('/api/admin/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    setSavingPassword(false)

    if (res.ok) {
      showToast('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to change password')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader className="w-6 h-6 text-cyan-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Admin Info & Email */}
      <div className="bg-[#0f121d]/60 border border-white/5 rounded-xl p-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-cyan-400" /> Admin Account
        </h3>
        <div className="flex flex-col gap-2 text-sm mb-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-mono text-xs">Username:</span>
            <span className="text-white font-semibold">{adminInfo?.username || 'admin'}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 max-w-md">
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block font-mono">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className={inputClass}
              placeholder="Admin display name"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block font-mono flex items-center gap-1">
              <Mail className="w-3 h-3 text-cyan-400" /> Email (for OTP password reset)
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={inputClass}
              placeholder="admin@example.com"
            />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button onClick={handleSaveProfile} disabled={savingProfile}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-white self-start">
            {savingProfile ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-[#0f121d]/60 border border-white/5 rounded-xl p-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Key className="w-4 h-4 text-purple-400" /> Change Password
        </h3>

        <form onSubmit={handleChangePassword} className="flex flex-col gap-4 max-w-md">
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block font-mono">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className={inputClass + ' pr-10'}
                placeholder="Enter current password"
                required
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block font-mono">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className={inputClass + ' pr-10'}
                placeholder="Enter new password (min 6 chars)"
                required
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block font-mono">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className={inputClass + ' pr-10'}
                placeholder="Confirm new password"
                required
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-white self-start">
            {savingPassword ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {savingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
