import type { Context } from 'grammy'
import { InlineKeyboard } from 'grammy'
import { getSupabaseAdmin } from '../config'
import { getConversation, setConversation, clearConversation } from '../store'
import { formatEducation, formatEducationList } from '../formats'
import { confirmKB, cancelKB, educationTypeKB, genericFieldKB } from '../keyboards'
import { revalidateHome } from '@/lib/revalidate'

export async function handleEducationCommand(ctx: Context) {
  const text = ctx.message?.text || ''
  const args = text.split(' ').slice(1)
  const sub = args[0]

  if (sub === 'create') {
    await setConversation(ctx.chat!.id, 'edu_create', 0, {})
    await ctx.reply('🎓 *Add Education/Award/Activity* (Step 1/5)\n\nSelect the type of record:', {
      reply_markup: educationTypeKB(),
    })
    return
  }

  if (sub === 'edit') {
    const id = args[1]
    if (!id) {
      await ctx.reply('❌ Please specify an education record ID: `/education edit <id>`', { parse_mode: 'Markdown' })
      return
    }
    await showEditFields(ctx, id)
    return
  }

  if (sub === 'delete') {
    const id = args[1]
    if (!id) {
      await ctx.reply('❌ Please specify an education record ID: `/education delete <id>`', { parse_mode: 'Markdown' })
      return
    }
    await ctx.reply(`⚠️ Are you sure you want to delete education ID *${id}*?`, {
      parse_mode: 'Markdown',
      reply_markup: confirmKB('edu_delete', id),
    })
    return
  }

  // Default: list all education entries
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('education')
    .select('*')
    .order('sort_order', { ascending: true })
  
  if (error) {
    await ctx.reply(`❌ Failed to retrieve education: ${error.message}`)
    return
  }

  if (!data || data.length === 0) {
    await ctx.reply('🎓 No records found. Type `/education create` to add one.', { parse_mode: 'Markdown' })
    return
  }

  await ctx.reply('🎓 *Education, Awards, & Activities:*', { parse_mode: 'Markdown' })
  for (const item of data) {
    const keyboard = new InlineKeyboard()
      .text('✏️ Edit', `edu_btn_edit_${item.id}`)
      .text('🗑️ Delete', `edu_btn_del_${item.id}`)
    
    const typeLabel = item.type === 'education' ? '🎓 Edu' : item.type === 'award' ? '🏆 Award' : '📢 Activity'
    await ctx.reply(`[${typeLabel}] *${item.title}*\nSubtitle/Issuer: ${item.subtitle || 'None'} (${item.date || 'No date'})\n(ID: \`${item.id}\` | Order: ${item.sort_order ?? 0})`, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    })
  }
}

async function showEditFields(ctx: Context, id: string | number) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('education').select('*').eq('id', id).maybeSingle()
  if (error || !data) {
    await ctx.reply('❌ Education record not found.')
    return
  }

  const keyboard = genericFieldKB('edu', id, ['type', 'title', 'subtitle', 'date', 'details'])
  await ctx.reply(formatEducation(data), {
    parse_mode: 'Markdown',
    reply_markup: keyboard,
  })
}

// Conversation step processors
export async function handleEducationWizard(ctx: Context, step: number, data: Record<string, any>) {
  const chatId = ctx.chat!.id
  const text = ctx.message?.text || ''

  if (step === 0) {
    // Type is set via callback query (see handleEducationCallback)
    await ctx.reply('❌ Please click one of the buttons to choose type or type /cancel:')
    return
  }

  if (step === 1) {
    if (!text.trim()) {
      await ctx.reply('❌ Title cannot be empty. Enter title:')
      return
    }
    const updated = { ...data, title: text }
    await setConversation(chatId, 'edu_create', 2, updated)
    await ctx.reply('🎓 *Step 3/5: Subtitle/Organization*\n\nEnter the subtitle, school, or issuer name (or type `skip`):', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  if (step === 2) {
    const subVal = text.trim().toLowerCase() === 'skip' ? '' : text.trim()
    const updated = { ...data, subtitle: subVal }
    await setConversation(chatId, 'edu_create', 3, updated)
    await ctx.reply('🎓 *Step 4/5: Date Range*\n\nEnter date range (e.g. `2023 - Present` or `Batch 2022`):', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  if (step === 3) {
    const updated = { ...data, date: text.trim() }
    await setConversation(chatId, 'edu_create', 4, updated)
    await ctx.reply('🎓 *Step 5/5: Details*\n\nEnter detailed notes (or type `skip`):', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  if (step === 4) {
    const detailsVal = text.trim().toLowerCase() === 'skip' ? '' : text.trim()
    const updated: any = { ...data, details: detailsVal }
    await setConversation(chatId, 'edu_create', 5, updated)

    const summary = `🎓 *Verify Education Details*
*Type:* ${updated.type}
*Title:* ${updated.title}
*Subtitle:* ${updated.subtitle || 'None'}
*Date:* ${updated.date || 'None'}
*Details:* ${updated.details || 'None'}

Do you confirm insertion of this record?`

    await ctx.reply(summary, {
      parse_mode: 'Markdown',
      reply_markup: confirmKB('edu_create_confirm'),
    })
    return
  }
}

// Conversation step processor for editing fields
export async function handleEducationEditStep(ctx: Context, data: Record<string, any>) {
  const chatId = ctx.chat!.id
  const text = ctx.message?.text || ''
  const id = data.id
  const field = data.field

  let val: any = text
  if (field === 'type') {
    val = text.trim().toLowerCase()
    if (!['education', 'award', 'activity'].includes(val)) {
      await ctx.reply('❌ Type must be one of: `education`, `award`, `activity`. Enter again:')
      return
    }
  }

  if (!text.trim() && field !== 'subtitle' && field !== 'details') {
    await ctx.reply('❌ Value cannot be empty. Please enter the new value:')
    return
  }

  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('education')
    .update({
      [field]: val === 'skip' || val === 'none' ? '' : val,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  
  if (error) {
    await ctx.reply(`❌ Failed to update field: ${error.message}`)
    return
  }

  revalidateHome()
  await clearConversation(chatId)
  await ctx.reply(`✅ Successfully updated field *${field}* for record ID *${id}*.`, { parse_mode: 'Markdown' })
}

// Action dispatcher
export async function handleEducationCallback(ctx: Context, action: string) {
  const chatId = ctx.chat!.id

  // Choose Type Callback inside wizard
  if (action.startsWith('type_')) {
    const type = action.replace('type_', '')
    const state = await getConversation(chatId)
    if (!state || state.command !== 'edu_create') {
      await ctx.reply('❌ Session expired. Please restart.')
      await ctx.answerCallbackQuery()
      return
    }

    const updated = { ...state.data, type }
    await setConversation(chatId, 'edu_create', 1, updated)
    await ctx.editMessageText(`🎓 *Step 2/5: Title*\n\nYou selected: *${type.toUpperCase()}*\n\nEnter the title:`, {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    await ctx.answerCallbackQuery()
    return
  }

  // Start edit field prompt
  if (action.startsWith('field_')) {
    const parts = action.replace('field_', '').split('_')
    const field = parts[0]
    const id = parts[1]
    
    await setConversation(chatId, 'edu_edit', 0, { id, field })
    await ctx.reply(`✏️ Please send the new value for *${field}*${field === 'type' ? ' (`education`, `award`, or `activity`)' : ''}:`, {
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
    const { error } = await supabase.from('education').delete().eq('id', id)
    if (error) {
      await ctx.editMessageText(`❌ Failed to delete education record ID *${id}*: ${error.message}`, { parse_mode: 'Markdown' })
    } else {
      revalidateHome()
      await ctx.editMessageText(`✅ Deleted education record ID *${id}* successfully.`, { parse_mode: 'Markdown' })
    }
    await ctx.answerCallbackQuery()
    return
  }

  if (action.startsWith('delete_no_')) {
    const id = action.replace('delete_no_', '')
    await ctx.editMessageText(`❌ Deletion of education record ID *${id}* cancelled.`, { parse_mode: 'Markdown' })
    await ctx.answerCallbackQuery()
    return
  }

  // Insert Confirm
  if (action === 'create_confirm_yes') {
    const state = await getConversation(chatId)
    if (!state || state.command !== 'edu_create') {
      await ctx.editMessageText('❌ Session expired or invalid.')
      await ctx.answerCallbackQuery()
      return
    }
    const supabase = getSupabaseAdmin()
    
    // Get next sort_order
    const { count } = await supabase.from('education').select('*', { count: 'exact', head: true })
    const sortOrder = count || 0

    const { error } = await supabase.from('education').insert({ ...state.data, sort_order: sortOrder })
    if (error) {
      await ctx.editMessageText(`❌ Database insertion failed: ${error.message}`)
    } else {
      revalidateHome()
      await ctx.editMessageText('🎉 Education record added successfully!')
      await clearConversation(chatId)
    }
    await ctx.answerCallbackQuery()
    return
  }

  if (action === 'create_confirm_no') {
    await clearConversation(chatId)
    await ctx.editMessageText('❌ Education record creation discarded.')
    await ctx.answerCallbackQuery()
    return
  }

  // Button actions (Edit / Delete) directly under item
  if (action.startsWith('btn_edit_')) {
    const id = action.replace('btn_btn_edit_', '') // fallback match check
    const rawId = action.replace('btn_edit_', '')
    await showEditFields(ctx, rawId)
    await ctx.answerCallbackQuery()
    return
  }

  if (action.startsWith('btn_del_')) {
    const id = action.replace('btn_del_', '')
    await ctx.reply(`⚠️ Are you sure you want to delete education record ID *${id}*?`, {
      parse_mode: 'Markdown',
      reply_markup: confirmKB('edu_delete', id),
    })
    await ctx.answerCallbackQuery()
    return
  }
}
