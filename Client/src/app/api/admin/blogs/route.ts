import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { BlogSchema } from '@/lib/validation'
import { revalidateHome } from '@/lib/revalidate'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = BlogSchema.parse(body)
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('blogs')
      .insert(parsed)
      .select()
      .single()
    if (error) throw error
    revalidateHome()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 })
  }
}