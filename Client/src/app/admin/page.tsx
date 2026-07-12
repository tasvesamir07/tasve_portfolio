'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import ProfileTab from '@/components/admin/ProfileTab'
import ProjectsTab from '@/components/admin/ProjectsTab'
import SkillsTab from '@/components/admin/SkillsTab'
import ExperiencesTab from '@/components/admin/ExperiencesTab'
import MessagesTab from '@/components/admin/MessagesTab'

type Tab = 'profile' | 'projects' | 'skills' | 'experiences' | 'messages'

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

function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
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

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => {
    fetch('/api/admin/auth').then(r => r.json()).then(d => {
      if (!d.authenticated) router.push('/admin/login')
      else setAuthed(true)
    })
  }, [router])

  useEffect(() => {
    if (!authed) return
    fetch('/api/admin/profile').then(r => r.json()).then(setProfile).catch(() => { showToast('Failed to load data'); setProfile(null) })
    fetch('/api/admin/projects').then(r => r.json()).then(setProjects).catch(() => { showToast('Failed to load data'); setProjects([]) })
    fetch('/api/admin/skills').then(r => r.json()).then(setSkills).catch(() => { showToast('Failed to load data'); setSkills([]) })
    fetch('/api/admin/experiences').then(r => r.json()).then(setExperiences).catch(() => { showToast('Failed to load data'); setExperiences([]) })
  }, [authed])

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    window.location.href = '/admin/login'
  }

  const saveProfile = async () => {
    if (!profile) return
    setSaving(true)
    const res = await fetch('/api/admin/profile', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile),
    })
    setSaving(false)
    showToast(res.ok ? 'Profile saved' : 'Failed to save profile')
  }

  const handleProjectImage = async (idx: number, file: File) => {
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const { url } = await res.json()
    const updated = [...projects]; updated[idx] = { ...updated[idx], image: url }; setProjects(updated)
  }

  const saveProjects = async () => {
    setSaving(true)
    await Promise.all(
      projects.map(async (p, i) => {
        const payload = { ...p, sort_order: i }
        if (!p.id) {
          const res = await fetch('/api/admin/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
          const saved = await res.json()
          setProjects(prev => { const next = [...prev]; next[i] = { ...next[i], id: saved.id }; return next })
          return
        }
        return fetch(`/api/admin/projects/${p.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      })
    )
    setSaving(false)
    showToast('Projects saved')
  }

  const addProject = async () => {
    const newP = { title: '', category: '', tag: '', desc: '', tags: '', github: '', live: '', image: '', sort_order: projects.length }
    const res = await fetch('/api/admin/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newP) })
    if (!res.ok) { showToast('Failed to add'); return }
    const saved = await res.json()
    setProjects([...projects, saved])
    showToast('Project added')
  }

  const deleteProject = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setProjects(projects.filter(p => p.id !== id))
      showToast('Project deleted')
    } catch {
      showToast('Failed to delete project')
    }
  }

  const moveProject = (idx: number, dir: 'up' | 'down') => {
    const to = dir === 'up' ? idx - 1 : idx + 1
    if (to < 0 || to >= projects.length) return
    setProjects(moveItem(projects, idx, to))
  }

  const saveSkills = async () => {
    setSaving(true)
    await Promise.all(
      skills.map(async (s, i) => {
        const payload = { ...s, sort_order: i }
        if (!s.id) {
          const res = await fetch('/api/admin/skills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
          const saved = await res.json()
          setSkills(prev => { const next = [...prev]; next[i] = { ...next[i], id: saved.id }; return next })
          return
        }
        return fetch(`/api/admin/skills/${s.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      })
    )
    setSaving(false)
    showToast('Skills saved')
  }

  const addSkill = async () => {
    const newS = { category: '', name: '', value: 0, sort_order: skills.length }
    const res = await fetch('/api/admin/skills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newS) })
    if (!res.ok) { showToast('Failed to add'); return }
    const saved = await res.json()
    setSkills([...skills, saved])
    showToast('Skill added')
  }

  const deleteSkill = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/skills/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setSkills(skills.filter(s => s.id !== id))
      showToast('Skill deleted')
    } catch {
      showToast('Failed to delete skill')
    }
  }

  const moveSkill = (idx: number, dir: 'up' | 'down') => {
    const to = dir === 'up' ? idx - 1 : idx + 1
    if (to < 0 || to >= skills.length) return
    setSkills(moveItem(skills, idx, to))
  }

  const saveExperiences = async () => {
    setSaving(true)
    await Promise.all(
      experiences.map(async (e, i) => {
        const payload = { ...e, sort_order: i }
        if (!e.id) {
          const res = await fetch('/api/admin/experiences', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
          const saved = await res.json()
          setExperiences(prev => { const next = [...prev]; next[i] = { ...next[i], id: saved.id }; return next })
          return
        }
        return fetch(`/api/admin/experiences/${e.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      })
    )
    setSaving(false)
    showToast('Experiences saved')
  }

  const addExperience = async () => {
    const newE = { date: '', title: '', company: '', desc: '', sort_order: experiences.length }
    const res = await fetch('/api/admin/experiences', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newE) })
    if (!res.ok) { showToast('Failed to add'); return }
    const saved = await res.json()
    setExperiences([...experiences, saved])
    showToast('Experience added')
  }

  const deleteExperience = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/experiences/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setExperiences(experiences.filter(e => e.id !== id))
      showToast('Experience deleted')
    } catch {
      showToast('Failed to delete experience')
    }
  }

  const moveExperience = (idx: number, dir: 'up' | 'down') => {
    const to = dir === 'up' ? idx - 1 : idx + 1
    if (to < 0 || to >= experiences.length) return
    setExperiences(moveItem(experiences, idx, to))
  }

  if (!authed) return null

  const tabLabels: Record<Tab, string> = {
    profile: 'Profile', projects: 'Projects', skills: 'Skills',
    experiences: 'Experience', messages: 'Messages',
  }

  return (
    <div className="min-h-screen bg-[#07090e]">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm backdrop-blur animate-fade-in">
          {toast}
        </div>
      )}

      <header className="sticky top-0 z-40 bg-[#0f121d]/80 backdrop-blur-xl border-b border-white/5 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 font-bold text-lg">&lt;</span>
            <h1 className="text-lg font-bold text-white">Admin</h1>
            <span className="text-cyan-400 font-bold text-lg">/&gt;</span>
          </div>
          <a href="/" className="text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 transition-all">
            ← View Portfolio
          </a>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </header>

      <div className="flex border-b border-white/5 px-6 bg-[#0f121d]/40 overflow-x-auto">
        {(Object.keys(tabLabels) as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors shrink-0 ${
              tab === t ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {tabLabels[t]}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        {tab === 'profile' && profile && (
          <ProfileTab profile={profile} saving={saving} onChange={setProfile} onSave={saveProfile} />
        )}
        {tab === 'projects' && (
          <ProjectsTab
            projects={projects} saving={saving}
            onAdd={addProject}
            onUpdate={(idx, p) => { const u = [...projects]; u[idx] = p; setProjects(u) }}
            onDelete={deleteProject}
            onImageUpload={handleProjectImage}
            onMove={moveProject}
            onSave={saveProjects}
          />
        )}
        {tab === 'skills' && (
          <SkillsTab
            skills={skills} saving={saving}
            onAdd={addSkill}
            onUpdate={(idx, s) => { const u = [...skills]; u[idx] = s; setSkills(u) }}
            onDelete={deleteSkill}
            onMove={moveSkill}
            onSave={saveSkills}
          />
        )}
        {tab === 'experiences' && (
          <ExperiencesTab
            experiences={experiences} saving={saving}
            onAdd={addExperience}
            onUpdate={(idx, e) => { const u = [...experiences]; u[idx] = e; setExperiences(u) }}
            onDelete={deleteExperience}
            onMove={moveExperience}
            onSave={saveExperiences}
          />
        )}
        {tab === 'messages' && <MessagesTab showToast={showToast} />}
      </div>
    </div>
  )
}
