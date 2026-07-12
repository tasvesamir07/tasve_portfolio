import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { storeOTP } from '@/lib/otp'
import { sendOTPEmail } from '@/lib/email'
import { checkRateLimit } from '@/lib/rate-limit'

const SendOTPSchema = z.object({
  username: z.string().min(1),
})

function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@')
  if (!localPart || !domain) return email
  if (localPart.length <= 4) {
    return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`
  }
  const first = localPart.slice(0, 2)
  const last = localPart.slice(-4)
  return `${first}******${last}@${domain}`
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const { allowed } = checkRateLimit(`send-otp:${ip}`, 3, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
  }

  try {
    const parsed = SendOTPSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { username } = parsed.data
    const supabase = getSupabaseAdmin()

    const input = username.toLowerCase().trim()
    const { data: admins } = await supabase
      .from('admins')
      .select('id, email, username')
      .or(`username.eq.${input},email.eq.${input}`)
      .limit(1)

    if (!admins || admins.length === 0 || !admins[0].email) {
      return NextResponse.json({ error: 'Admin username or email not found.' }, { status: 404 })
    }

    const admin = admins[0]
    const otp = await storeOTP(admin.id)
    if (!otp) {
      return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 })
    }

    const sent = await sendOTPEmail(admin.email, otp.code)
    if (!sent) {
      return NextResponse.json(
        { error: 'SMTP is not configured. Set SMTP_USER and SMTP_PASS env vars.' },
        { status: 500 },
      )
    }

    const masked = maskEmail(admin.email)
    return NextResponse.json({
      success: true,
      otp_id: otp.id,
      email: masked,
      message: `OTP sent to your registered email: ${masked}`,
    })
  } catch (err) {
    console.error('Send OTP error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
