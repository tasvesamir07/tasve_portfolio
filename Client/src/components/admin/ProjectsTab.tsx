'use client'

import { Plus, Trash2, Save, Loader, Image, ChevronUp, ChevronDown, GripVertical } from 'lucide-react'

interface ProjectData {
  id?: number; title: string; category: string; tag: string; desc: string
  tags: string; github: string; live: string; image: string; sort_order: number
}

interface Props {
  projects: ProjectData[]
  saving: boolean
  onAdd: () => void
  onUpdate: (idx: number, project: ProjectData) => void
  onDelete: (id: number) => void
  onImageUpload: (idx: number, file: File) => void
  onMove: (idx: number, direction: 'up' | 'down') => void
  onSave: () => void
}

const inputClass = "w-full px-3 py-2 bg-[#0f121d] border border-white/5 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
const textareaClass = "w-full px-3 py-2 bg-[#0f121d] border border-white/5 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 resize-none transition-colors"
const cardClass = "bg-[#0f121d]/60 backdrop-blur border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors"
const btnPrimary = "flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-white"
const btnDanger = "p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
const btnMove = "p-1.5 text-gray-500 hover:text-cyan-400 hover:bg-cyan-400/5 rounded-lg transition-colors disabled:opacity-30"

export default function ProjectsTab({ projects, saving, onAdd, onUpdate, onDelete, onImageUpload, onMove, onSave }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <button onClick={onAdd} className={btnPrimary + " self-start"}>
        <Plus className="w-4 h-4" /> Add Project
      </button>
      {projects.length === 0 && <p className="text-gray-500 text-sm">No projects yet.</p>}
      {projects.map((p, idx) => (
        <div key={p.id || idx} className={cardClass + " flex flex-col gap-4 shadow-xl shadow-black/10"}>
          
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-3">
              <GripVertical className="w-4 h-4 text-gray-600 cursor-grab active:cursor-grabbing shrink-0" />
              <div className="flex gap-1 shrink-0">
                <button onClick={() => onMove(idx, 'up')} disabled={idx === 0} className={btnMove} title="Move Up">
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onMove(idx, 'down')} disabled={idx === projects.length - 1} className={btnMove} title="Move Down">
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-sm font-bold text-gray-400 font-mono">
                Project #{idx + 1}: <span className="text-white">{p.title || 'Untitled Project'}</span>
              </span>
            </div>
            
            <button onClick={() => p.id && onDelete(p.id)} className={btnDanger} title="Delete Project">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1.5">Project Title</label>
              <input value={p.title} onChange={e => { const u = { ...p, title: e.target.value }; onUpdate(idx, u) }}
                className={inputClass} placeholder="e.g. Certificate Studio" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1.5">Category</label>
              <input value={p.category} onChange={e => { const u = { ...p, category: e.target.value }; onUpdate(idx, u) }}
                className={inputClass} placeholder="e.g. fullstack, ai, iot" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1.5">Badge / Tag</label>
              <input value={p.tag} onChange={e => { const u = { ...p, tag: e.target.value }; onUpdate(idx, u) }}
                className={inputClass} placeholder="e.g. Featured, AI Powered" />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1.5">Description</label>
            <textarea value={p.desc} onChange={e => { const u = { ...p, desc: e.target.value }; onUpdate(idx, u) }}
              className={textareaClass} rows={3} placeholder="Describe the project..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1.5">Technologies (comma separated)</label>
              <input value={p.tags} onChange={e => { const u = { ...p, tags: e.target.value }; onUpdate(idx, u) }}
                className={inputClass} placeholder="e.g. React, Node.js, Tailwind" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1.5">GitHub URL</label>
              <input value={p.github} onChange={e => { const u = { ...p, github: e.target.value }; onUpdate(idx, u) }}
                className={inputClass} placeholder="https://github.com/..." />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1.5">Live Demo URL</label>
              <input value={p.live} onChange={e => { const u = { ...p, live: e.target.value }; onUpdate(idx, u) }}
                className={inputClass} placeholder="https://..." />
            </div>
          </div>

          <div className="bg-[#0b0d16]/80 border border-white/5 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-full md:w-auto shrink-0">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1.5">Upload Image</label>
              <label className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0f121d] border border-white/5 rounded-lg text-sm text-gray-400 cursor-pointer hover:border-cyan-500/50 transition-colors w-full md:w-auto">
                <Image className="w-4 h-4" /> {p.image ? 'Change Image' : 'Select Image'}
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && onImageUpload(idx, e.target.files[0])} />
              </label>
            </div>
            
            <div className="flex-grow w-full">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1.5">Or Paste Image URL</label>
              <input value={p.image} onChange={e => { const u = { ...p, image: e.target.value }; onUpdate(idx, u) }}
                className={inputClass} placeholder="https://example.com/image.jpg" />
            </div>

            {p.image && (
              <div className="shrink-0 flex items-center justify-center border border-white/10 rounded-lg overflow-hidden bg-black/20 w-16 h-16">
                <img src={p.image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

        </div>
      ))}
      {projects.length > 0 && (
        <button onClick={onSave} disabled={saving} className={btnPrimary + " self-start mt-2"}>
          {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save All Projects
        </button>
      )}
    </div>
  )
}
