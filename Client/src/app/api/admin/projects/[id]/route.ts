import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { ProjectSchema } from '@/lib/validation'
import { revalidateHome } from '@/lib/revalidate'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const parsed = ProjectSchema.partial().safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const supabaseAdmin = getSupabaseAdmin()
    const { id } = await params
    const { error } = await supabaseAdmin.from('projects').update({ ...parsed.data, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    revalidateHome()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Project PUT error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { id } = await params
    const { error } = await supabaseAdmin.from('projects').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    revalidateHome()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Project DELETE error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
