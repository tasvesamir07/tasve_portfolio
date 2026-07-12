'use client'

import {
  Plus,
  Trash2,
  Save,
  Loader,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Upload,
} from 'lucide-react'

interface GalleryData {
  id?: number
  title: string
  image: string
  description: string
  sort_order: number
}

interface Props {
  items: GalleryData[]
  saving: boolean
  onAdd: () => void
  onUpdate: (idx: number, item: GalleryData) => void
  onDelete: (id: number) => void
  onImageUpload: (idx: number, file: File) => void
  onMove: (idx: number, direction: 'up' | 'down') => void
  onSave: () => void
}

const inputClass =
  'w-full px-3 py-2 bg-[#0f121d] border border-white/5 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors'
const cardClass =
  'bg-[#0f121d]/60 backdrop-blur border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors'
const btnPrimary =
  'flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-white'
const btnDanger = 'p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors'
const btnMove =
  'p-1.5 text-gray-500 hover:text-cyan-400 hover:bg-cyan-400/5 rounded-lg transition-colors disabled:opacity-30'

export default function GalleryTab({
  items,
  saving,
  onAdd,
  onUpdate,
  onDelete,
  onImageUpload,
  onMove,
  onSave,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={onAdd} className={btnPrimary}>
          <Plus className="w-4 h-4" /> Add Image
        </button>
        {items.length > 0 && (
          <button onClick={onSave} disabled={saving} className={btnPrimary}>
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{' '}
            Save All
          </button>
        )}
      </div>
      {items.length === 0 && <p className="text-gray-500 text-sm">No gallery images yet.</p>}
      {items.map((item, idx) => (
        <div
          key={item.id || idx}
          className={cardClass + ' flex flex-col gap-4 shadow-xl shadow-black/10'}
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-3">
              <GripVertical className="w-4 h-4 text-gray-600 cursor-grab active:cursor-grabbing shrink-0" />
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => onMove(idx, 'up')}
                  disabled={idx === 0}
                  className={btnMove}
                  title="Move Up"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onMove(idx, 'down')}
                  disabled={idx === items.length - 1}
                  className={btnMove}
                  title="Move Down"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-sm font-bold text-gray-400 font-mono">
                Image #{idx + 1}: <span className="text-white">{item.title || 'Untitled'}</span>
              </span>
            </div>
            <button
              onClick={() => item.id && onDelete(item.id)}
              className={btnDanger}
              title="Delete"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1.5">
                Title
              </label>
              <input
                value={item.title}
                onChange={(e) => {
                  const u = { ...item, title: e.target.value }
                  onUpdate(idx, u)
                }}
                className={inputClass}
                placeholder="e.g. Conference Talk 2025"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1.5">
                Description
              </label>
              <input
                value={item.description}
                onChange={(e) => {
                  const u = { ...item, description: e.target.value }
                  onUpdate(idx, u)
                }}
                className={inputClass}
                placeholder="Brief description"
              />
            </div>
          </div>

          <div className="bg-[#0b0d16]/80 border border-white/5 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-full md:w-auto shrink-0">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1.5">
                Image
              </label>
              <label className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0f121d] border border-white/5 rounded-lg text-sm text-gray-400 cursor-pointer hover:border-cyan-500/50 transition-colors w-full md:w-auto">
                <Upload className="w-4 h-4" /> {item.image ? 'Change' : 'Upload'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && onImageUpload(idx, e.target.files[0])}
                />
              </label>
            </div>
            <div className="flex-grow w-full">
              <input
                value={item.image}
                onChange={(e) => {
                  const u = { ...item, image: e.target.value }
                  onUpdate(idx, u)
                }}
                className={inputClass}
                placeholder="Or paste image URL"
              />
            </div>
            {item.image && (
              <div className="shrink-0 border border-white/10 rounded-lg overflow-hidden bg-black/20 w-20 h-14 flex items-center justify-center">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
