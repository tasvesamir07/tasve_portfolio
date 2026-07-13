import type { Bot, Context } from 'grammy'
import { getConversation, clearConversation } from '../store'
import { helpText } from '../formats'
import { mainMenuKB } from '../keyboards'

// Import all handlers
import { handleVerificationStep } from './auth'
import { handleBlogCommand, handleBlogCreateWizard, handleBlogEditStep, handleBlogCallback } from './blog'
import { handleProjectCommand, handleProjectCreateWizard, handleProjectEditStep, handleProjectCallback } from './project'
import { handleSkillCommand, handleSkillEditStep, handleSkillCallback } from './skill'
import { handleGalleryCommand, handleGalleryUploadWizard, handleGalleryCallback } from './gallery'
import { handleCertCommand, handleCertAddWizard, handleCertEditStep, handleCertCallback } from './cert'
import { handleProfileCommand, handleProfileConversation, handleProfileCallback } from './profile'
import { handleExperienceCommand, handleExperienceWizard, handleExperienceEditStep, handleExperienceCallback } from './experience'
import { handleEducationCommand, handleEducationWizard, handleEducationEditStep, handleEducationCallback } from './education'
import { handleMessagesCommand, handleMessagesCallback } from './messages'

export function registerHandlers(bot: Bot) {
  // Command mappings
  bot.command('start', async (ctx) => {
    await ctx.reply(`👋 Welcome to the *Portfolio Manager Bot*!
You can manage all sections of your website directly from Telegram.

${helpText()}`, {
      parse_mode: 'Markdown',
      reply_markup: mainMenuKB(),
    })
  })

  bot.command('cancel', async (ctx) => {
    const chatId = ctx.chat?.id
    if (chatId) {
      await clearConversation(chatId)
    }
    await ctx.reply('❌ Current operation has been cancelled.', {
      reply_markup: mainMenuKB(),
    })
  })

  // Keyboard button text listeners
  bot.hears('👤 Profile', handleProfileCommand)
  bot.hears('📝 Blogs', handleBlogCommand)
  bot.hears('🖥️ Projects', handleProjectCommand)
  bot.hears('📊 Skills', handleSkillCommand)
  bot.hears('🖼️ Gallery', handleGalleryCommand)
  bot.hears('🏅 Certs', handleCertCommand)
  bot.hears('💼 Exp', handleExperienceCommand)
  bot.hears('🎓 Edu', handleEducationCommand)
  bot.hears('📬 Messages', handleMessagesCommand)

  bot.command('profile', handleProfileCommand)
  bot.command('blog', handleBlogCommand)
  bot.command('project', handleProjectCommand)
  bot.command('skill', handleSkillCommand)
  bot.command('gallery', handleGalleryCommand)
  bot.command('cert', handleCertCommand)
  bot.command('experience', handleExperienceCommand)
  bot.command('education', handleEducationCommand)
  bot.command('messages', handleMessagesCommand)
  bot.command('message', handleMessagesCommand) // Alias

  // Global callback query dispatcher
  bot.on('callback_query:data', async (ctx) => {
    const data = ctx.callbackQuery.data
    
    if (data === 'cancel') {
      await clearConversation(ctx.chat!.id)
      await ctx.editMessageText('❌ Operation cancelled.')
      await ctx.answerCallbackQuery()
      return
    }

    const firstUnderscore = data.indexOf('_')
    if (firstUnderscore === -1) {
      await ctx.answerCallbackQuery()
      return
    }

    const prefix = data.substring(0, firstUnderscore)
    const action = data.substring(firstUnderscore + 1)

    try {
      if (prefix === 'blog') await handleBlogCallback(ctx, action)
      else if (prefix === 'project') await handleProjectCallback(ctx, action)
      else if (prefix === 'skill') await handleSkillCallback(ctx, action)
      else if (prefix === 'gallery') await handleGalleryCallback(ctx, action)
      else if (prefix === 'cert') await handleCertCallback(ctx, action)
      else if (prefix === 'profile') await handleProfileCallback(ctx, action)
      else if (prefix === 'exp') await handleExperienceCallback(ctx, action)
      else if (prefix === 'edu') await handleEducationCallback(ctx, action)
      else if (prefix === 'msg') await handleMessagesCallback(ctx, action)
      else {
        await ctx.answerCallbackQuery()
      }
    } catch (err: any) {
      console.error(`Callback error [${prefix}]:`, err)
      await ctx.reply(`❌ Callback execution error: ${err.message}`)
      await ctx.answerCallbackQuery()
    }
  })
}

// Fallback message dispatcher for handling ongoing conversations/wizard steps
export async function handleFallback(ctx: Context) {
  const chatId = ctx.chat?.id
  if (!chatId) return

  const state = await getConversation(chatId)
  if (!state) {
    await ctx.reply('❓ Command not recognized. Send /start to view all available commands.')
    return
  }

  const { command, step, data } = state
  const text = ctx.message?.text || ''

  try {
    if (command === 'verify') {
      await handleVerificationStep(ctx, text)
    } else if (command === 'blog_create') {
      await handleBlogCreateWizard(ctx, step, data)
    } else if (command === 'blog_edit') {
      await handleBlogEditStep(ctx, data)
    } else if (command === 'project_create') {
      await handleProjectCreateWizard(ctx, step, data)
    } else if (command === 'project_edit') {
      await handleProjectEditStep(ctx, data)
    } else if (command === 'skill_edit') {
      await handleSkillEditStep(ctx, data)
    } else if (command === 'gallery_upload') {
      await handleGalleryUploadWizard(ctx, step, data)
    } else if (command === 'cert_add') {
      await handleCertAddWizard(ctx, step, data)
    } else if (command === 'cert_edit') {
      await handleCertEditStep(ctx, data)
    } else if (['profile_edit', 'profile_avatar', 'profile_phone'].includes(command)) {
      await handleProfileConversation(ctx, command, data)
    } else if (command === 'exp_create') {
      await handleExperienceWizard(ctx, step, data)
    } else if (command === 'exp_edit') {
      await handleExperienceEditStep(ctx, data)
    } else if (command === 'edu_create') {
      await handleEducationWizard(ctx, step, data)
    } else if (command === 'edu_edit') {
      await handleEducationEditStep(ctx, data)
    } else {
      await clearConversation(chatId)
      await ctx.reply('❌ Invalid conversation state. Discarded.')
    }
  } catch (err: any) {
    console.error(`Wizard error [${command}]:`, err)
    await ctx.reply(`❌ Operation wizard error: ${err.message}. Operation aborted.`)
    await clearConversation(chatId)
  }
}
