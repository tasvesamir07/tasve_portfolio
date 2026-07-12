'use client'

import { Plus, Trash2, Save, Loader, ChevronUp, ChevronDown, GripVertical } from 'lucide-react'

interface ExperienceData {
  id?: number; date: string; title: string; company: string; desc: string; sort_order: number
}

interface Props {
  experiences: ExperienceData[]
  saving: boolean
  onAdd: () => void
  onUpdate: (idx: number, experience: ExperienceData) => void
  onDelete: (id: number) => void
  onMove: (idx: number, direction: 'up' | 'down') => void
  onSave: () => void
}

const inputClass = "w-full px-3 py-2 bg-[#0f121d] border border-white/5 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
const textareaClass = "w-full px-3 py-2 bg-[#0f121d] border border-white/5 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 resize-none transition-colors"
const cardClass = "bg-[#0f121d]/60 backdrop-blur border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors"
const btnPrimary = "flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-white"
const btnDanger = "p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
const btnMove = "p-1.5 text-gray-500 hover:text-cyan-400 hover:bg-cyan-400/5 rounded-lg transition-colors disabled:opacity-30"

export default function ExperiencesTab({ experiences, saving, onAdd, onUpdate, onDelete, onMove, onSave }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <button onClick={onAdd} className={btnPrimary + " self-start"}>
        <Plus className="w-4 h-4" /> Add Experience
      </button>
      {experiences.length === 0 && <p className="text-gray-500 text-sm">No experiences yet.</p>}
      {experiences.map((e, idx) => (
        <div key={e.id || idx} className={cardClass + " flex flex-col gap-4 shadow-xl shadow-black/10"}>
          
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-3">
              <GripVertical className="w-4 h-4 text-gray-600 cursor-grab active:cursor-grabbing shrink-0" />
              <div className="flex gap-1 shrink-0">
                <button onClick={() => onMove(idx, 'up')} disabled={idx === 0} className={btnMove} title="Move Up">
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onMove(idx, 'down')} disabled={idx === experiences.length - 1} className={btnMove} title="Move Down">
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-sm font-bold text-gray-400 font-mono">
                Experience #{idx + 1}: <span className="text-white">{e.title || 'Untitled Role'}</span>
              </span>
            </div>
            
            <button onClick={() => e.id && onDelete(e.id)} className={btnDanger} title="Delete Experience">
              <Trash2 className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1.5">Job Title / Role</label>
              <input value={e.title} onChange={ev => { const u = { ...e, title: ev.target.value }; onUpdate(idx, u) }}
                className={inputClass} placeholder="e.g. Web Developer" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1.5">Company</label>
              <input value={e.company} onChange={ev => { const u = { ...e, company: ev.target.value }; onUpdate(idx, u) }}
                className={inputClass} placeholder="e.g. Royal Bengal AI" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1.5">Duration / Date</label>
              <input value={e.date} onChange={ev => { const u = { ...e, date: ev.target.value }; onUpdate(idx, u) }}
                className={inputClass} placeholder="e.g. October 2025 – July 2026" />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1.5">Description</label>
            <textarea value={e.desc} onChange={ev => { const u = { ...e, desc: ev.target.value }; onUpdate(idx, u) }}
              className={textareaClass} rows={4} placeholder="Describe the job responsibilities and achievements..." />
          </div>

        </div>
      ))}
      {experiences.length > 0 && (
        <button onClick={onSave} disabled={saving} className={btnPrimary + " self-start mt-2"}>
          {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save All Experiences
        </button>
      )}
    </div>
  )
}
