import type { Context } from 'grammy'
import { InlineKeyboard } from 'grammy'
import { getSupabaseAdmin } from '../config'
import { getConversation, setConversation, clearConversation } from '../store'
import { formatSkillGroup } from '../formats'
import { confirmKB, cancelKB, genericFieldKB } from '../keyboards'
import { SkillSchema } from '@/lib/validation'
import { revalidateHome } from '@/lib/revalidate'

export async function handleSkillCommand(ctx: Context) {
  const text = ctx.message?.text || ''
  const args = text.split(' ').slice(1)
  const sub = args[0]

  if (sub === 'add') {
    const rawParams = text.substring(text.indexOf('add') + 3).trim()
    if (!rawParams) {
      await ctx.reply('❌ Usage: `/skill add Name | Value | Category | [Icon]`', { parse_mode: 'Markdown' })
      return
    }

    const parts = rawParams.split('|').map((p) => p.trim())
    if (parts.length < 3) {
      await ctx.reply('❌ Invalid format. Requires at least Name, Value, and Category separated by pipes (`|`).\n\nExample:\n`/skill add React | 92 | Frameworks & Libraries | SiReact`', { parse_mode: 'Markdown' })
      return
    }

    const name = parts[0]
    const value = parseInt(parts[1], 10)
    const category = parts[2]
    const icon = parts[3] || ''

    const parsed = SkillSchema.safeParse({ name, value, category, icon })
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n')
      await ctx.reply(`❌ Validation failed:\n${errorMsg}`)
      return
    }

    const supabase = getSupabaseAdmin()
    
    // Get next sort_order
    const { count } = await supabase.from('skills').select('*', { count: 'exact', head: true })
    const sortOrder = count || 0

    const { error } = await supabase.from('skills').insert({ ...parsed.data, sort_order: sortOrder })
    if (error) {
      await ctx.reply(`❌ Failed to insert skill: ${error.message}`)
      return
    }

    revalidateHome()
    await ctx.reply(`✅ Added skill *${name}* under category *${category}*!`, { parse_mode: 'Markdown' })
    return
  }

  if (sub === 'edit') {
    const id = args[1]
    if (!id) {
      await ctx.reply('❌ Please specify a skill ID: `/skill edit <id>`', { parse_mode: 'Markdown' })
      return
    }
    await showEditFields(ctx, id)
    return
  }

  if (sub === 'delete') {
    const id = args[1]
    if (!id) {
      await ctx.reply('❌ Please specify a skill ID: `/skill delete <id>`', { parse_mode: 'Markdown' })
      return
    }
    await ctx.reply(`⚠️ Are you sure you want to delete skill ID *${id}*?`, {
      parse_mode: 'Markdown',
      reply_markup: confirmKB('skill_delete', id),
    })
    return
  }

  // Default: list all skills
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true })
  
  if (error) {
    await ctx.reply(`❌ Failed to retrieve skills: ${error.message}`)
    return
  }

  if (!data || data.length === 0) {
    await ctx.reply('📊 No skills found. Type `/skill add Name | Value | Category | Icon` to add one.', { parse_mode: 'Markdown' })
    return
  }

  const output = formatSkillGroup(data)
  await ctx.reply(output, { parse_mode: 'Markdown' })
}

async function showEditFields(ctx: Context, id: string | number) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('skills').select('*').eq('id', id).maybeSingle()
  if (error || !data) {
    await ctx.reply('❌ Skill not found.')
    return
  }

  const msg = `📊 *Skill Details*
*Name:* ${data.name}
*Value:* ${data.value}%
*Category:* ${data.category}
*Icon:* ${data.icon || 'None'}
*Sort Order:* ${data.sort_order ?? 0}
🆔 ID: \`${data.id}\``

  const keyboard = genericFieldKB('skill', id, ['name', 'value', 'category', 'icon'])
  await ctx.reply(msg, {
    parse_mode: 'Markdown',
    reply_markup: keyboard,
  })
}

export async function handleSkillEditStep(ctx: Context, data: Record<string, any>) {
  const chatId = ctx.chat!.id
  const text = ctx.message?.text || ''
  const id = data.id
  const field = data.field

  let val: any = text
  if (field === 'value') {
    val = parseInt(text, 10)
    if (isNaN(val) || val < 0 || val > 100) {
      await ctx.reply('❌ Value must be an integer between 0 and 100. Enter again:')
      return
    }
  }

  if (!text.trim() && field !== 'icon') {
    await ctx.reply('❌ Value cannot be empty. Please enter the new value:')
    return
  }

  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('skills')
    .update({ [field]: val })
    .eq('id', id)
  
  if (error) {
    await ctx.reply(`❌ Failed to update skill: ${error.message}`)
    return
  }

  revalidateHome()
  await clearConversation(chatId)
  await ctx.reply(`✅ Successfully updated skill *${field}* for ID *${id}*.`, { parse_mode: 'Markdown' })
}

// Action dispatcher
export async function handleSkillCallback(ctx: Context, action: string) {
  const chatId = ctx.chat!.id

  // Start edit field prompt
  if (action.startsWith('field_')) {
    const parts = action.replace('field_', '').split('_')
    const field = parts[0]
    const id = parts[1]
    
    await setConversation(chatId, 'skill_edit', 0, { id, field })
    await ctx.reply(`✏️ Please send the new value for *${field}*:`, {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    await ctx.answerCallbackQuery()
    return
  }

  // Confirm delete
  if (action.startsWith('delete_yes_')) {
    const id = action.replace('delete_yes_', '')
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('skills').delete().eq('id', id)
    if (error) {
      await ctx.editMessageText(`❌ Failed to delete skill ID *${id}*: ${error.message}`, { parse_mode: 'Markdown' })
    } else {
      revalidateHome()
      await ctx.editMessageText(`✅ Deleted skill ID *${id}* successfully.`, { parse_mode: 'Markdown' })
    }
    await ctx.answerCallbackQuery()
    return
  }

  if (action.startsWith('delete_no_')) {
    const id = action.replace('delete_no_', '')
    await ctx.editMessageText(`❌ Deletion of skill ID *${id}* cancelled.`, { parse_mode: 'Markdown' })
    await ctx.answerCallbackQuery()
    return
  }
}
