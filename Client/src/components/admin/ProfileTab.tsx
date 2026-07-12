'use client'

import { Save, Loader, Upload, User } from 'lucide-react'
import { compressAndConvertToWebp } from '@/lib/image'

interface ProfileData {
  name: string
  title: string
  intro: string
  description: string
  email: string
  location: string
  github: string
  linkedin: string
  twitter: string
  codepen: string
  bio_paragraphs: string
  tech_list: string
  avatar: string
  resume_url: string
}

interface Props {
  profile: ProfileData
  saving: boolean
  onChange: (profile: ProfileData) => void
  onSave: () => void
}

const inputClass =
  'w-full px-3 py-2 bg-[#0f121d] border border-white/5 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors'
const textareaClass =
  'w-full px-3 py-2 bg-[#0f121d] border border-white/5 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 resize-none transition-colors'
const btnPrimary =
  'flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-white'

const fieldLabels: Record<string, string> = {
  name: 'Full Name',
  title: 'Professional Title',
  intro: "Intro Salutation (e.g. Hello World, I'm)",
  description: 'Hero Tagline',
  email: 'Contact Email',
  location: 'Location',
  github: 'GitHub URL',
  linkedin: 'LinkedIn URL',
  twitter: 'Twitter URL',
  codepen: 'CodePen URL',
}

export default function ProfileTab({ profile, saving, onChange, onSave }: Props) {
  const set = (field: keyof ProfileData, value: string) => onChange({ ...profile, [field]: value })

  const handleAvatarUpload = async (file: File) => {
    try {
      const compressedFile = await compressAndConvertToWebp(file)
      const fd = new FormData()
      fd.append('file', compressedFile)
      
      let uploadUrl = '/api/admin/upload'
      if (profile.avatar) {
        uploadUrl += `?oldUrl=${encodeURIComponent(profile.avatar)}`
      }
      
      const res = await fetch(uploadUrl, { method: 'POST', body: fd })
      if (res.ok) {
        const { url } = await res.json()
        onChange({ ...profile, avatar: url })
      }
    } catch (err) {
      console.error('Avatar upload failed:', err)
    }
  }

  const fields: (keyof ProfileData)[] = [
    'name',
    'title',
    'intro',
    'description',
    'email',
    'location',
    'github',
    'linkedin',
    'twitter',
    'codepen',
  ]

  return (
    <div className="flex flex-col gap-6">
      <button onClick={onSave} disabled={saving} className={btnPrimary + ' self-start mb-2'}>
        {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
        Profile
      </button>

      {/* Avatar Section */}
      <div className="bg-[#0f121d]/60 border border-white/5 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-6 shadow-xl shadow-black/10">
        <div className="relative w-24 h-24 rounded-full border-2 border-white/10 overflow-hidden bg-black/30 shrink-0 flex items-center justify-center shadow-lg shadow-black/20">
          {profile.avatar ? (
            <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="w-10 h-10 text-gray-600" />
          )}
        </div>
        <div className="flex-grow w-full flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">Profile Photo</h3>
            <p className="text-xs text-gray-500">
              Upload a professional headshot or paste an image URL.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0f121d] border border-white/5 rounded-lg text-sm text-gray-400 cursor-pointer hover:border-cyan-500/50 transition-colors shrink-0">
              <Upload className="w-4 h-4" /> Upload Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])}
              />
            </label>
            <input
              value={profile.avatar || ''}
              onChange={(e) => set('avatar', e.target.value)}
              className={inputClass}
              placeholder="Or paste image URL https://..."
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f} className={f === 'description' ? 'md:col-span-2' : ''}>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block font-mono">
              {fieldLabels[f] || f}
            </label>
            {f === 'description' ? (
              <textarea
                value={profile[f] || ''}
                onChange={(e) => set(f, e.target.value)}
                className={textareaClass}
                rows={4}
                placeholder="Describe yourself in one short sentence..."
              />
            ) : (
              <input
                value={profile[f] || ''}
                onChange={(e) => set(f, e.target.value)}
                className={inputClass}
                placeholder={`Enter ${fieldLabels[f] || f}`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-2">
        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block font-mono">
          Bio Paragraphs (separate with newlines)
        </label>
        <textarea
          value={profile.bio_paragraphs || ''}
          onChange={(e) => set('bio_paragraphs', e.target.value)}
          className={textareaClass}
          rows={6}
          placeholder="Write your full bio (supports multiple paragraphs separated by newlines)..."
        />
      </div>
      <div>
        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block font-mono">
          Tech List (comma separated)
        </label>
        <input
          value={profile.tech_list || ''}
          onChange={(e) => set('tech_list', e.target.value)}
          className={inputClass}
          placeholder="e.g. React, Next.js, Node.js, Python"
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block font-mono">
          Resume PDF
        </label>
        <div className="flex items-center gap-3">
          <input
            value={profile.resume_url || ''}
            onChange={(e) => onChange({ ...profile, resume_url: e.target.value })}
            className={inputClass}
            placeholder="Or paste resume PDF URL"
          />
          <label className="flex items-center gap-2 px-3 py-2 bg-[#0f121d] border border-white/5 rounded-lg text-sm text-gray-400 cursor-pointer hover:border-cyan-500/50 transition-colors shrink-0">
            <Upload className="w-4 h-4" /> Upload PDF
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const fd = new FormData()
                fd.append('file', file)
                
                let uploadUrl = '/api/admin/upload'
                if (profile.resume_url) {
                  uploadUrl += `?oldUrl=${encodeURIComponent(profile.resume_url)}`
                }
                
                const res = await fetch(uploadUrl, { method: 'POST', body: fd })
                const { url } = await res.json()
                onChange({ ...profile, resume_url: url })
              }}
            />
          </label>
        </div>
      </div>
    </div>
  )
}
