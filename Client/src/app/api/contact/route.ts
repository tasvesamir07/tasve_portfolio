import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { ContactSchema } from '@/lib/validation'
import { checkRateLimit } from '@/lib/rate-limit'
import { notifyAdmin } from '@/lib/telegram/notify'

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const { allowed } = checkRateLimit(`contact:${ip}`, 3, 60_000)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many messages. Try again later.' }, { status: 429 })
    }

    const parsed = ContactSchema.safeParse(await req.json())
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const supabaseAdmin = getSupabaseAdmin()
    const { error } = await supabaseAdmin.from('contacts').insert(parsed.data)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    notifyAdmin(parsed.data).catch((err) => console.error('Telegram notify failed:', err))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
