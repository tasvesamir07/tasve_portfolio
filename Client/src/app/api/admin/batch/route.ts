import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { revalidateHome } from '@/lib/revalidate'

const ALLOWED_TABLES = ['projects', 'skills', 'experiences', 'certifications', 'gallery'] as const

export async function POST(req: Request) {
  try {
    const { table, items } = await req.json()
    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    for (const item of items) {
      if (!item || typeof item !== 'object') {
        return NextResponse.json({ error: 'Each item must be an object' }, { status: 400 })
      }
      if ('id' in item && item.id !== null && item.id !== undefined && typeof item.id !== 'number') {
        return NextResponse.json({ error: 'Item id must be a number if present' }, { status: 400 })
      }
      const { id, created_at, updated_at, ...data } = item
      if (id) {
        const updatePayload: any = { ...data }
        if (!['skills', 'gallery'].includes(table)) {
          updatePayload.updated_at = new Date().toISOString()
        }
        const { error } = await supabaseAdmin.from(table).update(updatePayload).eq('id', id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      } else {
        const { error } = await supabaseAdmin.from(table).insert(data)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    revalidateHome()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Batch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
