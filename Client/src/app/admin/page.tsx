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

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [skills, setSkills] = useState<SkillData[]>([])
  const [experiences, setExperiences] = useState<ExperienceData[]>([])

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

  const handleLogout = async () => {
    document.cookie = 'admin_token=; path=/; max-age=0'
    router.push('/admin/login')
  }

  const saveProfile = async () => {
    setSaving(true)
    await fetch('/api/admin/profile', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile),
    })
    setSaving(false)
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
  }

  const addProject = async () => {
    const newP = { title: 'New Project', category: 'frontend', tag: '', desc: '', tags: '', github: '', live: '', image: '', sort_order: projects.length }
    const res = await fetch('/api/admin/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newP) })
    const saved = await res.json()
    setProjects([...projects, saved])
  }

  const deleteProject = async (id: number) => {
    await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
    setProjects(projects.filter(p => p.id !== id))
  }

  const saveSkills = async () => {
    setSaving(true)
    await Promise.all(skills.filter(s => s.id).map(s =>
      fetch(`/api/admin/skills/${s.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) })
    ))
    setSaving(false)
  }

  const addSkill = async () => {
    const newS = { category: 'New Category', name: 'New Skill', value: 50, sort_order: skills.length }
    const res = await fetch('/api/admin/skills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newS) })
    const saved = await res.json()
    setSkills([...skills, saved])
  }

  const deleteSkill = async (id: number) => {
    await fetch(`/api/admin/skills/${id}`, { method: 'DELETE' })
    setSkills(skills.filter(s => s.id !== id))
  }

  const saveExperiences = async () => {
    setSaving(true)
    await Promise.all(experiences.filter(e => e.id).map(e =>
      fetch(`/api/admin/experiences/${e.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(e) })
    ))
    setSaving(false)
  }

  const addExperience = async () => {
    const newE = { date: '2026', title: 'New Role', company: 'Company', desc: 'Description', sort_order: experiences.length }
    const res = await fetch('/api/admin/experiences', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newE) })
    const saved = await res.json()
    setExperiences([...experiences, saved])
  }

  const deleteExperience = async (id: number) => {
    await fetch(`/api/admin/experiences/${id}`, { method: 'DELETE' })
    setExperiences(experiences.filter(e => e.id !== id))
  }

  if (!authed) return null

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">Portfolio Admin</h1>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 px-6">
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
                  <label className="text-xs text-gray-500 uppercase mb-1 block">{f}</label>
                  {f === 'description' ? (
                    <textarea value={(profile as any)[f]} onChange={e => setProfile({ ...profile, [f]: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500/50 h-24 resize-none" />
                  ) : (
                    <input value={(profile as any)[f]} onChange={e => setProfile({ ...profile, [f]: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500/50" />
                  )}
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase mb-1 block">Bio Paragraphs (separate with \n)</label>
              <textarea value={profile.bio_paragraphs} onChange={e => setProfile({ ...profile, bio_paragraphs: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500/50 h-32 resize-none" />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase mb-1 block">Tech List (comma separated)</label>
              <input value={profile.tech_list} onChange={e => setProfile({ ...profile, tech_list: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500/50" />
            </div>
            <button onClick={saveProfile} disabled={saving}
              className="self-start flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Profile
            </button>
          </div>
        )}

        {tab === 'projects' && (
          <div className="flex flex-col gap-6">
            <button onClick={addProject} className="self-start flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Add Project
            </button>
            {projects.length === 0 && <p className="text-gray-500 text-sm">No projects yet.</p>}
            {projects.map((p, idx) => (
              <div key={p.id || idx} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-gray-600" />
                  <input value={p.title} onChange={e => { const u = [...projects]; u[idx] = { ...u[idx], title: e.target.value }; setProjects(u) }}
                    className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-cyan-500/50" placeholder="Title" />
                  <input value={p.category} onChange={e => { const u = [...projects]; u[idx] = { ...u[idx], category: e.target.value }; setProjects(u) }}
                    className="w-28 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-cyan-500/50" placeholder="Category" />
                  <button onClick={() => p.id && deleteProject(p.id)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <textarea value={p.desc} onChange={e => { const u = [...projects]; u[idx] = { ...u[idx], desc: e.target.value }; setProjects(u) }}
                  className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-cyan-500/50 h-16 resize-none" placeholder="Description" />
                <div className="flex gap-2">
                  <input value={p.tags} onChange={e => { const u = [...projects]; u[idx] = { ...u[idx], tags: e.target.value }; setProjects(u) }}
                    className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-cyan-500/50" placeholder="Tags (comma separated)" />
                  <input value={p.github} onChange={e => { const u = [...projects]; u[idx] = { ...u[idx], github: e.target.value }; setProjects(u) }}
                    className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-cyan-500/50" placeholder="GitHub URL" />
                  <input value={p.live} onChange={e => { const u = [...projects]; u[idx] = { ...u[idx], live: e.target.value }; setProjects(u) }}
                    className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-cyan-500/50" placeholder="Live URL" />
                </div>
                <div className="flex items-center gap-3">
                  {p.image && <img src={p.image} alt="" className="w-12 h-12 object-cover rounded-lg" />}
                  <label className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-400 cursor-pointer hover:border-cyan-500/50 transition-colors">
                    <Image className="w-4 h-4" /> {p.image ? 'Change Image' : 'Upload Image'}
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleProjectImage(idx, e.target.files[0])} />
                  </label>
                  {p.image && <input value={p.image} onChange={e => { const u = [...projects]; u[idx] = { ...u[idx], image: e.target.value }; setProjects(u) }}
                    className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-cyan-500/50" placeholder="Or paste image URL" />}
                </div>
              </div>
            ))}
            <button onClick={saveProjects} disabled={saving}
              className="self-start flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save All Projects
            </button>
          </div>
        )}

        {tab === 'skills' && (
          <div className="flex flex-col gap-6">
            <button onClick={addSkill} className="self-start flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Add Skill
            </button>
            {skills.length === 0 && <p className="text-gray-500 text-sm">No skills yet.</p>}
            {skills.map((s, idx) => (
              <div key={s.id || idx} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-gray-600 shrink-0" />
                <input value={s.category} onChange={e => { const u = [...skills]; u[idx] = { ...u[idx], category: e.target.value }; setSkills(u) }}
                  className="w-44 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-cyan-500/50" placeholder="Category" />
                <input value={s.name} onChange={e => { const u = [...skills]; u[idx] = { ...u[idx], name: e.target.value }; setSkills(u) }}
                  className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-cyan-500/50" placeholder="Skill name" />
                <div className="flex items-center gap-2">
                  <input type="range" min={0} max={100} value={s.value} onChange={e => { const u = [...skills]; u[idx] = { ...u[idx], value: +e.target.value }; setSkills(u) }}
                    className="w-24" />
                  <span className="text-sm text-gray-400 w-8">{s.value}%</span>
                </div>
                <button onClick={() => s.id && deleteSkill(s.id)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button onClick={saveSkills} disabled={saving}
              className="self-start flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save All Skills
            </button>
          </div>
        )}

        {tab === 'experiences' && (
          <div className="flex flex-col gap-6">
            <button onClick={addExperience} className="self-start flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Add Experience
            </button>
            {experiences.length === 0 && <p className="text-gray-500 text-sm">No experiences yet.</p>}
            {experiences.map((e, idx) => (
              <div key={e.id || idx} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-gray-600" />
                  <input value={e.date} onChange={ev => { const u = [...experiences]; u[idx] = { ...u[idx], date: ev.target.value }; setExperiences(u) }}
                    className="w-36 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-cyan-500/50" placeholder="Date" />
                  <input value={e.title} onChange={ev => { const u = [...experiences]; u[idx] = { ...u[idx], title: ev.target.value }; setExperiences(u) }}
                    className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-cyan-500/50" placeholder="Title" />
                  <input value={e.company} onChange={ev => { const u = [...experiences]; u[idx] = { ...u[idx], company: ev.target.value }; setExperiences(u) }}
                    className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-cyan-500/50" placeholder="Company" />
                  <button onClick={() => e.id && deleteExperience(e.id)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <textarea value={e.desc} onChange={ev => { const u = [...experiences]; u[idx] = { ...u[idx], desc: ev.target.value }; setExperiences(u) }}
                  className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-cyan-500/50 h-16 resize-none" placeholder="Description" />
              </div>
            ))}
            <button onClick={saveExperiences} disabled={saving}
              className="self-start flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save All Experiences
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
