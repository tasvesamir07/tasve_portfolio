import { Bot } from 'grammy'
import { resolveBotToken } from './config'
import { isAuthorized, getConversation } from './store'
import { handleVerificationStart } from './handlers/auth'
import { registerHandlers, handleFallback } from './handlers'

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

  // Register bot commands and callbacks
  registerHandlers(bot)

  // Catch-all handler for wizard inputs and unrecognized messages
  bot.on('message', handleFallback)

  _bot = bot
  return bot
}
