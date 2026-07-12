'use client'

import { Plus, Trash2, Save, Loader, ChevronUp, ChevronDown, GripVertical } from 'lucide-react'

interface SkillData {
  id?: number; category: string; name: string; value: number; sort_order: number
}

interface Props {
  skills: SkillData[]
  saving: boolean
  onAdd: () => void
  onUpdate: (idx: number, skill: SkillData) => void
  onDelete: (id: number) => void
  onMove: (idx: number, direction: 'up' | 'down') => void
  onSave: () => void
}

const inputClass = "w-full px-3 py-2 bg-[#0f121d] border border-white/5 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
const btnPrimary = "flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-white"
const btnDanger = "p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
const btnMove = "p-1.5 text-gray-500 hover:text-cyan-400 hover:bg-cyan-400/5 rounded-lg transition-colors disabled:opacity-30"
const cardClass = "bg-[#0f121d]/60 backdrop-blur border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors"

export default function SkillsTab({ skills, saving, onAdd, onUpdate, onDelete, onMove, onSave }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <button onClick={onAdd} className={btnPrimary + " self-start"}>
        <Plus className="w-4 h-4" /> Add Skill
      </button>
      {skills.length === 0 && <p className="text-gray-500 text-sm">No skills yet.</p>}
      {skills.map((s, idx) => (
        <div key={s.id || idx} className={cardClass + " flex items-center gap-3"}>
          <GripVertical className="w-4 h-4 text-gray-600 shrink-0" />
          <div className="flex flex-col gap-1 shrink-0">
            <button onClick={() => onMove(idx, 'up')} disabled={idx === 0} className={btnMove}>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onMove(idx, 'down')} disabled={idx === skills.length - 1} className={btnMove}>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
          <input value={s.category} onChange={e => { const u = { ...s, category: e.target.value }; onUpdate(idx, u) }}
            className={inputClass + " w-44 shrink-0"} placeholder="Category" />
          <input value={s.name} onChange={e => { const u = { ...s, name: e.target.value }; onUpdate(idx, u) }}
            className={inputClass} placeholder="Skill name" />
          <div className="flex items-center gap-2 shrink-0">
            <input type="range" min={0} max={100} value={s.value}
              onChange={e => { const u = { ...s, value: +e.target.value }; onUpdate(idx, u) }}
              className="w-24 accent-cyan-500" />
            <span className="text-sm text-gray-400 w-8 font-mono">{s.value}%</span>
          </div>
          <button onClick={() => s.id && onDelete(s.id)} className={btnDanger}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      {skills.length > 0 && (
        <button onClick={onSave} disabled={saving} className={btnPrimary + " self-start"}>
          {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save All Skills
        </button>
      )}
    </div>
  )
}
