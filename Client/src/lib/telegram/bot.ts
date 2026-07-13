import { Bot } from 'grammy'
import { BOT_TOKEN } from './config'
import { isAuthorized, getConversation } from './store'
import { handleVerificationStart } from './handlers/auth'
import { registerHandlers, handleFallback } from './handlers'

let _bot: Bot | null = null

export function getBot(): Bot {
  if (_bot) return _bot

  if (!BOT_TOKEN) {
    throw new Error('Missing TELEGRAM_BOT_TOKEN environment variable')
  }

  const bot = new Bot(BOT_TOKEN)

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
