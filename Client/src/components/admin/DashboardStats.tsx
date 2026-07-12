'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line, CartesianGrid,
} from 'recharts'
import { FolderKanban, BarChart3, Briefcase, GraduationCap, Award, Image as ImageIcon, Mail, Loader } from 'lucide-react'

const COLORS = ['#06b6d4', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#6366f1']

interface StatCard {
  label: string
  count: number
  icon: React.ReactNode
  color: string
}

export default function DashboardStats() {
  const [data, setData] = useState<{
    projects: number; skills: number; experiences: number
    education: number; certs: number; gallery: number; messages: number
    skillsByCategory: { category: string; count: number }[]
    projectsByCategory: { category: string; count: number }[]
    messagesByMonth: { month: string; count: number }[]
  } | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/projects').then(r => r.json()),
      fetch('/api/admin/skills').then(r => r.json()),
      fetch('/api/admin/experiences').then(r => r.json()),
      fetch('/api/admin/education').then(r => r.json()),
      fetch('/api/admin/certifications').then(r => r.json()),
      fetch('/api/admin/gallery').then(r => r.json()),
      fetch('/api/admin/messages').then(r => r.json()),
    ]).then(([projects, skills, experiences, education, certs, gallery, messages]) => {
      const skillsByCategory = Object.entries(
        (skills as { category: string }[]).reduce((acc: Record<string, number>, s) => {
          acc[s.category] = (acc[s.category] || 0) + 1
          return acc
        }, {})
      ).map(([category, count]) => ({ category, count }))

      const projectsByCategory = Object.entries(
        (projects as { category: string }[]).reduce((acc: Record<string, number>, p) => {
          acc[p.category] = (acc[p.category] || 0) + 1
          return acc
        }, {})
      ).map(([category, count]) => ({ category, count }))

      const msgs = messages as { created_at: string }[]
      const byMonth: Record<string, number> = {}
      for (const m of msgs) {
        const key = m.created_at?.substring(0, 7) || 'unknown'
        byMonth[key] = (byMonth[key] || 0) + 1
      }
      const messagesByMonth = Object.entries(byMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, count]) => ({ month, count }))

      setData({
        projects: projects.length,
        skills: skills.length,
        experiences: experiences.length,
        education: education.length,
        certs: certs.length,
        gallery: gallery.length,
        messages: msgs.length,
        skillsByCategory,
        projectsByCategory,
        messagesByMonth,
      })
    }).catch(() => setError(true))
  }, [])

  if (error) {
    return <p className="text-sm text-red-400">Failed to load dashboard data.</p>
  }

  if (!data) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <Loader className="w-4 h-4 animate-spin" /> Loading dashboard...
      </div>
    )
  }

  const cards: StatCard[] = [
    { label: 'Projects', count: data.projects, icon: <FolderKanban className="w-5 h-5" />, color: 'text-cyan-400' },
    { label: 'Skills', count: data.skills, icon: <BarChart3 className="w-5 h-5" />, color: 'text-purple-400' },
    { label: 'Experiences', count: data.experiences, icon: <Briefcase className="w-5 h-5" />, color: 'text-pink-400' },
    { label: 'Education', count: data.education, icon: <GraduationCap className="w-5 h-5" />, color: 'text-emerald-400' },
    { label: 'Certifications', count: data.certs, icon: <Award className="w-5 h-5" />, color: 'text-amber-400' },
    { label: 'Gallery', count: data.gallery, icon: <ImageIcon className="w-5 h-5" />, color: 'text-indigo-400' },
    { label: 'Messages', count: data.messages, icon: <Mail className="w-5 h-5" />, color: 'text-rose-400' },
  ]

  return (
    <div className="flex flex-col gap-8">
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-[#0f121d]/60 backdrop-blur border border-white/5 rounded-xl p-4 flex items-center gap-4">
            <div className={`${c.color}`}>{c.icon}</div>
            <div>
              <p className={`text-2xl font-bold ${c.color}`}>{c.count}</p>
              <p className="text-xs text-gray-500 font-mono">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills by category bar chart */}
        <div className="bg-[#0f121d]/60 backdrop-blur border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Skills by Category</h3>
          {data.skillsByCategory.length === 0 ? (
            <p className="text-xs text-gray-500">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.skillsByCategory}>
                <XAxis dataKey="category" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0f121d', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Projects by category pie chart */}
        <div className="bg-[#0f121d]/60 backdrop-blur border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Projects by Category</h3>
          {data.projectsByCategory.length === 0 ? (
            <p className="text-xs text-gray-500">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.projectsByCategory}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={(props: any) => `${props.category}: ${props.count}`}
                  labelLine={false}
                >
                  {data.projectsByCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0f121d', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Messages over time line chart */}
        <div className="bg-[#0f121d]/60 backdrop-blur border border-white/5 rounded-xl p-5 md:col-span-2">
          <h3 className="text-sm font-semibold text-white mb-4">Messages Over Time</h3>
          {data.messagesByMonth.length === 0 ? (
            <p className="text-xs text-gray-500">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.messagesByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0f121d', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
                <Line type="monotone" dataKey="count" stroke="#a855f7" strokeWidth={2} dot={{ fill: '#a855f7', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
