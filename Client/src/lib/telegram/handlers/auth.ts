import { Context } from 'grammy'
import { verifyPhone, authorizeChat, clearConversation, setConversation } from '../store'
import { requestPhoneKB } from '../keyboards'

export async function handleVerificationStart(ctx: Context) {
  const chatId = ctx.chat?.id
  if (!chatId) return
  await setConversation(chatId, 'verify', 0, {})
  await ctx.reply('🔐 *Security Check: Authorization Required*\n\nPlease click the button below to share your phone number, or type it manually to verify your identity:', {
    parse_mode: 'Markdown',
    reply_markup: requestPhoneKB(),
  })
}

export async function handleVerificationStep(ctx: Context, text: string) {
  const chatId = ctx.chat?.id
  if (!chatId) return
  const isMatch = await verifyPhone(text)
  if (isMatch) {
    const success = await authorizeChat(chatId)
    if (success) {
      await clearConversation(chatId)
      await ctx.reply('✅ Identity verified successfully! You are now authorized to manage the portfolio.', {
        reply_markup: { remove_keyboard: true },
      })
    } else {
      await ctx.reply('❌ Failed to authorize this chat ID in the database. Please try again.')
    }
  } else {
    await ctx.reply('❌ Invalid phone number. Please ensure it matches the admin profile phone number exactly (digits only or with country code, e.g. +8801XXXXXXXXX).\n\nTry again or send /cancel.')
  }
}
