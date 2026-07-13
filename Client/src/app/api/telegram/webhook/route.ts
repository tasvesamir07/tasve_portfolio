import { NextResponse } from 'next/server'
import { getBot } from '@/lib/telegram/bot'

export async function POST(req: Request) {
  try {
    const bot = await getBot()
    const body = await req.json()
    
    // grammY handles parsing and routing internally
    await bot.handleUpdate(body)
    
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Telegram Webhook error:', err)
    // Return status 200 to prevent Telegram from retrying failed updates repeatedly
    return NextResponse.json({ ok: false, error: 'Internal webhook handler error' }, { status: 200 })
  }
}
