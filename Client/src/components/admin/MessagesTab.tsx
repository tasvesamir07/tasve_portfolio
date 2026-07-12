'use client'

import { useEffect, useState } from 'react'
import { Trash2, Mail, Loader } from 'lucide-react'

interface Message {
  id: number
  name: string
  email: string
  subject: string
  message: string
  created_at: string
}

interface Props {
  showToast: (msg: string) => void
}

const cardClass =
  'bg-[#0f121d]/60 backdrop-blur border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors'
const btnDanger = 'p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors shrink-0'

export default function MessagesTab({ showToast }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/messages')
      .then((r) => r.json())
      .then((d) => setMessages(d))
      .catch(() => showToast('Failed to load messages'))
      .finally(() => setLoading(false))
  }, [])

  const deleteMessage = async (id: number) => {
    await fetch('/api/admin/messages', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setMessages(messages.filter((m) => m.id !== id))
    showToast('Message deleted')
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <Loader className="w-4 h-4 animate-spin" /> Loading messages...
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-gray-500">
        <Mail className="w-10 h-10" />
        <p className="text-sm">No messages yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-500 font-mono">
        {messages.length} message{messages.length !== 1 ? 's' : ''}
      </p>
      {messages.map((m) => (
        <div key={m.id} className={cardClass + ' flex flex-col gap-3'}>
          <div className="flex items-start justify-between gap-4">
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
            <button onClick={() => deleteMessage(m.id)} className={btnDanger}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm text-gray-400 font-semibold">{m.subject}</div>
          <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{m.message}</p>
        </div>
      ))}
    </div>
  )
}
