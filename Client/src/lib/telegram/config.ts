import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function resolveBotToken(): Promise<string> {
  // Try environment variable first
  const envToken = process.env.TELEGRAM_BOT_TOKEN
  if (envToken) return envToken

  // Otherwise, retrieve token dynamically from profile settings row (id = 1)
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('profile')
    .select('telegram_bot_token')
    .eq('id', 1)
    .maybeSingle()
  
  if (error || !data) {
    console.warn('Telegram Bot Token not found in profile table:', error?.message)
    return ''
  }
  return data.telegram_bot_token || ''
}

export { getSupabaseAdmin }
