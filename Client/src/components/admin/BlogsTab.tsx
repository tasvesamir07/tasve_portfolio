'use client'

import { Trash2, Save } from 'lucide-react'

interface BlogData {
  id?: number
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string
  tags: string
  published: boolean
  read_time: string
}

interface Props {
  blogs: BlogData[]
  saving: boolean
  onAdd: () => void
  onUpdate: (idx: number, blog: BlogData) => void
  onDelete: (idx: number) => void
  onSave: () => void
}

export default function BlogsTab({ blogs, saving, onAdd, onUpdate, onDelete, onSave }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Blog Articles</h2>
        <div className="flex gap-2">
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg text-sm font-semibold hover:bg-cyan-500/20 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Article
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg text-sm font-semibold hover:bg-cyan-500/20 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {blogs.map((blog, idx) => (
          <div
            key={idx}
            className="bg-glass-bg border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors duration-200"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  placeholder="Article Title"
                  value={blog.title}
                  onChange={(e) => onUpdate(idx, { ...blog, title: e.target.value })}
                  className="w-full bg-transparent border border-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
                />
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="slug (e.g., my-first-article)"
                    value={blog.slug}
                    onChange={(e) => onUpdate(idx, { ...blog, slug: e.target.value })}
                    className="flex-1 bg-transparent border border-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Read time (e.g., 5 min read)"
                    value={blog.read_time}
                    onChange={(e) => onUpdate(idx, { ...blog, read_time: e.target.value })}
                    className="w-36 bg-transparent border border-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors font-mono"
                  />
                </div>
                <textarea
                  placeholder="Short excerpt for the card preview..."
                  value={blog.excerpt}
                  onChange={(e) => onUpdate(idx, { ...blog, excerpt: e.target.value })}
                  rows={2}
                  className="w-full bg-transparent border border-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors resize-none"
                />
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Tags (comma-separated)"
                    value={blog.tags}
                    onChange={(e) => onUpdate(idx, { ...blog, tags: e.target.value })}
                    className="flex-1 bg-transparent border border-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Cover image URL"
                    value={blog.cover_image}
                    onChange={(e) => onUpdate(idx, { ...blog, cover_image: e.target.value })}
                    className="flex-1 bg-transparent border border-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-gray-400">
                    <input
                      type="checkbox"
                      checked={blog.published}
                      onChange={(e) => onUpdate(idx, { ...blog, published: e.target.checked })}
                      className="accent-cyan-400"
                    />
                    Published
                  </label>
                </div>
                <textarea
                  placeholder="Article content (Markdown-style: ## for headings, blank lines for paragraphs)"
                  value={blog.content}
                  onChange={(e) => onUpdate(idx, { ...blog, content: e.target.value })}
                  rows={12}
                  className="w-full bg-transparent border border-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors resize-y font-mono"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onDelete(idx)}
                  className="p-2 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                  aria-label="Delete article"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}