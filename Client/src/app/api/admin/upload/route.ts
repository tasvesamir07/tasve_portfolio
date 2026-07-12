import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`

    const { error } = await supabaseAdmin.storage.from('Media').upload(fileName, buffer, {
      contentType: file.type,
      upsert: true,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data: urlData } = supabaseAdmin.storage.from('Media').getPublicUrl(fileName)
    return NextResponse.json({ url: urlData.publicUrl })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
