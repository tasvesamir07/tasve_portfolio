import { getSupabaseAdmin } from '@/lib/supabase-admin'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''

if (!BOT_TOKEN) {
  console.warn('Warning: TELEGRAM_BOT_TOKEN is not set in environment variables.')
}

export { BOT_TOKEN, getSupabaseAdmin }
