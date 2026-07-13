import type { Context } from 'grammy'
import { InlineKeyboard } from 'grammy'
import { getSupabaseAdmin } from '../config'
import { formatMessage, formatShortMessage } from '../formats'
import { confirmKB } from '../keyboards'

export async function handleMessagesCommand(ctx: Context) {
  const text = ctx.message?.text || ''
  const args = text.split(' ').slice(1)
  const sub = args[0]

  if (sub === 'delete') {
    const id = args[1]
    if (!id) {
      await ctx.reply('❌ Please specify a message ID: `/message delete <id>`', { parse_mode: 'Markdown' })
      return
    }
    await ctx.reply(`⚠️ Are you sure you want to delete message ID *${id}*?`, {
      parse_mode: 'Markdown',
      reply_markup: confirmKB('msg_delete', id),
    })
    return
  }

  // If dynamic view request (/message <id>)
  if (sub && !isNaN(parseInt(sub, 10))) {
    await showMessageDetails(ctx, sub)
    return
  }

  // Default: list recent 20 messages
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)
  
  if (error) {
    await ctx.reply(`❌ Failed to retrieve messages: ${error.message}`)
    return
  }

  if (!data || data.length === 0) {
    await ctx.reply('📬 No messages in your inbox.')
    return
  }

  await ctx.reply('📬 *Recent Messages:*', { parse_mode: 'Markdown' })
  for (const item of data) {
    const keyboard = new InlineKeyboard()
      .text('👀 View', `msg_btn_view_${item.id}`)
      .text('🗑️ Delete', `msg_btn_del_${item.id}`)
    
    await ctx.reply(formatShortMessage(item), {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    })
  }
}

async function showMessageDetails(ctx: Context, id: string | number) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('contacts').select('*').eq('id', id).maybeSingle()
  if (error || !data) {
    await ctx.reply('❌ Message not found.')
    return
  }

  const keyboard = new InlineKeyboard().text('🗑️ Delete Message', `msg_btn_del_${id}`)
  await ctx.reply(formatMessage(data), {
    parse_mode: 'Markdown',
    reply_markup: keyboard,
  })
}

// Action dispatcher
export async function handleMessagesCallback(ctx: Context, action: string) {
  // Confirm delete
  if (action.startsWith('delete_yes_')) {
    const id = action.replace('delete_yes_', '')
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('contacts').delete().eq('id', id)
    if (error) {
      await ctx.reply(`❌ Failed to delete message ID *${id}*: ${error.message}`)
    } else {
      await ctx.reply(`✅ Deleted message ID *${id}* successfully.`)
    }
    await ctx.answerCallbackQuery()
    return
  }

  if (action.startsWith('delete_no_')) {
    const id = action.replace('delete_no_', '')
    await ctx.reply(`❌ Deletion of message ID *${id}* cancelled.`)
    await ctx.answerCallbackQuery()
    return
  }

  // Button actions (View / Delete) directly under item
  if (action.startsWith('btn_view_')) {
    const id = action.replace('btn_view_', '')
    await showMessageDetails(ctx, id)
    await ctx.answerCallbackQuery()
    return
  }

  if (action.startsWith('btn_del_')) {
    const id = action.replace('btn_del_', '')
    await ctx.reply(`⚠️ Are you sure you want to delete message ID *${id}*?`, {
      parse_mode: 'Markdown',
      reply_markup: confirmKB('msg_delete', id),
    })
    await ctx.answerCallbackQuery()
    return
  }
}
