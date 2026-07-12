import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { hashPassword } from '@/lib/auth'
import { verifyOTP } from '@/lib/otp'
import { checkRateLimit } from '@/lib/rate-limit'

const ResetPasswordSchema = z.object({
  username: z.string().min(1),
  otp: z.string().length(6),
  newPassword: z.string().min(6),
})

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const { allowed } = checkRateLimit(`reset:${ip}`, 5, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
  }

  try {
    const parsed = ResetPasswordSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request. New password must be at least 6 characters.' }, { status: 400 })
    }

    const { username, otp, newPassword } = parsed.data
    const supabase = getSupabaseAdmin()

    const { data: admins } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username.toLowerCase().trim())
      .limit(1)

    if (!admins || admins.length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const admin = admins[0]
    const isValid = await verifyOTP(admin.id, otp)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 })
    }

    const password_hash = hashPassword(newPassword)
    const { error } = await supabase
      .from('admins')
      .update({ password_hash, updated_at: new Date().toISOString() })
      .eq('id', admin.id)

    if (error) {
      console.error('Reset password DB error:', error)
      return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Password reset successfully.' })
  } catch (err) {
    console.error('Reset password error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
