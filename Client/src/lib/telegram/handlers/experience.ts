import type { Context } from 'grammy'
import { InlineKeyboard } from 'grammy'
import { getSupabaseAdmin } from '../config'
import { getConversation, setConversation, clearConversation } from '../store'
import { formatExperience, formatExperienceList } from '../formats'
import { confirmKB, cancelKB, genericFieldKB } from '../keyboards'
import { revalidateHome } from '@/lib/revalidate'

export async function handleExperienceCommand(ctx: Context) {
  const text = ctx.message?.text || ''
  const args = text.split(' ').slice(1)
  const sub = args[0]

  if (sub === 'create') {
    await setConversation(ctx.chat!.id, 'exp_create', 0, {})
    await ctx.reply('💼 *Add Experience* (Step 1/4)\n\nEnter the job/position title:', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  if (sub === 'edit') {
    const id = args[1]
    if (!id) {
      await ctx.reply('❌ Please specify an experience ID: `/experience edit <id>`', { parse_mode: 'Markdown' })
      return
    }
    await showEditFields(ctx, id)
    return
  }

  if (sub === 'delete') {
    const id = args[1]
    if (!id) {
      await ctx.reply('❌ Please specify an experience ID: `/experience delete <id>`', { parse_mode: 'Markdown' })
      return
    }
    await ctx.reply(`⚠️ Are you sure you want to delete experience ID *${id}*?`, {
      parse_mode: 'Markdown',
      reply_markup: confirmKB('exp_delete', id),
    })
    return
  }

  // Default: list all experiences
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .order('sort_order', { ascending: true })
  
  if (error) {
    await ctx.reply(`❌ Failed to retrieve experiences: ${error.message}`)
    return
  }

  if (!data || data.length === 0) {
    await ctx.reply('💼 No experiences found. Type `/experience create` to add one.', { parse_mode: 'Markdown' })
    return
  }

  await ctx.reply('💼 *Work History:*', { parse_mode: 'Markdown' })
  for (const item of data) {
    const keyboard = new InlineKeyboard()
      .text('✏️ Edit', `exp_btn_edit_${item.id}`)
      .text('🗑️ Delete', `exp_btn_del_${item.id}`)
    
    await ctx.reply(`*${item.title}* @ ${item.company} (${item.date})\n(ID: \`${item.id}\` | Order: ${item.sort_order ?? 0})`, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    })
  }
}

async function showEditFields(ctx: Context, id: string | number) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('experiences').select('*').eq('id', id).maybeSingle()
  if (error || !data) {
    await ctx.reply('❌ Experience item not found.')
    return
  }

  const keyboard = genericFieldKB('exp', id, ['title', 'company', 'date', 'desc'])
  await ctx.reply(formatExperience(data), {
    parse_mode: 'Markdown',
    reply_markup: keyboard,
  })
}

// Conversation step processors
export async function handleExperienceWizard(ctx: Context, step: number, data: Record<string, any>) {
  const chatId = ctx.chat!.id
  const text = ctx.message?.text || ''

  if (step === 0) {
    if (!text.trim()) {
      await ctx.reply('❌ Title cannot be empty. Enter job title:')
      return
    }
    const updated = { ...data, title: text }
    await setConversation(chatId, 'exp_create', 1, updated)
    await ctx.reply('💼 *Step 2/4: Company*\n\nEnter the company/organization name:', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  if (step === 1) {
    if (!text.trim()) {
      await ctx.reply('❌ Company cannot be empty. Enter company name:')
      return
    }
    const updated = { ...data, company: text }
    await setConversation(chatId, 'exp_create', 2, updated)
    await ctx.reply('💼 *Step 3/4: Date Range*\n\nEnter date range (e.g. `Dec 2024 - Present`):', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  if (step === 2) {
    if (!text.trim()) {
      await ctx.reply('❌ Date range cannot be empty. Enter date:')
      return
    }
    const updated = { ...data, date: text }
    await setConversation(chatId, 'exp_create', 3, updated)
    await ctx.reply('💼 *Step 4/4: Description*\n\nEnter a detailed job description:', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  if (step === 3) {
    if (!text.trim()) {
      await ctx.reply('❌ Description cannot be empty. Enter description:')
      return
    }
    const updated: any = { ...data, desc: text }
    await setConversation(chatId, 'exp_create', 4, updated)

    const summary = `💼 *Verify Experience Details*
*Position:* ${updated.title}
*Company:* ${updated.company}
*Date:* ${updated.date}
*Description:* ${updated.desc}

Do you confirm insertion of this work experience?`

    await ctx.reply(summary, {
      parse_mode: 'Markdown',
      reply_markup: confirmKB('exp_create_confirm'),
    })
    return
  }
}

// Conversation step processor for editing fields
export async function handleExperienceEditStep(ctx: Context, data: Record<string, any>) {
  const chatId = ctx.chat!.id
  const text = ctx.message?.text || ''
  const id = data.id
  const field = data.field

  if (!text.trim()) {
    await ctx.reply('❌ Value cannot be empty. Please enter the new value:')
    return
  }

  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('experiences')
    .update({
      [field]: text,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  
  if (error) {
    await ctx.reply(`❌ Failed to update field: ${error.message}`)
    return
  }

  revalidateHome()
  await clearConversation(chatId)
  await ctx.reply(`✅ Successfully updated field *${field}* for experience ID *${id}*.`, { parse_mode: 'Markdown' })
}

// Action dispatcher
export async function handleExperienceCallback(ctx: Context, action: string) {
  const chatId = ctx.chat!.id

  // Start edit field prompt
  if (action.startsWith('field_')) {
    const parts = action.replace('field_', '').split('_')
    const field = parts[0]
    const id = parts[1]
    
    await setConversation(chatId, 'exp_edit', 0, { id, field })
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
    const { error } = await supabase.from('experiences').delete().eq('id', id)
    if (error) {
      await ctx.editMessageText(`❌ Failed to delete experience ID *${id}*: ${error.message}`, { parse_mode: 'Markdown' })
    } else {
      revalidateHome()
      await ctx.editMessageText(`✅ Deleted experience ID *${id}* successfully.`, { parse_mode: 'Markdown' })
    }
    await ctx.answerCallbackQuery()
    return
  }

  if (action.startsWith('delete_no_')) {
    const id = action.replace('delete_no_', '')
    await ctx.editMessageText(`❌ Deletion of experience ID *${id}* cancelled.`, { parse_mode: 'Markdown' })
    await ctx.answerCallbackQuery()
    return
  }

  // Insert Confirm
  if (action === 'create_confirm_yes') {
    const state = await getConversation(chatId)
    if (!state || state.command !== 'exp_create') {
      await ctx.editMessageText('❌ Session expired or invalid.')
      await ctx.answerCallbackQuery()
      return
    }
    const supabase = getSupabaseAdmin()
    
    // Get next sort_order
    const { count } = await supabase.from('experiences').select('*', { count: 'exact', head: true })
    const sortOrder = count || 0

    const { error } = await supabase.from('experiences').insert({ ...state.data, sort_order: sortOrder })
    if (error) {
      await ctx.editMessageText(`❌ Database insertion failed: ${error.message}`)
    } else {
      revalidateHome()
      await ctx.editMessageText('🎉 Experience added successfully!')
      await clearConversation(chatId)
    }
    await ctx.answerCallbackQuery()
    return
  }

  if (action === 'create_confirm_no') {
    await clearConversation(chatId)
    await ctx.editMessageText('❌ Experience creation discarded.')
    await ctx.answerCallbackQuery()
    return
  }

  // Button actions (Edit / Delete) directly under item
  if (action.startsWith('btn_edit_')) {
    const id = action.replace('btn_edit_', '')
    await showEditFields(ctx, id)
    await ctx.answerCallbackQuery()
    return
  }

  if (action.startsWith('btn_del_')) {
    const id = action.replace('btn_del_', '')
    await ctx.reply(`⚠️ Are you sure you want to delete experience ID *${id}*?`, {
      parse_mode: 'Markdown',
      reply_markup: confirmKB('exp_delete', id),
    })
    await ctx.answerCallbackQuery()
    return
  }
}
