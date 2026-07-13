import type { Context } from 'grammy'
import { InlineKeyboard } from 'grammy'
import { getSupabaseAdmin } from '../config'
import { getConversation, setConversation, clearConversation } from '../store'
import { formatCert, formatCertList } from '../formats'
import { confirmKB, cancelKB, genericFieldKB } from '../keyboards'
import { handlePhotoUpload } from './upload'
import { revalidateHome } from '@/lib/revalidate'

export async function handleCertCommand(ctx: Context) {
  const text = ctx.message?.text || ''
  const args = text.split(' ').slice(1)
  const sub = args[0]

  if (sub === 'add') {
    await setConversation(ctx.chat!.id, 'cert_add', 0, {})
    await ctx.reply('🏅 *Add Certification* (Step 1/5)\n\nEnter the certification title:', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  if (sub === 'edit') {
    const id = args[1]
    if (!id) {
      await ctx.reply('❌ Please specify a certification ID: `/cert edit <id>`', { parse_mode: 'Markdown' })
      return
    }
    await showEditFields(ctx, id)
    return
  }

  if (sub === 'delete') {
    const id = args[1]
    if (!id) {
      await ctx.reply('❌ Please specify a certification ID: `/cert delete <id>`', { parse_mode: 'Markdown' })
      return
    }
    await ctx.reply(`⚠️ Are you sure you want to delete certification ID *${id}*?`, {
      parse_mode: 'Markdown',
      reply_markup: confirmKB('cert_delete', id),
    })
    return
  }

  // Default: list all certifications
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('certifications')
    .select('*')
    .order('sort_order', { ascending: true })
  
  if (error) {
    await ctx.reply(`❌ Failed to retrieve certifications: ${error.message}`)
    return
  }

  if (!data || data.length === 0) {
    await ctx.reply('🏅 No certifications found. Type `/cert add` to add one.', { parse_mode: 'Markdown' })
    return
  }

  await ctx.reply('🏅 *Certifications List:*', { parse_mode: 'Markdown' })
  for (const item of data) {
    const keyboard = new InlineKeyboard()
      .text('✏️ Edit', `cert_btn_edit_${item.id}`)
      .text('🗑️ Delete', `cert_btn_del_${item.id}`)
    
    await ctx.reply(`*${item.title}*\nIssuer: ${item.issuer} | Date: ${item.date} (ID: \`${item.id}\`)`, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    })
  }
}

async function showEditFields(ctx: Context, id: string | number) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('certifications').select('*').eq('id', id).maybeSingle()
  if (error || !data) {
    await ctx.reply('❌ Certification not found.')
    return
  }

  const keyboard = genericFieldKB('cert', id, ['title', 'issuer', 'date', 'credential_url', 'image'])
  await ctx.reply(formatCert(data), {
    parse_mode: 'Markdown',
    reply_markup: keyboard,
  })
}

// Conversation step processors
export async function handleCertAddWizard(ctx: Context, step: number, data: Record<string, any>) {
  const chatId = ctx.chat!.id
  const text = ctx.message?.text || ''

  if (step === 0) {
    if (!text.trim()) {
      await ctx.reply('❌ Title cannot be empty. Please enter the certification title:')
      return
    }
    const updated = { ...data, title: text }
    await setConversation(chatId, 'cert_add', 1, updated)
    await ctx.reply('🏅 *Step 2/5: Issuer*\n\nEnter the certification issuer/organization:', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  if (step === 1) {
    if (!text.trim()) {
      await ctx.reply('❌ Issuer cannot be empty. Please enter the issuer:')
      return
    }
    const updated = { ...data, issuer: text }
    await setConversation(chatId, 'cert_add', 2, updated)
    await ctx.reply('🏅 *Step 3/5: Date*\n\nEnter date (e.g. `2025` or `May 2025`):', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  if (step === 2) {
    if (!text.trim()) {
      await ctx.reply('❌ Date cannot be empty. Please enter the date:')
      return
    }
    const updated = { ...data, date: text }
    await setConversation(chatId, 'cert_add', 3, updated)
    await ctx.reply('🏅 *Step 4/5: Credential URL*\n\nEnter the credential link URL, or type `skip`:', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  if (step === 3) {
    const val = text.trim()
    const credentialUrl = val.toLowerCase() === 'skip' ? '' : val
    const updated = { ...data, credential_url: credentialUrl }
    await setConversation(chatId, 'cert_add', 4, updated)
    await ctx.reply('🏅 *Step 5/5: Badge Image*\n\nSend the certification badge photo, or type `skip`:', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  if (step === 4) {
    let imageUrl = ''
    if (ctx.message?.photo) {
      try {
        await ctx.reply('⏳ Uploading image to storage...')
        imageUrl = await handlePhotoUpload(ctx)
      } catch (err: any) {
        await ctx.reply(`❌ Image upload failed: ${err.message}. Please send the image again, or type \`skip\`:`)
        return
      }
    } else if (text.trim().toLowerCase() === 'skip') {
      imageUrl = ''
    } else {
      await ctx.reply('❌ Invalid response. Please upload a photo or type \`skip\`:')
      return
    }

    const updated: any = { ...data, image: imageUrl }
    await setConversation(chatId, 'cert_add', 5, updated)

    const summary = `🏅 *Verify Certification Details*
*Title:* ${updated.title}
*Issuer:* ${updated.issuer}
*Date:* ${updated.date}
*Credential Link:* ${updated.credential_url || 'None'}
*Badge Image:* ${updated.image ? `[View Badge](${updated.image})` : 'None'}

Do you confirm insertion of this certification?`

    await ctx.reply(summary, {
      parse_mode: 'Markdown',
      reply_markup: confirmKB('cert_add_confirm'),
    })
    return
  }
}

// Conversation step processor for editing fields
export async function handleCertEditStep(ctx: Context, data: Record<string, any>) {
  const chatId = ctx.chat!.id
  const text = ctx.message?.text || ''
  const id = data.id
  const field = data.field

  let val: any = text

  if (field === 'image') {
    if (ctx.message?.photo) {
      try {
        await ctx.reply('⏳ Uploading image to storage...')
        const supabase = getSupabaseAdmin()
        const { data: oldItem } = await supabase.from('certifications').select('image').eq('id', id).maybeSingle()
        val = await handlePhotoUpload(ctx, oldItem?.image)
      } catch (err: any) {
        await ctx.reply(`❌ Image upload failed: ${err.message}. Please send the image again:`)
        return
      }
    } else {
      val = text.trim()
    }
  }

  if (!val.trim() && field !== 'image' && field !== 'credential_url') {
    await ctx.reply('❌ Value cannot be empty. Please enter the new value:')
    return
  }

  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('certifications')
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
  await ctx.reply(`✅ Successfully updated field *${field}* for certification ID *${id}*.`, { parse_mode: 'Markdown' })
}

// Action dispatcher
export async function handleCertCallback(ctx: Context, action: string) {
  const chatId = ctx.chat!.id

  // Start edit field prompt
  if (action.startsWith('field_')) {
    const parts = action.replace('field_', '').split('_')
    const field = parts[0]
    const id = parts[1]
    
    await setConversation(chatId, 'cert_edit', 0, { id, field })
    await ctx.reply(`✏️ Please send the new value for *${field}* (or upload a new badge photo if updating the badge image):`, {
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
    
    // Attempt to delete image from bucket
    const { data: item } = await supabase.from('certifications').select('image').eq('id', id).maybeSingle()
    if (item?.image) {
      try {
        const match = item.image.match(/\/object\/public\/Media\/(.+)$/)
        if (match && match[1]) {
          const decoded = decodeURIComponent(match[1])
          await supabase.storage.from('Media').remove([decoded])
        }
      } catch (e) {
        console.error('Failed to clean up storage image:', e)
      }
    }

    const { error } = await supabase.from('certifications').delete().eq('id', id)
    if (error) {
      await ctx.editMessageText(`❌ Failed to delete certification ID *${id}*: ${error.message}`, { parse_mode: 'Markdown' })
    } else {
      revalidateHome()
      await ctx.editMessageText(`✅ Deleted certification ID *${id}* successfully.`, { parse_mode: 'Markdown' })
    }
    await ctx.answerCallbackQuery()
    return
  }

  if (action.startsWith('delete_no_')) {
    const id = action.replace('delete_no_', '')
    await ctx.editMessageText(`❌ Deletion of certification ID *${id}* cancelled.`, { parse_mode: 'Markdown' })
    await ctx.answerCallbackQuery()
    return
  }

  // Insert Confirm
  if (action === 'add_confirm_yes') {
    const state = await getConversation(chatId)
    if (!state || state.command !== 'cert_add') {
      await ctx.editMessageText('❌ Session expired or invalid.')
      await ctx.answerCallbackQuery()
      return
    }
    const supabase = getSupabaseAdmin()
    
    // Get next sort_order
    const { count } = await supabase.from('certifications').select('*', { count: 'exact', head: true })
    const sortOrder = count || 0

    const { error } = await supabase.from('certifications').insert({ ...state.data, sort_order: sortOrder })
    if (error) {
      await ctx.editMessageText(`❌ Database insertion failed: ${error.message}`)
    } else {
      revalidateHome()
      await ctx.editMessageText('🎉 Certification added successfully!')
      await clearConversation(chatId)
    }
    await ctx.answerCallbackQuery()
    return
  }

  if (action === 'add_confirm_no') {
    const state = await getConversation(chatId)
    if (state?.data?.image) {
      // Clean up uploaded image if cancelled
      try {
        const supabase = getSupabaseAdmin()
        const match = state.data.image.match(/\/object\/public\/Media\/(.+)$/)
        if (match && match[1]) {
          const decoded = decodeURIComponent(match[1])
          await supabase.storage.from('Media').remove([decoded])
        }
      } catch (e) {
        console.error('Failed to clean up image on discard:', e)
      }
    }
    await clearConversation(chatId)
    await ctx.editMessageText('❌ Certification insertion discarded.')
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
    await ctx.reply(`⚠️ Are you sure you want to delete certification ID *${id}*?`, {
      parse_mode: 'Markdown',
      reply_markup: confirmKB('cert_delete', id),
    })
    await ctx.answerCallbackQuery()
    return
  }
}
