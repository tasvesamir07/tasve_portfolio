import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { EducationSchema } from '@/lib/validation'
import { revalidateHome } from '@/lib/revalidate'

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin.from('education').select('*').order('sort_order', { ascending: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    console.error('Education GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = EducationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin.from('education').insert(parsed.data).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    revalidateHome()
    return NextResponse.json(data)
  } catch (err) {
    console.error('Education POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
