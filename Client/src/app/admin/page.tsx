'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast, Toaster } from 'sonner'
import {
  LogOut,
  Settings,
  Award,
  Image as ImageIcon,
  User,
  FolderKanban,
  BarChart3,
  Briefcase,
  GraduationCap,
  Mail,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react'
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
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [skills, setSkills] = useState<SkillData[]>([])
  const [experiences, setExperiences] = useState<ExperienceData[]>([])
  const [education, setEducation] = useState<EducationData[]>([])
  const [certifications, setCertifications] = useState<CertificationData[]>([])
  const [gallery, setGallery] = useState<GalleryItemData[]>([])

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
          toast('Failed to load profile')
          setProfile(null)
        }),
      fetch('/api/admin/projects')
        .then(checkRes)
        .then(setProjects)
        .catch(() => {
          toast('Failed to load projects')
          setProjects([])
        }),
      fetch('/api/admin/skills')
        .then(checkRes)
        .then(setSkills)
        .catch(() => {
          toast('Failed to load skills')
          setSkills([])
        }),
      fetch('/api/admin/experiences')
        .then(checkRes)
        .then(setExperiences)
        .catch(() => {
          toast('Failed to load experiences')
          setExperiences([])
        }),
      fetch('/api/admin/education')
        .then(checkRes)
        .then(setEducation)
        .catch(() => {
          toast('Failed to load education')
          setEducation([])
        }),
      fetch('/api/admin/certifications')
        .then(checkRes)
        .then(setCertifications)
        .catch(() => {
          toast('Failed to load certifications')
          setCertifications([])
        }),
      fetch('/api/admin/gallery')
        .then(checkRes)
        .then(setGallery)
        .catch(() => {
          toast('Failed to load gallery')
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
    toast(res.ok ? 'Profile saved' : 'Failed to save profile')
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
      toast('Image compression failed')
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
    toast(res.ok ? 'Projects saved' : 'Failed to save')
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
      toast('Failed to add')
      return
    }
    const saved = await res.json()
    setProjects([...projects, saved])
    toast('Project added')
  }

  const deleteProject = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setProjects(projects.filter((p) => p.id !== id))
      toast('Project deleted')
    } catch {
      toast('Failed to delete project')
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
    toast(res.ok ? 'Skills saved' : 'Failed to save')
  }

  const addSkill = async () => {
    const newS = { category: '', name: '', value: 0, sort_order: skills.length }
    const res = await fetch('/api/admin/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newS),
    })
    if (!res.ok) {
      toast('Failed to add')
      return
    }
    const saved = await res.json()
    setSkills([...skills, saved])
    toast('Skill added')
  }

  const deleteSkill = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/skills/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setSkills(skills.filter((s) => s.id !== id))
      toast('Skill deleted')
    } catch {
      toast('Failed to delete skill')
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
    toast(res.ok ? 'Experiences saved' : 'Failed to save')
  }

  const addExperience = async () => {
    const newE = { date: '', title: '', company: '', desc: '', sort_order: experiences.length }
    const res = await fetch('/api/admin/experiences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newE),
    })
    if (!res.ok) {
      toast('Failed to add')
      return
    }
    const saved = await res.json()
    setExperiences([...experiences, saved])
    toast('Experience added')
  }

  const deleteExperience = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/experiences/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setExperiences(experiences.filter((e) => e.id !== id))
      toast('Experience deleted')
    } catch {
      toast('Failed to delete experience')
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
    toast('Education saved')
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
      toast('Failed to add')
      return
    }
    const saved = await res.json()
    setEducation([...education, saved])
    toast('Entry added')
  }

  const deleteEducation = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/education/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setEducation(education.filter((e) => e.id !== id))
      toast('Entry deleted')
    } catch {
      toast('Failed to delete')
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
      toast('Image compression failed')
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
    toast(res.ok ? 'Certifications saved' : 'Failed to save')
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
      toast('Failed to add')
      return
    }
    const saved = await res.json()
    setCertifications([...certifications, saved])
    toast('Certification added')
  }

  const deleteCertification = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/certifications/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setCertifications(certifications.filter((c) => c.id !== id))
      toast('Certification deleted')
    } catch {
      toast('Failed to delete')
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
      toast('Image compression failed')
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
    toast(res.ok ? 'Gallery saved' : 'Failed to save')
  }

  const addGalleryItem = async () => {
    const newG = { title: '', image: '', description: '', sort_order: gallery.length }
    const res = await fetch('/api/admin/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newG),
    })
    if (!res.ok) {
      toast('Failed to add')
      return
    }
    const saved = await res.json()
    setGallery([...gallery, saved])
    toast('Image added')
  }

  const deleteGalleryItem = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setGallery(gallery.filter((g) => g.id !== id))
      toast('Image deleted')
    } catch {
      toast('Failed to delete')
    }
  }

  const moveGalleryItem = (idx: number, dir: 'up' | 'down') => {
    const to = dir === 'up' ? idx - 1 : idx + 1
    if (to < 0 || to >= gallery.length) return
    setGallery(moveItem(gallery, idx, to))
  }

  if (!authed) return null

  const tabLabels: Record<Tab, { label: string; icon: React.ReactNode }> = {
    profile: { label: 'Profile', icon: <User className="w-4 h-4" /> },
    projects: { label: 'Projects', icon: <FolderKanban className="w-4 h-4" /> },
    skills: { label: 'Skills', icon: <BarChart3 className="w-4 h-4" /> },
    experiences: { label: 'Experience', icon: <Briefcase className="w-4 h-4" /> },
    education: { label: 'Education', icon: <GraduationCap className="w-4 h-4" /> },
    certifications: { label: 'Certifications', icon: <Award className="w-4 h-4" /> },
    gallery: { label: 'Gallery', icon: <ImageIcon className="w-4 h-4" /> },
    messages: { label: 'Messages', icon: <Mail className="w-4 h-4" /> },
    settings: { label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  }

  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#07090e] flex">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f121d',
            border: '1px solid rgba(255,255,255,0.05)',
            color: '#e5e7eb',
            fontSize: '14px',
          },
        }}
      />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-56 bg-[#0f121d]/95 backdrop-blur-xl border-r border-white/5 flex flex-col transition-transform duration-200 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold">&lt;</span>
            <span className="text-white font-bold">Admin</span>
            <span className="text-cyan-400 font-bold">/&gt;</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {(Object.keys(tabLabels) as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t)
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors text-left cursor-pointer ${
                tab === t
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {tabLabels[t].icon}
              <span>{tabLabels[t].label}</span>
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-white/5 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> View Site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-[#0f121d]/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-400 hover:text-white cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm text-gray-500 font-mono">{tabLabels[tab].label}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden md:inline-flex text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 transition-all"
            >
              View Portfolio
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </header>

        <div className="p-4 md:p-6 max-w-4xl mx-auto w-full">
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
              {tab === 'messages' && <MessagesTab />}
              {tab === 'settings' && <SettingsTab />}
            </>
          )}
        </div>
        <ScrollToTop />
      </div>
    </div>
  )
}
