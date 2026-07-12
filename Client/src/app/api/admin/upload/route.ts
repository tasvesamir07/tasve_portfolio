import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
]
const MAX_SIZE = 5 * 1024 * 1024

export async function POST(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    
    // Parse query params to look for an oldUrl to delete
    const { searchParams } = new URL(req.url)
    const oldUrl = searchParams.get('oldUrl')
    
    if (oldUrl) {
      try {
        if (oldUrl.includes('supabase.co/storage/v1/object/public/Media/')) {
          const oldFileName = oldUrl.split('/').pop()
          if (oldFileName) {
            const { error: deleteError } = await supabaseAdmin.storage
              .from('Media')
              .remove([oldFileName])
            if (deleteError) {
              console.error('Failed to delete old file:', deleteError.message)
            } else {
              console.log('Successfully deleted old file:', oldFileName)
            }
          }
        }
      } catch (err) {
        console.error('Error deleting old file:', err)
      }
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG, PDF' },
        { status: 400 },
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum 5MB allowed.' }, { status: 400 })
    }

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
  } catch (err) {
    console.error('Upload failed:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
