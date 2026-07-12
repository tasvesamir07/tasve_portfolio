import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { LoginSchema } from '@/lib/validation'
import { checkRateLimit } from '@/lib/rate-limit'
import { createSessionToken, validateSessionToken } from '@/lib/session'
import { hashPassword, verifyPassword } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

async function ensureAdminExists(supabase: ReturnType<typeof getSupabaseAdmin>) {
  const { data: existing } = await supabase.from('admins').select('id').limit(1)
  if (existing && existing.length > 0) return

  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) return

  const password_hash = hashPassword(adminPassword)
  await supabase
    .from('admins')
    .insert({
      username: process.env.ADMIN_USERNAME || 'admin',
      password_hash,
      display_name: 'Admin',
      email: process.env.SMTP_USER || '',
    })
    .maybeSingle()
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const { allowed } = checkRateLimit(`auth:${ip}`, 5, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
  }

  const parsed = LoginSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { username, password } = parsed.data
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  try {
    const supabase = getSupabaseAdmin()
    await ensureAdminExists(supabase)

    const { data: admins } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username.toLowerCase().trim())
      .limit(1)

    if (!admins || admins.length === 0) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    if (!verifyPassword(password, admins[0].password_hash)) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    const token = await createSessionToken(adminPassword)
    const cookieStore = await cookies()
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Auth POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!token || !adminPassword) {
    return NextResponse.json({ authenticated: false })
  }

  try {
    const authenticated = await validateSessionToken(token, adminPassword)
    if (!authenticated) {
      return NextResponse.json({ authenticated: false })
    }

    const supabase = getSupabaseAdmin()
    const { data: admins } = await supabase
      .from('admins')
      .select('username, display_name, email')
      .limit(1)

    return NextResponse.json({
      authenticated: true,
      username: admins?.[0]?.username || 'admin',
      display_name: admins?.[0]?.display_name || 'Admin',
      email: admins?.[0]?.email || '',
    })
  } catch (err) {
    console.error('Auth GET error:', err)
    return NextResponse.json({ authenticated: false })
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return NextResponse.json({ success: true })
}
