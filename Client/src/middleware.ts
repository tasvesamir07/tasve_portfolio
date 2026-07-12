import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { validateSessionToken } from '@/lib/session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/api/admin') || pathname.startsWith('/api/admin/auth')) {
    return NextResponse.next()
  }

  const token = request.cookies.get('admin_token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const adminPassword = process.env.ADMIN_PASSWORD
    const isValid = adminPassword ? await validateSessionToken(token, adminPassword) : false
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  } catch (err) {
    console.error('Proxy auth error:', err)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/admin/:path*',
}
