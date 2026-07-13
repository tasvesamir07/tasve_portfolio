import { getBot } from './bot'
import { getSupabaseAdmin } from './config'

export async function notifyAdmin(body: {
  name: string
  email: string
  subject: string
  message: string
}): Promise<void> {
  try {
    const supabase = getSupabaseAdmin()
    const { data: admins, error } = await supabase
      .from('authorized_chat_ids')
      .select('chat_id')
    
    if (error) {
      console.error('Failed to load authorized admins for Telegram notifications:', error)
      return
    }

    if (!admins || admins.length === 0) {
      return
    }

    const bot = await getBot()
    const truncatedMsg = body.message.length > 3000 ? body.message.substring(0, 3000) + '...' : body.message

    const text = `📬 *New Portfolio Contact Message*

👤 *From:* ${body.name}
✉️ *Email:* ${body.email}
📝 *Subject:* ${body.subject}

💬 *Message:*
${truncatedMsg}`

    // Push notification to all verified admins
    await Promise.all(
      admins.map(async (admin) => {
        try {
          await bot.api.sendMessage(admin.chat_id, text, { parse_mode: 'Markdown' })
        } catch (err) {
          // Log and suppress individual user delivery errors (e.g. user blocked bot)
          console.warn(`Could not deliver Telegram notification to chat ${admin.chat_id}:`, err)
        }
      })
    )
  } catch (err) {
    console.error('notifyAdmin top-level error:', err)
  }
}
