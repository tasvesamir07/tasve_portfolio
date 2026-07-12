'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Settings, Award, Image as ImageIcon } from 'lucide-react'
import ProfileTab from '@/components/admin/ProfileTab'
import ProjectsTab from '@/components/admin/ProjectsTab'
import SkillsTab from '@/components/admin/SkillsTab'
import ExperiencesTab from '@/components/admin/ExperiencesTab'
import EducationTab from '@/components/admin/EducationTab'
import MessagesTab from '@/components/admin/MessagesTab'
import SettingsTab from '@/components/admin/SettingsTab'
import CertificationsTab from '@/components/admin/CertificationsTab'
import GalleryTab from '@/components/admin/GalleryTab'
import { AdminSkeleton } from '@/components/Skeleton'
import { compressAndConvertToWebp } from '@/lib/image'
import ScrollToTop from '@/components/ScrollToTop'

type Tab =
  | 'profile'
  | 'projects'
  | 'skills'
  | 'experiences'
  | 'messages'
  | 'education'
  | 'certifications'
  | 'gallery'
  | 'settings'

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

interface ProjectData {
  id?: number
  title: string
  category: string
  tag: string
  desc: string
  tags: string
  github: string
  live: string
  image: string
  diagram_url: string
  sort_order: number
}

interface SkillData {
  id?: number
  category: string
  name: string
  value: number
  sort_order: number
}

interface ExperienceData {
  id?: number
  date: string
  title: string
  company: string
  desc: string
  sort_order: number
}

interface EducationData {
  id?: number
  type: string
  title: string
  subtitle: string
  date: string
  details: string
  sort_order: number
}

interface CertificationData {
  id?: number
  title: string
  issuer: string
  date: string
  credential_url: string
  image: string
  sort_order: number
}

interface GalleryItemData {
  id?: number
  title: string
  image: string
  description: string
  sort_order: number
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
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [skills, setSkills] = useState<SkillData[]>([])
  const [experiences, setExperiences] = useState<ExperienceData[]>([])
  const [education, setEducation] = useState<EducationData[]>([])
  const [certifications, setCertifications] = useState<CertificationData[]>([])
  const [gallery, setGallery] = useState<GalleryItemData[]>([])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => {
    fetch('/api/admin/auth')
      .then((r) => r.json())
      .then((d) => {
        if (!d.authenticated) router.push('/admin/login')
        else setAuthed(true)
      })
  }, [router])

  useEffect(() => {
    if (!authed) return
    const checkRes = (r: Response) => {
      if (!r.ok) throw new Error('HTTP error')
      return r.json()
    }
    Promise.all([
      fetch('/api/admin/profile')
        .then(checkRes)
        .then(setProfile)
        .catch(() => {
          showToast('Failed to load profile')
          setProfile(null)
        }),
      fetch('/api/admin/projects')
        .then(checkRes)
        .then(setProjects)
        .catch(() => {
          showToast('Failed to load projects')
          setProjects([])
        }),
      fetch('/api/admin/skills')
        .then(checkRes)
        .then(setSkills)
        .catch(() => {
          showToast('Failed to load skills')
          setSkills([])
        }),
      fetch('/api/admin/experiences')
        .then(checkRes)
        .then(setExperiences)
        .catch(() => {
          showToast('Failed to load experiences')
          setExperiences([])
        }),
      fetch('/api/admin/education')
        .then(checkRes)
        .then(setEducation)
        .catch(() => {
          showToast('Failed to load education')
          setEducation([])
        }),
      fetch('/api/admin/certifications')
        .then(checkRes)
        .then(setCertifications)
        .catch(() => {
          showToast('Failed to load certifications')
          setCertifications([])
        }),
      fetch('/api/admin/gallery')
        .then(checkRes)
        .then(setGallery)
        .catch(() => {
          showToast('Failed to load gallery')
          setGallery([])
        }),
    ]).finally(() => setLoadingData(false))
  }, [authed])

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    window.location.href = '/admin/login'
  }

  const saveProfile = async () => {
    if (!profile) return
    setSaving(true)
    const res = await fetch('/api/admin/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
    setSaving(false)
    showToast(res.ok ? 'Profile saved' : 'Failed to save profile')
  }

  const handleProjectImage = async (idx: number, file: File) => {
    try {
      const compressed = await compressAndConvertToWebp(file)
      const fd = new FormData()
      fd.append('file', compressed)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const { url } = await res.json()
      const updated = [...projects]
      updated[idx] = { ...updated[idx], image: url }
      setProjects(updated)
    } catch (err) {
      console.error('Project image upload failed:', err)
      showToast('Image compression failed')
    }
  }

  const saveProjects = async () => {
    setSaving(true)
    const items = projects.map((p, i) => ({ ...p, sort_order: i }))
    const res = await fetch('/api/admin/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'projects', items }),
    })
    setSaving(false)
    showToast(res.ok ? 'Projects saved' : 'Failed to save')
  }

  const addProject = async () => {
    const newP = {
      title: '',
      category: '',
      tag: '',
      desc: '',
      tags: '',
      github: '',
      live: '',
      image: '',
      sort_order: projects.length,
    }
    const res = await fetch('/api/admin/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newP),
    })
    if (!res.ok) {
      showToast('Failed to add')
      return
    }
    const saved = await res.json()
    setProjects([...projects, saved])
    showToast('Project added')
  }

  const deleteProject = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setProjects(projects.filter((p) => p.id !== id))
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
    const items = skills.map((s, i) => ({ ...s, sort_order: i }))
    const res = await fetch('/api/admin/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'skills', items }),
    })
    setSaving(false)
    showToast(res.ok ? 'Skills saved' : 'Failed to save')
  }

  const addSkill = async () => {
    const newS = { category: '', name: '', value: 0, sort_order: skills.length }
    const res = await fetch('/api/admin/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newS),
    })
    if (!res.ok) {
      showToast('Failed to add')
      return
    }
    const saved = await res.json()
    setSkills([...skills, saved])
    showToast('Skill added')
  }

  const deleteSkill = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/skills/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setSkills(skills.filter((s) => s.id !== id))
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
    const items = experiences.map((e, i) => ({ ...e, sort_order: i }))
    const res = await fetch('/api/admin/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'experiences', items }),
    })
    setSaving(false)
    showToast(res.ok ? 'Experiences saved' : 'Failed to save')
  }

  const addExperience = async () => {
    const newE = { date: '', title: '', company: '', desc: '', sort_order: experiences.length }
    const res = await fetch('/api/admin/experiences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newE),
    })
    if (!res.ok) {
      showToast('Failed to add')
      return
    }
    const saved = await res.json()
    setExperiences([...experiences, saved])
    showToast('Experience added')
  }

  const deleteExperience = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/experiences/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setExperiences(experiences.filter((e) => e.id !== id))
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

  const saveEducation = async () => {
    setSaving(true)
    await Promise.all(
      education.map(async (e, i) => {
        const payload = { ...e, sort_order: i }
        if (!e.id) {
          const res = await fetch('/api/admin/education', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          if (!res.ok) return
          const saved = await res.json()
          setEducation((prev) => {
            const next = [...prev]
            next[i] = { ...next[i], id: saved.id }
            return next
          })
          return
        }
        return fetch(`/api/admin/education/${e.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }),
    )
    setSaving(false)
    showToast('Education saved')
  }

  const addEducation = async () => {
    const newE = {
      type: 'education',
      title: '',
      subtitle: '',
      date: '',
      details: '',
      sort_order: education.length,
    }
    const res = await fetch('/api/admin/education', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newE),
    })
    if (!res.ok) {
      showToast('Failed to add')
      return
    }
    const saved = await res.json()
    setEducation([...education, saved])
    showToast('Entry added')
  }

  const deleteEducation = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/education/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setEducation(education.filter((e) => e.id !== id))
      showToast('Entry deleted')
    } catch {
      showToast('Failed to delete')
    }
  }

  const moveEducation = (idx: number, dir: 'up' | 'down') => {
    const to = dir === 'up' ? idx - 1 : idx + 1
    if (to < 0 || to >= education.length) return
    setEducation(moveItem(education, idx, to))
  }

  // === Certifications handlers ===
  const handleCertImage = async (idx: number, file: File) => {
    try {
      const compressed = await compressAndConvertToWebp(file)
      const fd = new FormData()
      fd.append('file', compressed)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const { url } = await res.json()
      const updated = [...certifications]
      updated[idx] = { ...updated[idx], image: url }
      setCertifications(updated)
    } catch (err) {
      console.error('Certification image upload failed:', err)
      showToast('Image compression failed')
    }
  }

  const saveCertifications = async () => {
    setSaving(true)
    const items = certifications.map((c, i) => ({ ...c, sort_order: i }))
    const res = await fetch('/api/admin/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'certifications', items }),
    })
    setSaving(false)
    showToast(res.ok ? 'Certifications saved' : 'Failed to save')
  }

  const addCertification = async () => {
    const newC = {
      title: '',
      issuer: '',
      date: '',
      credential_url: '',
      image: '',
      sort_order: certifications.length,
    }
    const res = await fetch('/api/admin/certifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newC),
    })
    if (!res.ok) {
      showToast('Failed to add')
      return
    }
    const saved = await res.json()
    setCertifications([...certifications, saved])
    showToast('Certification added')
  }

  const deleteCertification = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/certifications/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setCertifications(certifications.filter((c) => c.id !== id))
      showToast('Certification deleted')
    } catch {
      showToast('Failed to delete')
    }
  }

  const moveCertification = (idx: number, dir: 'up' | 'down') => {
    const to = dir === 'up' ? idx - 1 : idx + 1
    if (to < 0 || to >= certifications.length) return
    setCertifications(moveItem(certifications, idx, to))
  }

  // === Gallery handlers ===
  const handleGalleryImage = async (idx: number, file: File) => {
    try {
      const compressed = await compressAndConvertToWebp(file)
      const fd = new FormData()
      fd.append('file', compressed)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const { url } = await res.json()
      const updated = [...gallery]
      updated[idx] = { ...updated[idx], image: url }
      setGallery(updated)
    } catch (err) {
      console.error('Gallery image upload failed:', err)
      showToast('Image compression failed')
    }
  }

  const saveGallery = async () => {
    setSaving(true)
    const items = gallery.map((g, i) => ({ ...g, sort_order: i }))
    const res = await fetch('/api/admin/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'gallery', items }),
    })
    setSaving(false)
    showToast(res.ok ? 'Gallery saved' : 'Failed to save')
  }

  const addGalleryItem = async () => {
    const newG = { title: '', image: '', description: '', sort_order: gallery.length }
    const res = await fetch('/api/admin/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newG),
    })
    if (!res.ok) {
      showToast('Failed to add')
      return
    }
    const saved = await res.json()
    setGallery([...gallery, saved])
    showToast('Image added')
  }

  const deleteGalleryItem = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setGallery(gallery.filter((g) => g.id !== id))
      showToast('Image deleted')
    } catch {
      showToast('Failed to delete')
    }
  }

  const moveGalleryItem = (idx: number, dir: 'up' | 'down') => {
    const to = dir === 'up' ? idx - 1 : idx + 1
    if (to < 0 || to >= gallery.length) return
    setGallery(moveItem(gallery, idx, to))
  }

  if (!authed) return null

  const tabLabels: Record<Tab, string> = {
    profile: 'Profile',
    projects: 'Projects',
    skills: 'Skills',
    experiences: 'Experience',
    messages: 'Messages',
    education: 'Education',
    certifications: 'Certifications',
    gallery: 'Gallery',
    settings: 'Settings',
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
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 transition-all"
          >
            ← View Portfolio
          </Link>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </header>

      <div className="flex border-b border-white/5 px-6 bg-[#0f121d]/40 overflow-x-auto">
        {(Object.keys(tabLabels) as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors shrink-0 flex items-center gap-1.5 ${
              tab === t
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {t === 'settings' && <Settings className="w-3.5 h-3.5" />}
            {t === 'certifications' && <Award className="w-3.5 h-3.5" />}
            {t === 'gallery' && <ImageIcon className="w-3.5 h-3.5" />}
            {tabLabels[t]}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        {loadingData && !['settings', 'messages', 'certifications', 'gallery'].includes(tab) ? (
          <AdminSkeleton />
        ) : (
          <>
            {tab === 'profile' && profile && (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#0f121d]/60 backdrop-blur border border-white/5 rounded-xl p-4">
                    <p className="text-2xl font-bold text-cyan-400">{projects.length}</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">Projects</p>
                  </div>
                  <div className="bg-[#0f121d]/60 backdrop-blur border border-white/5 rounded-xl p-4">
                    <p className="text-2xl font-bold text-purple-400">{skills.length}</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">Skills</p>
                  </div>
                  <div className="bg-[#0f121d]/60 backdrop-blur border border-white/5 rounded-xl p-4">
                    <p className="text-2xl font-bold text-pink-400">{experiences.length}</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">Experiences</p>
                  </div>
                  <div className="bg-[#0f121d]/60 backdrop-blur border border-white/5 rounded-xl p-4">
                    <p className="text-2xl font-bold text-emerald-400">{education.length}</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">Education</p>
                  </div>
                </div>
                <ProfileTab
                  profile={profile}
                  saving={saving}
                  onChange={setProfile}
                  onSave={saveProfile}
                />
              </div>
            )}
            {tab === 'projects' && (
              <ProjectsTab
                projects={projects}
                saving={saving}
                onAdd={addProject}
                onUpdate={(idx, p) => {
                  const u = [...projects]
                  u[idx] = p
                  setProjects(u)
                }}
                onDelete={deleteProject}
                onImageUpload={handleProjectImage}
                onMove={moveProject}
                onSave={saveProjects}
              />
            )}
            {tab === 'skills' && (
              <SkillsTab
                skills={skills}
                saving={saving}
                onAdd={addSkill}
                onUpdate={(idx, s) => {
                  const u = [...skills]
                  u[idx] = s
                  setSkills(u)
                }}
                onDelete={deleteSkill}
                onMove={moveSkill}
                onSave={saveSkills}
              />
            )}
            {tab === 'experiences' && (
              <ExperiencesTab
                experiences={experiences}
                saving={saving}
                onAdd={addExperience}
                onUpdate={(idx, e) => {
                  const u = [...experiences]
                  u[idx] = e
                  setExperiences(u)
                }}
                onDelete={deleteExperience}
                onMove={moveExperience}
                onSave={saveExperiences}
              />
            )}
            {tab === 'education' && (
              <EducationTab
                education={education}
                saving={saving}
                onAdd={addEducation}
                onUpdate={(idx, e) => {
                  const u = [...education]
                  u[idx] = e
                  setEducation(u)
                }}
                onDelete={deleteEducation}
                onMove={moveEducation}
                onSave={saveEducation}
              />
            )}
            {tab === 'certifications' && (
              <CertificationsTab
                certifications={certifications}
                saving={saving}
                onAdd={addCertification}
                onUpdate={(idx, c) => {
                  const u = [...certifications]
                  u[idx] = c
                  setCertifications(u)
                }}
                onDelete={deleteCertification}
                onImageUpload={handleCertImage}
                onMove={moveCertification}
                onSave={saveCertifications}
              />
            )}
            {tab === 'gallery' && (
              <GalleryTab
                items={gallery}
                saving={saving}
                onAdd={addGalleryItem}
                onUpdate={(idx, g) => {
                  const u = [...gallery]
                  u[idx] = g
                  setGallery(u)
                }}
                onDelete={deleteGalleryItem}
                onImageUpload={handleGalleryImage}
                onMove={moveGalleryItem}
                onSave={saveGallery}
              />
            )}
            {tab === 'messages' && <MessagesTab showToast={showToast} />}
            {tab === 'settings' && <SettingsTab showToast={showToast} />}
          </>
        )}
      </div>
      <ScrollToTop />
    </div>
  )
}
