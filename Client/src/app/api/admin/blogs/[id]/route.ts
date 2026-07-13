import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { BlogSchema } from '@/lib/validation'
import { revalidateHome } from '@/lib/revalidate'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = BlogSchema.partial().parse(body)
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('blogs')
      .update({ ...parsed, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    revalidateHome()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('blogs').delete().eq('id', id)
    if (error) throw error
    revalidateHome()
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 })
  }
}