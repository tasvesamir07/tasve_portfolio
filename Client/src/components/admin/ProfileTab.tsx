'use client'

import { Save, Loader } from 'lucide-react'

interface ProfileData {
  name: string; title: string; intro: string; description: string
  email: string; location: string; github: string; linkedin: string
  twitter: string; codepen: string; bio_paragraphs: string; tech_list: string
  avatar: string
}

interface Props {
  profile: ProfileData
  saving: boolean
  onChange: (profile: ProfileData) => void
  onSave: () => void
}

const inputClass = "w-full px-3 py-2 bg-[#0f121d] border border-white/5 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
const textareaClass = "w-full px-3 py-2 bg-[#0f121d] border border-white/5 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 resize-none transition-colors"
const btnPrimary = "flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-white"

const fieldLabels: Record<string, string> = {
  name: 'Full Name',
  title: 'Professional Title',
  intro: 'Intro Salutation (e.g. Hello World, I\'m)',
  description: 'Hero Tagline',
  email: 'Contact Email',
  location: 'Location',
  github: 'GitHub URL',
  linkedin: 'LinkedIn URL',
  twitter: 'Twitter URL',
  codepen: 'CodePen URL'
}

export default function ProfileTab({ profile, saving, onChange, onSave }: Props) {
  const set = (field: string, value: string) => onChange({ ...profile, [field]: value })

  const fields = ['name', 'title', 'intro', 'description', 'email', 'location', 'github', 'linkedin', 'twitter', 'codepen']

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(f => (
          <div key={f} className={f === 'description' ? 'md:col-span-2' : ''}>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block font-mono">
              {fieldLabels[f] || f}
            </label>
            {f === 'description' ? (
              <textarea value={(profile as any)[f] || ''} onChange={e => set(f, e.target.value)}
                className={textareaClass} rows={4} placeholder="Describe yourself in one short sentence..." />
            ) : (
              <input value={(profile as any)[f] || ''} onChange={e => set(f, e.target.value)}
                className={inputClass} placeholder={`Enter ${fieldLabels[f] || f}`} />
            )}
          </div>
        ))}
      </div>
      <div className="mt-2">
        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block font-mono">Bio Paragraphs (separate with newlines)</label>
        <textarea value={profile.bio_paragraphs || ''} onChange={e => set('bio_paragraphs', e.target.value)}
          className={textareaClass} rows={6} placeholder="Write your full bio (supports multiple paragraphs separated by newlines)..." />
      </div>
      <div>
        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block font-mono">Tech List (comma separated)</label>
        <input value={profile.tech_list || ''} onChange={e => set('tech_list', e.target.value)}
          className={inputClass} placeholder="e.g. React, Next.js, Node.js, Python" />
      </div>
      <button onClick={onSave} disabled={saving} className={btnPrimary + " self-start mt-2"}>
        {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Profile
      </button>
    </div>
  )
}
