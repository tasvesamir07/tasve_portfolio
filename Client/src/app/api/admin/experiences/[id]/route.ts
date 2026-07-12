import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { ExperienceSchema } from '@/lib/validation'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const parsed = ExperienceSchema.partial().safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const supabaseAdmin = getSupabaseAdmin()
  const { id } = await params
  const { error } = await supabaseAdmin.from('experiences').update({ ...parsed.data, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabaseAdmin = getSupabaseAdmin()
  const { id } = await params
  const { error } = await supabaseAdmin.from('experiences').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
