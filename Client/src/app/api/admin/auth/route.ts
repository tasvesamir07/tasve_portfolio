import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { LoginSchema } from '@/lib/validation'
import { checkRateLimit } from '@/lib/rate-limit'
import { createSessionToken, validateSessionToken } from '@/lib/session'

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const { allowed, remaining } = checkRateLimit(`auth:${ip}`, 5, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
  }

  const parsed = LoginSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { password } = parsed.data
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword || password !== adminPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const token = createSessionToken(adminPassword)
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
    const authenticated = validateSessionToken(token, adminPassword)
    return NextResponse.json({ authenticated })
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
