import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const ALLOWED_TABLES = ['projects', 'skills', 'experiences'] as const

export async function POST(req: Request) {
  try {
    const { table, items } = await req.json()
    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    for (const item of items) {
      const { id, ...data } = item
      if (id) {
        const { error } = await supabaseAdmin.from(table).update({ ...data, updated_at: new Date().toISOString() }).eq('id', id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Batch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
