import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/api/admin') || pathname.startsWith('/api/admin/auth')) {
    return NextResponse.next()
  }

  const token = request.cookies.get('admin_token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const decoded = Buffer.from(token, 'base64').toString('ascii')
    const storedPassword = decoded.split(':')[0]
    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword || storedPassword !== adminPassword) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/admin/:path*',
}
