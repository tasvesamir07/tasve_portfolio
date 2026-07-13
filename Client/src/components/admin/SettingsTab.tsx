'use client'

import { useState, useEffect } from 'react'
import {
  Save,
  Loader,
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  Mail,
  Image as ImageIcon,
  RefreshCw,
  CheckCircle,
} from 'lucide-react'
import { toast } from 'sonner'

const inputClass =
  'w-full px-3 py-2 bg-[#0f121d] border border-white/5 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors'

export default function SettingsTab() {
  const [adminInfo, setAdminInfo] = useState<{
    username: string
    display_name: string
    email: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [botToken, setBotToken] = useState('')
  const [botUsername, setBotUsername] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')

  // WebP Optimizer states
  const [quality, setQuality] = useState(80)
  const [scanning, setScanning] = useState(false)
  const [converting, setConverting] = useState(false)
  const [legacyImages, setLegacyImages] = useState<
    { table: string; id?: number; field: string; url: string; title: string }[]
  >([])
  const [status, setStatus] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/auth').then((r) => r.json()).catch(() => ({})),
      fetch('/api/admin/profile').then((r) => r.json()).catch(() => ({}))
    ]).then(([authData, profileData]) => {
      if (authData.authenticated) {
        const info = {
          username: authData.username || 'admin',
          display_name: authData.display_name || 'Admin',
          email: authData.email || '',
        }
        setAdminInfo(info)
        setDisplayName(info.display_name)
        setEmail(info.email)
      }
      if (profileData) {
        setPhone(profileData.phone || '')
        setBotToken(profileData.telegram_bot_token || '')
        setBotUsername(profileData.telegram_bot_username || '')
      }
    }).catch((err) => {
      console.error('Settings load error:', err)
    }).finally(() => {
      setLoading(false)
    })
  }, [])

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    setError('')
    try {
      // 1. Update admin account info
      const authRes = await fetch('/api/admin/auth/update-admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: displayName, email }),
      })
      if (!authRes.ok) throw new Error('Failed to update admin account settings')

      // 2. Fetch current profile to prevent data loss, merge and update phone and bot tokens
      const profileGetRes = await fetch('/api/admin/profile')
      if (!profileGetRes.ok) throw new Error('Failed to retrieve profile data')
      const profileData = await profileGetRes.json()

      const profilePutRes = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profileData,
          phone: phone,
          telegram_bot_token: botToken,
          telegram_bot_username: botUsername,
        }),
      })
      if (!profilePutRes.ok) {
        const errJson = await profilePutRes.json().catch(() => ({}))
        const errorMsg = errJson.error ? JSON.stringify(errJson.error) : 'Failed to update profile settings'
        throw new Error(errorMsg)
      }

      toast('Settings saved successfully')
      setAdminInfo((prev) => (prev ? { ...prev, display_name: displayName, email } : prev))
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to save settings')
      toast('Failed to save settings')
    } finally {
      setSavingProfile(false)
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
      toast('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to change password')
    }
  }

  const scanImages = async () => {
    setScanning(true)
    setStatus('Scanning database for legacy images...')
    try {
      const found: typeof legacyImages = []

      // 1. Scan Profile
      const profRes = await fetch('/api/admin/profile')
      if (profRes.ok) {
        const d = await profRes.json()
        if (d.avatar && !d.avatar.endsWith('.webp') && d.avatar.startsWith('http')) {
          found.push({ table: 'profile', field: 'avatar', url: d.avatar, title: 'Profile Avatar' })
        }
      }

      // 2. Scan Projects
      const projRes = await fetch('/api/admin/projects')
      if (projRes.ok) {
        const list = await projRes.json()
        list.forEach((p: { id?: number; title: string; image: string }) => {
          if (p.image && !p.image.endsWith('.webp') && p.image.startsWith('http')) {
            found.push({
              table: 'projects',
              id: p.id,
              field: 'image',
              url: p.image,
              title: `Project: ${p.title}`,
            })
          }
        })
      }

      // 3. Scan Certifications
      const certRes = await fetch('/api/admin/certifications')
      if (certRes.ok) {
        const list = await certRes.json()
        list.forEach((c: { id?: number; title: string; image: string }) => {
          if (c.image && !c.image.endsWith('.webp') && c.image.startsWith('http')) {
            found.push({
              table: 'certifications',
              id: c.id,
              field: 'image',
              url: c.image,
              title: `Certification: ${c.title}`,
            })
          }
        })
      }

      // 4. Scan Gallery
      const galRes = await fetch('/api/admin/gallery')
      if (galRes.ok) {
        const list = await galRes.json()
        list.forEach((g: { id?: number; title: string; image: string }) => {
          if (g.image && !g.image.endsWith('.webp') && g.image.startsWith('http')) {
            found.push({
              table: 'gallery',
              id: g.id,
              field: 'image',
              url: g.image,
              title: `Gallery Item: ${g.title}`,
            })
          }
        })
      }

      setLegacyImages(found)
      if (found.length === 0) {
        setStatus(
          'Scan completed. No legacy images found! Everything is already optimized in WebP.',
        )
      } else {
        setStatus(
          `Scan completed. Found ${found.length} legacy images that can be converted to WebP.`,
        )
      }
    } catch (err) {
      console.error(err)
      setStatus('Scan failed. Please make sure database tables exist.')
    } finally {
      setScanning(false)
    }
  }

  const convertImages = async () => {
    setConverting(true)
    const { compressAndConvertToWebp } = await import('@/lib/image')
    let successCount = 0

    for (let i = 0; i < legacyImages.length; i++) {
      const item = legacyImages[i]
      setStatus(
        (prev) => prev + `\n\n[${i + 1}/${legacyImages.length}] Fetching image: "${item.title}"...`,
      )

      try {
        // Fetch image as blob
        const res = await fetch(item.url)
        if (!res.ok) throw new Error('Fetch failed')
        const blob = await res.blob()

        // Create file
        const filename = item.url.split('/').pop() || 'image.png'
        const file = new File([blob], filename, { type: blob.type })

        // Compress
        setStatus((prev) => prev + `\nConverting and compressing to WebP at ${quality}% quality...`)
        const webpFile = await compressAndConvertToWebp(file, quality / 100)

        // Upload
        const fd = new FormData()
        fd.append('file', webpFile)
        const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        if (!uploadRes.ok) throw new Error('Upload failed')
        const { url: webpUrl } = await uploadRes.json()

        // Update database row
        setStatus((prev) => prev + `\nUploading new WebP image and updating database record...`)
        if (item.table === 'profile') {
          const currentProfRes = await fetch('/api/admin/profile')
          if (currentProfRes.ok) {
            const currentProf = await currentProfRes.json()
            const updateRes = await fetch('/api/admin/profile', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...currentProf, avatar: webpUrl }),
            })
            if (!updateRes.ok) throw new Error('Failed to update profile record')
          }
        } else {
          const updateRes = await fetch(`/api/admin/${item.table}/${item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [item.field]: webpUrl }),
          })
          if (!updateRes.ok) {
            const errText = await updateRes.text()
            throw new Error(`Update failed: ${errText}`)
          }
        }

        successCount++
        setStatus((prev) => prev + `\nSuccess! Updated database link.`)
      } catch (err: unknown) {
        console.error(err)
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setStatus((prev) => prev + `\nError: Failed to convert: ${msg}`)
      }
    }

    setLegacyImages([])
    setStatus(
      (prev) =>
        prev +
        `\n\n🎉 Migration completed! Successfully converted ${successCount} image(s) to WebP.`,
    )
    toast('Database images migrated successfully')
    setConverting(false)
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
              onChange={(e) => setDisplayName(e.target.value)}
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
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block font-mono">
              Admin Phone (for Telegram Bot Auth)
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
              placeholder="+8801XXXXXXXXX"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block font-mono">
              Telegram Bot Token
            </label>
            <input
              type="password"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              className={inputClass}
              placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block font-mono">
              Telegram Bot Username (without @)
            </label>
            <input
              type="text"
              value={botUsername}
              onChange={(e) => setBotUsername(e.target.value)}
              className={inputClass}
              placeholder="MyPortfolioBot"
            />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-white self-start"
          >
            {savingProfile ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
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
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass + ' pr-10'}
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
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
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass + ' pr-10'}
                placeholder="Enter new password (min 6 chars)"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
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
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass + ' pr-10'}
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-white self-start"
          >
            {savingPassword ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {savingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* WebP Image Optimizer */}
      <div className="bg-[#0f121d]/60 border border-white/5 rounded-xl p-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
          <ImageIcon className="w-4 h-4 text-emerald-400" /> WebP Image Optimizer
        </h3>
        <p className="text-xs text-gray-500 mb-6">
          Scan and batch-convert legacy PNG/JPG images in your database to optimized WebP formats.
        </p>

        <div className="flex flex-col gap-6 max-w-xl">
          {/* Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono">
                Compression Quality
              </label>
              <span className="text-sm font-bold font-mono text-cyan-400">{quality}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={quality}
              onChange={(e) => setQuality(+e.target.value)}
              className="w-full accent-cyan-500 h-1.5 bg-white/5 rounded-full cursor-pointer"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={scanImages}
              disabled={scanning || converting}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-colors cursor-pointer"
            >
              {scanning ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Scan Legacy Images
            </button>
            {legacyImages.length > 0 && (
              <button
                onClick={convertImages}
                disabled={converting}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer"
              >
                {converting ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Convert {legacyImages.length} Image{legacyImages.length > 1 ? 's' : ''} to WebP
              </button>
            )}
          </div>

          {/* Status Message / Progress */}
          {status && (
            <div className="p-4 rounded-lg bg-black/35 border border-white/5 text-xs text-gray-400 font-mono leading-relaxed whitespace-pre-wrap">
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
