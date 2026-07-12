'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Toaster } from 'sonner'
import {
  LogOut, Settings, Award, Image as ImageIcon, User, FolderKanban,
  BarChart3, Briefcase, GraduationCap, Mail, Menu, X, ChevronLeft, LayoutDashboard,
} from 'lucide-react'
import { AdminSkeleton } from '@/components/Skeleton'
import LoginPage from '@/components/admin/LoginPage'

const tabs = [
  { key: '/admin', tab: null, label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { key: '/admin?tab=profile', tab: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  { key: '/admin?tab=projects', tab: 'projects', label: 'Projects', icon: <FolderKanban className="w-4 h-4" /> },
  { key: '/admin?tab=skills', tab: 'skills', label: 'Skills', icon: <BarChart3 className="w-4 h-4" /> },
  { key: '/admin?tab=experiences', tab: 'experiences', label: 'Experience', icon: <Briefcase className="w-4 h-4" /> },
  { key: '/admin?tab=education', tab: 'education', label: 'Education', icon: <GraduationCap className="w-4 h-4" /> },
  { key: '/admin?tab=certifications', tab: 'certifications', label: 'Certifications', icon: <Award className="w-4 h-4" /> },
  { key: '/admin?tab=gallery', tab: 'gallery', label: 'Gallery', icon: <ImageIcon className="w-4 h-4" /> },
  { key: '/admin?tab=messages', tab: 'messages', label: 'Messages', icon: <Mail className="w-4 h-4" /> },
  { key: '/admin?tab=settings', tab: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetch('/api/admin/auth')
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((d) => setAuthed(d.authenticated))
      .catch(() => {
        setAuthed(false)
      })
  }, [])

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    setAuthed(false)
  }

  if (authed === null) return <AdminSkeleton />

  if (!authed) {
    return <LoginPage onSuccess={() => setAuthed(true)} />
  }

  const currentTab = searchParams.get('tab')

  return (
    <div className="min-h-screen bg-[#07090e] flex">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#0f121d', border: '1px solid rgba(255,255,255,0.05)', color: '#e5e7eb', fontSize: '14px' },
        }}
      />

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed md:sticky top-0 z-40 h-screen w-56 bg-[#0f121d]/95 backdrop-blur-xl border-r border-white/5 flex flex-col transition-transform duration-200 md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between px-4 h-14 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold">&lt;</span>
            <span className="text-white font-bold">Admin</span>
            <span className="text-cyan-400 font-bold">/&gt;</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={t.key}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                currentTab === t.tab || (!currentTab && !t.tab)
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </Link>
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

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-[#0f121d]/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-400 hover:text-white cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm text-gray-500 font-mono capitalize">
              {tabs.find((t) => t.tab === currentTab)?.label || 'Dashboard'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </header>
        <div className="p-4 md:p-6 max-w-4xl mx-auto w-full">
          {children}
        </div>
      </div>
    </div>
  )
}
