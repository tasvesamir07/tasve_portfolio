import type { Context } from 'grammy'
import { verifyPhone, authorizeChat, clearConversation, setConversation } from '../store'

export async function handleVerificationStart(ctx: Context) {
  const chatId = ctx.chat?.id
  if (!chatId) return
  await setConversation(chatId, 'verify', 0, {})
  await ctx.reply('🔐 Please enter the admin phone number to verify this chat:')
}

export async function handleVerificationStep(ctx: Context, text: string) {
  const chatId = ctx.chat?.id
  if (!chatId) return
  const isMatch = await verifyPhone(text)
  if (isMatch) {
    const success = await authorizeChat(chatId)
    if (success) {
      await clearConversation(chatId)
      await ctx.reply('✅ Identity verified successfully! You are now authorized to manage the portfolio.\n\nUse /start to view all available commands.')
    } else {
      await ctx.reply('❌ Failed to authorize this chat ID in the database. Please try again.')
    }
  } else {
    await ctx.reply('❌ Invalid phone number. Please ensure it matches the admin profile phone number exactly (digits only or with country code, e.g. +8801XXXXXXXXX).\n\nTry again or send /cancel.')
  }
}
