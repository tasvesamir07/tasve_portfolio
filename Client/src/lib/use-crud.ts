'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { compressAndConvertToWebp } from '@/lib/image'

export interface CrudItem {
  id?: number
  sort_order?: number
}

function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

export async function uploadImage(file: File, oldUrl?: string): Promise<string> {
  const compressed = await compressAndConvertToWebp(file)
  const fd = new FormData()
  fd.append('file', compressed)
  
  let targetUrl = '/api/admin/upload'
  if (oldUrl) {
    targetUrl += `?oldUrl=${encodeURIComponent(oldUrl)}`
  }
  
  const res = await fetch(targetUrl, { method: 'POST', body: fd })
  if (!res.ok) throw new Error('Upload failed')
  const { url } = await res.json()
  return url
}

export function useCrud<T extends CrudItem>(
  table: string,
  defaults: Omit<T, 'id' | 'sort_order'>,
  options?: { saveMode?: 'batch' | 'individual' },
) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    fetch(`/api/admin/${table}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setItems(data || [])
        setLoading(false)
      })
  }, [table])

  useEffect(() => {
    load()
  }, [load])

  const addItem = async () => {
    const newItem = { ...defaults, sort_order: items.length } as unknown as T
    const res = await fetch(`/api/admin/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    })
    if (!res.ok) {
      toast('Failed to add')
      return
    }
    const saved = await res.json()
    setItems((prev) => [...prev, saved])
    toast(`${table.slice(0, -1)} added`)
  }

  const deleteItem = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/${table}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setItems((prev) => prev.filter((item) => item.id !== id))
      toast('Deleted')
    } catch {
      toast('Failed to delete')
    }
  }

  const moveItemHandler = (idx: number, direction: 'up' | 'down') => {
    const to = direction === 'up' ? idx - 1 : idx + 1
    if (to < 0 || to >= items.length) return
    setItems(moveItem(items, idx, to))
  }

  const saveAll = async () => {
    setSaving(true)
    const labeled = items.map((item, i) => ({ ...item, sort_order: i }))

    try {
      if (options?.saveMode === 'individual') {
        await Promise.all(
          labeled.map(async (item) => {
            const { id, ...rest } = item
            if (id) {
              return fetch(`/api/admin/${table}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rest),
              })
            }
            return fetch(`/api/admin/${table}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(rest),
            })
          }),
        )
        await load()
      } else {
        const res = await fetch('/api/admin/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ table, items: labeled.map(({ id, ...rest }) => ({ id, ...rest })) }),
        })
        if (!res.ok) throw new Error('Save failed')
      }
      toast('Saved')
    } catch {
      toast('Failed to save')
    }

    setSaving(false)
  }

  const handleImageUpload = async (idx: number, file: File) => {
    try {
      const oldUrl = (items[idx] as Record<string, unknown>)?.image as string | undefined
      const url = await uploadImage(file, oldUrl)
      setItems((prev) => {
        const updated = [...prev]
        updated[idx] = { ...updated[idx], image: url }
        return updated
      })
    } catch {
      toast('Image upload failed')
    }
  }

  return {
    items,
    setItems,
    loading,
    saving,
    addItem,
    deleteItem,
    moveItem: moveItemHandler,
    saveAll,
    handleImageUpload,
  }
}
