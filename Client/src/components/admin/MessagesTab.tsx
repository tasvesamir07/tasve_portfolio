'use client'

import { useEffect, useState, useMemo } from 'react'
import { Trash2, Mail, Loader, Search, X } from 'lucide-react'
import { toast } from 'sonner'

interface Message {
  id: number
  name: string
  email: string
  subject: string
  message: string
  created_at: string
}

const inputClass =
  'w-full px-3 py-2 bg-[#0f121d] border border-white/5 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors'
const cardClass =
  'bg-[#0f121d]/60 backdrop-blur border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors'
const btnDanger = 'p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors shrink-0'
const PAGE_SIZE = 10

export default function MessagesTab() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetch('/api/admin/messages')
      .then((r) => r.json())
      .then((d) => setMessages(d))
      .catch(() => toast('Failed to load messages'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return messages
    const q = search.toLowerCase()
    return messages.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q),
    )
  }, [messages, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const paged = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  useEffect(() => {
    setPage(0)
    setSelected(new Set())
  }, [search])

  const toggleSelect = (id: number) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const toggleAll = () => {
    if (selected.size === paged.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(paged.map((m) => m.id)))
    }
  }

  const deleteMessage = async (id: number) => {
    const res = await fetch('/api/admin/messages', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (!res.ok) { toast('Failed to delete'); return }
    setMessages((prev) => prev.filter((m) => m.id !== id))
    setSelected((prev) => { const n = new Set(prev); n.delete(id); return n })
    toast('Message deleted')
  }

  const deleteSelected = async () => {
    if (selected.size === 0) return
    const count = selected.size
    for (const id of selected) {
      await fetch('/api/admin/messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
    }
    setMessages((prev) => prev.filter((m) => !selected.has(m.id)))
    setSelected(new Set())
    toast(`Deleted ${count} message${count !== 1 ? 's' : ''}`)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <Loader className="w-4 h-4 animate-spin" /> Loading messages...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search + batch delete bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, email, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputClass + ' pl-9'}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {selected.size > 0 && (
          <button
            onClick={deleteSelected}
            className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Delete {selected.size}
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-gray-500">
          <Mail className="w-10 h-10" />
          <p className="text-sm">{search ? 'No messages match your search.' : 'No messages yet.'}</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm text-gray-500 font-mono">
            <span>{filtered.length} message{filtered.length !== 1 ? 's' : ''}</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={paged.length > 0 && selected.size === paged.length}
                onChange={toggleAll}
                className="accent-cyan-500"
              />
              <span className="text-gray-500">Select all</span>
            </label>
          </div>

          {paged.map((m) => (
            <div key={m.id} className={cardClass + ' flex flex-col gap-3'}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={selected.has(m.id)}
                    onChange={() => toggleSelect(m.id)}
                    className="accent-cyan-500 shrink-0 mt-1"
                  />
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-white font-semibold">{m.name}</span>
                      <a
                        href={`mailto:${m.email}`}
                        className="text-cyan-400 text-xs font-mono hover:underline truncate"
                      >
                        {m.email}
                      </a>
                    </div>
                    <span className="text-gray-500 text-xs font-mono">
                      {new Date(m.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <button onClick={() => deleteMessage(m.id)} className={btnDanger}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="text-sm text-gray-400 font-semibold">{m.subject}</div>
              <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{m.message}</p>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-8 h-8 text-xs rounded-lg font-mono transition-colors cursor-pointer ${
                    safePage === i
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'bg-[#0f121d] text-gray-500 border border-white/5 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
