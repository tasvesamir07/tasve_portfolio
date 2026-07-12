'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Save, Plus, Trash2, LogOut, Upload, Image, Loader, GripVertical,
} from 'lucide-react'

type Tab = 'profile' | 'projects' | 'skills' | 'experiences'

interface ProfileData {
  name: string; title: string; intro: string; description: string
  email: string; location: string; github: string; linkedin: string
  twitter: string; codepen: string; bio_paragraphs: string; tech_list: string
  avatar: string
}

interface ProjectData {
  id?: number; title: string; category: string; tag: string; desc: string
  tags: string; github: string; live: string; image: string; sort_order: number
}

interface SkillData {
  id?: number; category: string; name: string; value: number; sort_order: number
}

interface ExperienceData {
  id?: number; date: string; title: string; company: string; desc: string; sort_order: number
}

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('profile')
  const [authed, setAuthed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [skills, setSkills] = useState<SkillData[]>([])
  const [experiences, setExperiences] = useState<ExperienceData[]>([])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  useEffect(() => {
    fetch('/api/admin/auth').then(r => r.json()).then(d => {
      if (!d.authenticated) router.push('/admin/login')
      else setAuthed(true)
    })
  }, [router])

  useEffect(() => {
    if (!authed) return
    fetch('/api/admin/profile').then(r => r.json()).then(setProfile)
    fetch('/api/admin/projects').then(r => r.json()).then(setProjects)
    fetch('/api/admin/skills').then(r => r.json()).then(setSkills)
    fetch('/api/admin/experiences').then(r => r.json()).then(setExperiences)
  }, [authed])

  const handleLogout = () => {
    document.cookie = 'admin_token=; path=/; max-age=0'
    router.push('/admin/login')
  }

  const saveProfile = async () => {
    setSaving(true)
    const res = await fetch('/api/admin/profile', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile),
    })
    setSaving(false)
    if (res.ok) showToast('Profile saved')
    else showToast('Failed to save profile')
  }

  const handleProjectImage = async (idx: number, file: File) => {
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const { url } = await res.json()
    const updated = [...projects]; updated[idx] = { ...updated[idx], image: url }; setProjects(updated)
  }

  const saveProjects = async () => {
    setSaving(true)
    await Promise.all(projects.filter(p => p.id).map(p =>
      fetch(`/api/admin/projects/${p.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) })
    ))
    setSaving(false)
    showToast('Projects saved')
  }

  const addProject = async () => {
    const newP = { title: 'New Project', category: 'frontend', tag: '', desc: '', tags: '', github: '', live: '', image: '', sort_order: projects.length }
    const res = await fetch('/api/admin/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newP) })
    const saved = await res.json()
    setProjects([...projects, saved])
    showToast('Project added')
  }

  const deleteProject = async (id: number) => {
    await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
    setProjects(projects.filter(p => p.id !== id))
    showToast('Project deleted')
  }

  const saveSkills = async () => {
    setSaving(true)
    await Promise.all(skills.filter(s => s.id).map(s =>
      fetch(`/api/admin/skills/${s.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) })
    ))
    setSaving(false)
    showToast('Skills saved')
  }

  const addSkill = async () => {
    const newS = { category: 'New Category', name: 'New Skill', value: 50, sort_order: skills.length }
    const res = await fetch('/api/admin/skills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newS) })
    const saved = await res.json()
    setSkills([...skills, saved])
    showToast('Skill added')
  }

  const deleteSkill = async (id: number) => {
    await fetch(`/api/admin/skills/${id}`, { method: 'DELETE' })
    setSkills(skills.filter(s => s.id !== id))
    showToast('Skill deleted')
  }

  const saveExperiences = async () => {
    setSaving(true)
    await Promise.all(experiences.filter(e => e.id).map(e =>
      fetch(`/api/admin/experiences/${e.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(e) })
    ))
    setSaving(false)
    showToast('Experiences saved')
  }

  const addExperience = async () => {
    const newE = { date: '2026', title: 'New Role', company: 'Company', desc: 'Description', sort_order: experiences.length }
    const res = await fetch('/api/admin/experiences', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newE) })
    const saved = await res.json()
    setExperiences([...experiences, saved])
    showToast('Experience added')
  }

  const deleteExperience = async (id: number) => {
    await fetch(`/api/admin/experiences/${id}`, { method: 'DELETE' })
    setExperiences(experiences.filter(e => e.id !== id))
    showToast('Experience deleted')
  }

  if (!authed) return null

  const inputClass = "w-full px-3 py-2 bg-[#0f121d] border border-white/5 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
  const textareaClass = "w-full px-3 py-2 bg-[#0f121d] border border-white/5 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 resize-none transition-colors"
  const cardClass = "bg-[#0f121d]/60 backdrop-blur border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors"
  const btnPrimary = "flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-white"
  const btnDanger = "p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"

  return (
    <div className="min-h-screen bg-[#07090e]">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm backdrop-blur animate-fade-in">
          {toast}
        </div>
      )}

      <header className="sticky top-0 z-40 bg-[#0f121d]/80 backdrop-blur-xl border-b border-white/5 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 font-bold text-lg">&lt;</span>
          <h1 className="text-lg font-bold text-white">Admin</h1>
          <span className="text-cyan-400 font-bold text-lg">/&gt;</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </header>

      <div className="flex border-b border-white/5 px-6 bg-[#0f121d]/40">
        {(['profile', 'projects', 'skills', 'experiences'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
              tab === t ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {t === 'profile' ? 'Profile' : t === 'projects' ? 'Projects' : t === 'skills' ? 'Skills' : 'Experience'}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        {tab === 'profile' && profile && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              {['name', 'title', 'intro', 'description', 'email', 'location', 'github', 'linkedin', 'twitter', 'codepen'].map(f => (
                <div key={f} className={f === 'description' ? 'col-span-2' : ''}>
                  <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block font-mono">{f}</label>
                  {f === 'description' ? (
                    <textarea value={(profile as any)[f] || ''} onChange={e => setProfile({ ...profile, [f]: e.target.value })}
                      className={textareaClass} rows={4} />
                  ) : (
                    <input value={(profile as any)[f] || ''} onChange={e => setProfile({ ...profile, [f]: e.target.value })}
                      className={inputClass} />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2">
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block font-mono">Bio Paragraphs (separate with newlines)</label>
              <textarea value={profile.bio_paragraphs || ''} onChange={e => setProfile({ ...profile, bio_paragraphs: e.target.value })}
                className={textareaClass} rows={6} />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block font-mono">Tech List (comma separated)</label>
              <input value={profile.tech_list || ''} onChange={e => setProfile({ ...profile, tech_list: e.target.value })}
                className={inputClass} />
            </div>
            <button onClick={saveProfile} disabled={saving} className={btnPrimary}>
              {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Profile
            </button>
          </div>
        )}

        {tab === 'projects' && (
          <div className="flex flex-col gap-6">
            <button onClick={addProject} className={btnPrimary + " self-start"}>
              <Plus className="w-4 h-4" /> Add Project
            </button>
            {projects.length === 0 && <p className="text-gray-500 text-sm">No projects yet.</p>}
            {projects.map((p, idx) => (
              <div key={p.id || idx} className={cardClass + " flex flex-col gap-3"}>
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-gray-600 shrink-0" />
                  <input value={p.title} onChange={e => { const u = [...projects]; u[idx] = { ...u[idx], title: e.target.value }; setProjects(u) }}
                    className={inputClass} placeholder="Title" />
                  <input value={p.category} onChange={e => { const u = [...projects]; u[idx] = { ...u[idx], category: e.target.value }; setProjects(u) }}
                    className={inputClass + " w-28 shrink-0"} placeholder="Category" />
                  <input value={p.tag} onChange={e => { const u = [...projects]; u[idx] = { ...u[idx], tag: e.target.value }; setProjects(u) }}
                    className={inputClass + " w-28 shrink-0"} placeholder="Tag" />
                  <button onClick={() => p.id && deleteProject(p.id)} className={btnDanger}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <textarea value={p.desc} onChange={e => { const u = [...projects]; u[idx] = { ...u[idx], desc: e.target.value }; setProjects(u) }}
                  className={textareaClass} rows={3} placeholder="Description" />
                <div className="flex gap-2">
                  <input value={p.tags} onChange={e => { const u = [...projects]; u[idx] = { ...u[idx], tags: e.target.value }; setProjects(u) }}
                    className={inputClass} placeholder="Tags (comma separated)" />
                  <input value={p.github} onChange={e => { const u = [...projects]; u[idx] = { ...u[idx], github: e.target.value }; setProjects(u) }}
                    className={inputClass} placeholder="GitHub URL" />
                  <input value={p.live} onChange={e => { const u = [...projects]; u[idx] = { ...u[idx], live: e.target.value }; setProjects(u) }}
                    className={inputClass} placeholder="Live URL" />
                </div>
                <div className="flex items-center gap-3">
                  {p.image && <img src={p.image} alt="" className="w-12 h-12 object-cover rounded-lg border border-white/5" />}
                  <label className="flex items-center gap-2 px-3 py-1.5 bg-[#0f121d] border border-white/5 rounded-lg text-sm text-gray-400 cursor-pointer hover:border-cyan-500/50 transition-colors">
                    <Image className="w-4 h-4" /> {p.image ? 'Change' : 'Upload'}
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleProjectImage(idx, e.target.files[0])} />
                  </label>
                  {p.image && <input value={p.image} onChange={e => { const u = [...projects]; u[idx] = { ...u[idx], image: e.target.value }; setProjects(u) }}
                    className={inputClass} placeholder="Or paste image URL" />}
                </div>
              </div>
            ))}
            {projects.length > 0 && (
              <button onClick={saveProjects} disabled={saving} className={btnPrimary + " self-start"}>
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save All Projects
              </button>
            )}
          </div>
        )}

        {tab === 'skills' && (
          <div className="flex flex-col gap-6">
            <button onClick={addSkill} className={btnPrimary + " self-start"}>
              <Plus className="w-4 h-4" /> Add Skill
            </button>
            {skills.length === 0 && <p className="text-gray-500 text-sm">No skills yet.</p>}
            {skills.map((s, idx) => (
              <div key={s.id || idx} className={cardClass + " flex items-center gap-3"}>
                <GripVertical className="w-4 h-4 text-gray-600 shrink-0" />
                <input value={s.category} onChange={e => { const u = [...skills]; u[idx] = { ...u[idx], category: e.target.value }; setSkills(u) }}
                  className={inputClass + " w-44 shrink-0"} placeholder="Category" />
                <input value={s.name} onChange={e => { const u = [...skills]; u[idx] = { ...u[idx], name: e.target.value }; setSkills(u) }}
                  className={inputClass} placeholder="Skill name" />
                <div className="flex items-center gap-2 shrink-0">
                  <input type="range" min={0} max={100} value={s.value}
                    onChange={e => { const u = [...skills]; u[idx] = { ...u[idx], value: +e.target.value }; setSkills(u) }}
                    className="w-24 accent-cyan-500" />
                  <span className="text-sm text-gray-400 w-8 font-mono">{s.value}%</span>
                </div>
                <button onClick={() => s.id && deleteSkill(s.id)} className={btnDanger}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {skills.length > 0 && (
              <button onClick={saveSkills} disabled={saving} className={btnPrimary + " self-start"}>
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save All Skills
              </button>
            )}
          </div>
        )}

        {tab === 'experiences' && (
          <div className="flex flex-col gap-6">
            <button onClick={addExperience} className={btnPrimary + " self-start"}>
              <Plus className="w-4 h-4" /> Add Experience
            </button>
            {experiences.length === 0 && <p className="text-gray-500 text-sm">No experiences yet.</p>}
            {experiences.map((e, idx) => (
              <div key={e.id || idx} className={cardClass + " flex flex-col gap-3"}>
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-gray-600 shrink-0" />
                  <input value={e.date} onChange={ev => { const u = [...experiences]; u[idx] = { ...u[idx], date: ev.target.value }; setExperiences(u) }}
                    className={inputClass + " w-36 shrink-0"} placeholder="Date (e.g. 2024 - Present)" />
                  <input value={e.title} onChange={ev => { const u = [...experiences]; u[idx] = { ...u[idx], title: ev.target.value }; setExperiences(u) }}
                    className={inputClass} placeholder="Title" />
                  <input value={e.company} onChange={ev => { const u = [...experiences]; u[idx] = { ...u[idx], company: ev.target.value }; setExperiences(u) }}
                    className={inputClass} placeholder="Company" />
                  <button onClick={() => e.id && deleteExperience(e.id)} className={btnDanger}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <textarea value={e.desc} onChange={ev => { const u = [...experiences]; u[idx] = { ...u[idx], desc: ev.target.value }; setExperiences(u) }}
                  className={textareaClass} rows={3} placeholder="Description" />
              </div>
            ))}
            {experiences.length > 0 && (
              <button onClick={saveExperiences} disabled={saving} className={btnPrimary + " self-start"}>
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save All Experiences
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
