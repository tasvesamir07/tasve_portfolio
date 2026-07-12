import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabaseAdmin = getSupabaseAdmin()
  const { id } = await params
  const body = await req.json()
  const { id: _, created_at: __, ...updateData } = body
  const { error } = await supabaseAdmin.from('projects').update({ ...updateData, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabaseAdmin = getSupabaseAdmin()
  const { id } = await params
  const { error } = await supabaseAdmin.from('projects').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
