import { NextResponse } from 'next/server'
import { getBot } from '@/lib/telegram/bot'

export async function GET(req: Request) {
  try {
    const bot = await getBot()
    
    // Dynamically check request headers to determine current domain, falling back to env site URL
    const host = req.headers.get('host')
    const proto = req.headers.get('x-forwarded-proto') || 'https'
    
    let targetUrl = ''
    if (host) {
      targetUrl = `${proto}://${host}/api/telegram/webhook`
    } else {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tasve.hepttech.com'
      targetUrl = `${siteUrl}/api/telegram/webhook`
    }

    console.log(`Configuring Telegram webhook to URL: ${targetUrl}`)
    await bot.api.setWebhook(targetUrl)
    
    return NextResponse.json({ ok: true, url: targetUrl })
  } catch (err: any) {
    console.error('Failed to configure Telegram webhook:', err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
