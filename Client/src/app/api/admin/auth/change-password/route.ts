import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { hashPassword, verifyPassword } from '@/lib/auth'

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
})

export async function POST(req: Request) {
  try {
    const parsed = ChangePasswordSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request. New password must be at least 6 characters.' }, { status: 400 })
    }

    const { currentPassword, newPassword } = parsed.data
    const supabase = getSupabaseAdmin()

    const { data: admins } = await supabase.from('admins').select('*').limit(1)
    if (!admins || admins.length === 0) {
      return NextResponse.json({ error: 'No admin account found' }, { status: 404 })
    }

    const admin = admins[0]
    if (!verifyPassword(currentPassword, admin.password_hash)) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
    }

    const password_hash = hashPassword(newPassword)
    const { error } = await supabase
      .from('admins')
      .update({ password_hash, updated_at: new Date().toISOString() })
      .eq('id', admin.id)

    if (error) {
      console.error('Change password DB error:', error)
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Change password error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
