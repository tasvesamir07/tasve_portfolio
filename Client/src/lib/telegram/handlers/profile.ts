import type { Context } from 'grammy'
import { getSupabaseAdmin } from '../config'
import { getConversation, setConversation, clearConversation } from '../store'
import { formatProfile } from '../formats'
import { confirmKB, cancelKB, profileFieldKB } from '../keyboards'
import { handlePhotoUpload } from './upload'
import { ProfileSchema } from '@/lib/validation'
import { revalidateHome } from '@/lib/revalidate'

export async function handleProfileCommand(ctx: Context) {
  const text = ctx.message?.text || ''
  const args = text.split(' ').slice(1)
  const sub = args[0]

  if (sub === 'edit') {
    await ctx.reply('👤 Select the profile field you want to edit:', {
      reply_markup: profileFieldKB(),
    })
    return
  }

  if (sub === 'avatar') {
    await setConversation(ctx.chat!.id, 'profile_avatar', 0, {})
    await ctx.reply('👤 *Update Avatar*\n\nPlease upload/send the new avatar photo:', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  if (sub === 'phone') {
    await setConversation(ctx.chat!.id, 'profile_phone', 0, {})
    await ctx.reply('👤 *Update Verification Phone*\n\nEnter the new admin phone number (digits only, including country code, e.g. `+8801XXXXXXXXX`):', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  // Default: show profile card
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('profile').select('*').eq('id', 1).maybeSingle()
  if (error || !data) {
    await ctx.reply(`❌ Failed to retrieve profile: ${error?.message || 'Profile record id 1 not found.'}`)
    return
  }

  await ctx.reply(formatProfile(data), { parse_mode: 'Markdown' })
}

// Conversation step processors
export async function handleProfileConversation(ctx: Context, command: string, data: Record<string, any>) {
  const chatId = ctx.chat!.id
  const text = ctx.message?.text || ''
  const supabase = getSupabaseAdmin()

  if (command === 'profile_edit') {
    const field = data.field
    let val: any = text.trim()

    // Validate using ProfileSchema partial validation
    const parsed = ProfileSchema.partial().safeParse({ [field]: val })
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n')
      await ctx.reply(`❌ Validation failed:\n${errorMsg}\n\nPlease try again:`)
      return
    }

    const { error } = await supabase
      .from('profile')
      .update({ [field]: val, updated_at: new Date().toISOString() })
      .eq('id', 1)

    if (error) {
      await ctx.reply(`❌ Failed to update profile: ${error.message}`)
      return
    }

    revalidateHome()
    await clearConversation(chatId)
    await ctx.reply(`✅ Successfully updated profile field *${field}*.`, { parse_mode: 'Markdown' })
    return
  }

  if (command === 'profile_avatar') {
    if (!ctx.message?.photo) {
      await ctx.reply('❌ Please send a photo for the avatar, or type /cancel to abort:')
      return
    }

    try {
      await ctx.reply('⏳ Uploading avatar to storage...')
      const { data: profile } = await supabase.from('profile').select('avatar').eq('id', 1).single()
      const imageUrl = await handlePhotoUpload(ctx, profile?.avatar)
      
      const { error } = await supabase
        .from('profile')
        .update({ avatar: imageUrl, updated_at: new Date().toISOString() })
        .eq('id', 1)

      if (error) {
        await ctx.reply(`❌ Failed to update avatar in database: ${error.message}`)
        return
      }

      revalidateHome()
      await clearConversation(chatId)
      await ctx.reply('✅ Successfully updated profile avatar!')
    } catch (err: any) {
      await ctx.reply(`❌ Avatar upload failed: ${err.message}. Please send the image again:`)
    }
    return
  }

  if (command === 'profile_phone') {
    if (!text.trim()) {
      await ctx.reply('❌ Phone number cannot be empty. Please enter phone:')
      return
    }

    const { error } = await supabase
      .from('profile')
      .update({ phone: text.trim(), updated_at: new Date().toISOString() })
      .eq('id', 1)

    if (error) {
      await ctx.reply(`❌ Failed to update phone number in database: ${error.message}`)
      return
    }

    await clearConversation(chatId)
    await ctx.reply(`✅ Successfully updated admin phone verification number to \`${text.trim()}\`.`, { parse_mode: 'Markdown' })
    return
  }
}

// Action dispatcher
export async function handleProfileCallback(ctx: Context, action: string) {
  const chatId = ctx.chat!.id

  if (action.startsWith('field_')) {
    const field = action.replace('field_', '')
    await setConversation(chatId, 'profile_edit', 0, { field })
    await ctx.reply(`✏️ Please send the new value for profile field *${field}*:`, {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    await ctx.answerCallbackQuery()
    return
  }
}
