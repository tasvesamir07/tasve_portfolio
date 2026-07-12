'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import ProfileTab from '@/components/admin/ProfileTab'
import ProjectsTab from '@/components/admin/ProjectsTab'
import SkillsTab from '@/components/admin/SkillsTab'
import ExperiencesTab from '@/components/admin/ExperiencesTab'
import EducationTab from '@/components/admin/EducationTab'
import CertificationsTab from '@/components/admin/CertificationsTab'
import GalleryTab from '@/components/admin/GalleryTab'
import MessagesTab from '@/components/admin/MessagesTab'
import SettingsTab from '@/components/admin/SettingsTab'
import DashboardStats from '@/components/admin/DashboardStats'
import { AdminSkeleton } from '@/components/Skeleton'
import ScrollToTop from '@/components/ScrollToTop'
import { useCrud, uploadImage } from '@/lib/use-crud'

type Tab = 'dashboard' | 'profile' | 'projects' | 'skills' | 'experiences' | 'education' | 'certifications' | 'gallery' | 'messages' | 'settings'

interface ProfileData {
  name: string; title: string; intro: string; description: string; email: string
  location: string; github: string; linkedin: string; twitter: string; codepen: string
  bio_paragraphs: string; tech_list: string; avatar: string; resume_url: string
}

interface ProjectData { id?: number; title: string; category: string; tag: string; desc: string; tags: string; github: string; live: string; image: string; diagram_url: string; sort_order: number }

interface SkillData { id?: number; category: string; name: string; value: number; sort_order: number }

interface ExperienceData { id?: number; date: string; title: string; company: string; desc: string; sort_order: number }

interface EducationData { id?: number; type: string; title: string; subtitle: string; date: string; details: string; sort_order: number }

interface CertificationData { id?: number; title: string; issuer: string; date: string; credential_url: string; image: string; sort_order: number }

interface GalleryItemData { id?: number; title: string; image: string; description: string; sort_order: number }

function AdminPageInner() {
  const searchParams = useSearchParams()
  const validTabs = ['dashboard','profile','projects','skills','experiences','education','certifications','gallery','messages','settings']
  const tabParam = searchParams.get('tab') as Tab | null
  const tab: Tab = tabParam && validTabs.includes(tabParam) ? tabParam : 'dashboard'

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [saving, setSaving] = useState(false)

  const crudProjects = useCrud<ProjectData>('projects', { title: '', category: '', tag: '', desc: '', tags: '', github: '', live: '', image: '', diagram_url: '' })
  const crudSkills = useCrud<SkillData>('skills', { category: '', name: '', value: 0 })
  const crudExperiences = useCrud<ExperienceData>('experiences', { date: '', title: '', company: '', desc: '' })
  const crudEducation = useCrud<EducationData>('education', { type: 'education', title: '', subtitle: '', date: '', details: '' }, { saveMode: 'individual' })
  const crudCertifications = useCrud<CertificationData>('certifications', { title: '', issuer: '', date: '', credential_url: '', image: '' })
  const crudGallery = useCrud<GalleryItemData>('gallery', { title: '', image: '', description: '' })

  useEffect(() => {
    fetch('/api/admin/profile').then(r => {
      if (!r.ok) throw new Error()
      return r.json()
    }).then(d => {
      setProfile(d)
      setProfileLoaded(true)
    }).catch(() => {
      toast('Failed to load profile')
      setProfile(null)
      setProfileLoaded(true)
    })
  }, [])

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

  const handleCertImage = async (idx: number, file: File) => {
    try {
      const url = await uploadImage(file)
      crudCertifications.setItems((prev) => {
        const updated = [...prev]
        updated[idx] = { ...updated[idx], image: url }
        return updated
      })
    } catch {
      toast('Image upload failed')
    }
  }

  const handleGalleryImage = async (idx: number, file: File) => {
    try {
      const url = await uploadImage(file)
      crudGallery.setItems((prev) => {
        const updated = [...prev]
        updated[idx] = { ...updated[idx], image: url }
        return updated
      })
    } catch {
      toast('Image upload failed')
    }
  }

  const loading = !profileLoaded && tab === 'profile'

  return (
    <>
      {loading ? (
        <AdminSkeleton />
      ) : (
        <>
          {tab === 'dashboard' && <DashboardStats />}
          {tab === 'profile' && profile && (
            <ProfileTab profile={profile} saving={saving} onChange={setProfile} onSave={saveProfile} />
          )}
          {tab === 'projects' && (
            <ProjectsTab
              projects={crudProjects.items} saving={crudProjects.saving}
              onAdd={crudProjects.addItem}
              onUpdate={(idx, p) => { const u = [...crudProjects.items]; u[idx] = p; crudProjects.setItems(u) }}
              onDelete={crudProjects.deleteItem} onImageUpload={crudProjects.handleImageUpload} onMove={crudProjects.moveItem} onSave={crudProjects.saveAll}
            />
          )}
          {tab === 'skills' && (
            <SkillsTab
              skills={crudSkills.items} saving={crudSkills.saving}
              onAdd={crudSkills.addItem}
              onUpdate={(idx, s) => { const u = [...crudSkills.items]; u[idx] = s; crudSkills.setItems(u) }}
              onDelete={crudSkills.deleteItem} onMove={crudSkills.moveItem} onSave={crudSkills.saveAll}
            />
          )}
          {tab === 'experiences' && (
            <ExperiencesTab
              experiences={crudExperiences.items} saving={crudExperiences.saving}
              onAdd={crudExperiences.addItem}
              onUpdate={(idx, e) => { const u = [...crudExperiences.items]; u[idx] = e; crudExperiences.setItems(u) }}
              onDelete={crudExperiences.deleteItem} onMove={crudExperiences.moveItem} onSave={crudExperiences.saveAll}
            />
          )}
          {tab === 'education' && (
            <EducationTab
              education={crudEducation.items} saving={crudEducation.saving}
              onAdd={crudEducation.addItem}
              onUpdate={(idx, e) => { const u = [...crudEducation.items]; u[idx] = e; crudEducation.setItems(u) }}
              onDelete={crudEducation.deleteItem} onMove={crudEducation.moveItem} onSave={crudEducation.saveAll}
            />
          )}
          {tab === 'certifications' && (
            <CertificationsTab
              certifications={crudCertifications.items} saving={crudCertifications.saving}
              onAdd={crudCertifications.addItem}
              onUpdate={(idx, c) => { const u = [...crudCertifications.items]; u[idx] = c; crudCertifications.setItems(u) }}
              onDelete={crudCertifications.deleteItem} onImageUpload={handleCertImage} onMove={crudCertifications.moveItem} onSave={crudCertifications.saveAll}
            />
          )}
          {tab === 'gallery' && (
            <GalleryTab
              items={crudGallery.items} saving={crudGallery.saving}
              onAdd={crudGallery.addItem}
              onUpdate={(idx, g) => { const u = [...crudGallery.items]; u[idx] = g; crudGallery.setItems(u) }}
              onDelete={crudGallery.deleteItem} onImageUpload={handleGalleryImage} onMove={crudGallery.moveItem} onSave={crudGallery.saveAll}
            />
          )}
          {tab === 'messages' && <MessagesTab />}
          {tab === 'settings' && <SettingsTab />}
        </>
      )}
      <ScrollToTop />
    </>
  )
}

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <AdminPageInner />
    </Suspense>
  )
}
