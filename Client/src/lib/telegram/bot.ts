import { Bot } from 'grammy'
import { resolveBotToken } from './config'
import { isAuthorized, getConversation, verifyPhone, authorizeChat, clearConversation } from './store'
import { handleVerificationStart } from './handlers/auth'
import { registerHandlers, handleFallback } from './handlers'
import { mainMenuKB } from './keyboards'

let _bot: Bot | null = null

export async function getBot(): Promise<Bot> {
  if (_bot) return _bot

  const token = await resolveBotToken()
  if (!token) {
    throw new Error('Telegram Bot Token is not configured (missing in process.env.TELEGRAM_BOT_TOKEN and profile settings)')
  }

  const bot = new Bot(token)

  // Initialize bot details (fetches bot info via getMe to enable update processing)
  await bot.init()

  // Authorization Guard Middleware
  bot.use(async (ctx, next) => {
    // We only guard private chat operations
    if (ctx.chat?.type !== 'private') {
      return // Ignore non-private message updates (groups, channels)
    }

    const chatId = ctx.chat.id

    // Check database for authorized chat ID
    const authorized = await isAuthorized(chatId)
    if (authorized) {
      return next()
    }

    // Check if user is currently in verification flow
    const state = await getConversation(chatId)
    if (state?.command === 'verify') {
      return next()
    }

    // Otherwise, start phone verification
    await handleVerificationStart(ctx)
  })

  // Handle shared contacts during verification
  bot.on('message:contact', async (ctx) => {
    const chatId = ctx.chat!.id
    const authorized = await isAuthorized(chatId)
    if (authorized) {
      await ctx.reply('✅ You are already verified!', {
        reply_markup: mainMenuKB(),
      })
      return
    }

    const state = await getConversation(chatId)
    if (state?.command !== 'verify') {
      await ctx.reply('🔒 Send /start to begin verification.')
      return
    }

    const contact = ctx.message.contact
    // Verify that the shared contact belongs to the sender
    if (contact.user_id && contact.user_id !== ctx.from?.id) {
      await ctx.reply('❌ You must share your own contact to verify.')
      return
    }

    const phone = contact.phone_number
    const isMatch = await verifyPhone(phone)
    if (isMatch) {
      const success = await authorizeChat(chatId)
      if (success) {
        await clearConversation(chatId)
        await ctx.reply('🎉 Identity verified successfully! Welcome, Admin.', {
          reply_markup: mainMenuKB(),
        })
      } else {
        await ctx.reply('❌ Failed to authorize this chat ID in the database. Please try again.')
      }
    } else {
      await ctx.reply(`❌ Phone number (${phone}) does not match the configured admin phone number. Please update it in the settings panel or try again.`)
    }
  })

  // Register bot commands and callbacks
  registerHandlers(bot)

  // Catch-all handler for wizard inputs and unrecognized messages
  bot.on('message', handleFallback)

  _bot = bot
  return bot
}
