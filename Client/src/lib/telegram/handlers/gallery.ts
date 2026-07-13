import type { Context } from 'grammy'
import { InlineKeyboard } from 'grammy'
import { getSupabaseAdmin } from '../config'
import { getConversation, setConversation, clearConversation } from '../store'
import { formatGalleryItem } from '../formats'
import { confirmKB, cancelKB } from '../keyboards'
import { handlePhotoUpload } from './upload'
import { revalidateHome } from '@/lib/revalidate'

export async function handleGalleryCommand(ctx: Context) {
  const text = ctx.message?.text || ''
  const args = text.split(' ').slice(1)
  const sub = args[0]

  if (sub === 'upload') {
    await setConversation(ctx.chat!.id, 'gallery_upload', 0, {})
    await ctx.reply('🖼️ *Upload Gallery Item* (Step 1/3)\n\nPlease upload/send the photo:', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  if (sub === 'delete') {
    const id = args[1]
    if (!id) {
      await ctx.reply('❌ Please specify a gallery item ID: `/gallery delete <id>`', { parse_mode: 'Markdown' })
      return
    }
    await ctx.reply(`⚠️ Are you sure you want to delete gallery item ID *${id}*?`, {
      parse_mode: 'Markdown',
      reply_markup: confirmKB('gallery_delete', id),
    })
    return
  }

  // Default: list all gallery items
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .order('sort_order', { ascending: true })
  
  if (error) {
    await ctx.reply(`❌ Failed to retrieve gallery: ${error.message}`)
    return
  }

  if (!data || data.length === 0) {
    await ctx.reply('🖼️ No gallery items found. Type `/gallery upload` to add one.', { parse_mode: 'Markdown' })
    return
  }

  await ctx.reply('🖼️ *Gallery Items:*', { parse_mode: 'Markdown' })
  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    const keyboard = new InlineKeyboard()
      .text('🗑️ Delete', `gallery_btn_del_${item.id}`)
    
    const caption = `🖼️ *${item.title || 'Untitled'}*\n${item.description || 'No description'}\n(ID: \`${item.id}\` | Order: ${item.sort_order ?? 0})`
    
    if (item.image) {
      try {
        await ctx.replyWithPhoto(item.image, {
          caption,
          parse_mode: 'Markdown',
          reply_markup: keyboard,
        })
      } catch {
        // Fallback if image fails to load
        await ctx.reply(`${caption}\n🔗 Image Link: ${item.image}`, {
          parse_mode: 'Markdown',
          reply_markup: keyboard,
        })
      }
    } else {
      await ctx.reply(caption, {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      })
    }
  }
}

// Conversation step processors
export async function handleGalleryUploadWizard(ctx: Context, step: number, data: Record<string, any>) {
  const chatId = ctx.chat!.id
  const text = ctx.message?.text || ''

  if (step === 0) {
    if (!ctx.message?.photo) {
      await ctx.reply('❌ Please send a photo to start, or type /cancel to abort:')
      return
    }
    
    try {
      await ctx.reply('⏳ Uploading image to storage...')
      const imageUrl = await handlePhotoUpload(ctx)
      const updated = { ...data, image: imageUrl }
      await setConversation(chatId, 'gallery_upload', 1, updated)
      await ctx.reply('🖼️ *Step 2/3: Title*\n\nEnter a title for this gallery item:', {
        parse_mode: 'Markdown',
        reply_markup: cancelKB(),
      })
    } catch (err: any) {
      await ctx.reply(`❌ Image upload failed: ${err.message}. Please send the image again:`)
    }
    return
  }

  if (step === 1) {
    if (!text.trim()) {
      await ctx.reply('❌ Title cannot be empty. Enter title:')
      return
    }
    const updated = { ...data, title: text }
    await setConversation(chatId, 'gallery_upload', 2, updated)
    await ctx.reply('🖼️ *Step 3/3: Description*\n\nEnter description (or type `skip`):', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  if (step === 2) {
    const descVal = text.trim().toLowerCase() === 'skip' ? '' : text.trim()
    const updated: any = { ...data, description: descVal }
    await setConversation(chatId, 'gallery_upload', 3, updated)

    const summary = `🖼️ *Verify Gallery Details*
*Title:* ${updated.title}
*Description:* ${updated.description || 'None'}
*Image:* [View Image](${updated.image})

Do you confirm insertion of this gallery item?`

    await ctx.reply(summary, {
      parse_mode: 'Markdown',
      reply_markup: confirmKB('gallery_upload_confirm'),
    })
    return
  }
}

// Action dispatcher
export async function handleGalleryCallback(ctx: Context, action: string) {
  const chatId = ctx.chat!.id

  // Confirm delete
  if (action.startsWith('delete_yes_')) {
    const id = action.replace('delete_yes_', '')
    const supabase = getSupabaseAdmin()
    
    // Attempt to delete image from bucket
    const { data: item } = await supabase.from('gallery').select('image').eq('id', id).maybeSingle()
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

    const { error } = await supabase.from('gallery').delete().eq('id', id)
    if (error) {
      await ctx.reply(`❌ Failed to delete gallery item ID *${id}*: ${error.message}`, { parse_mode: 'Markdown' })
    } else {
      revalidateHome()
      await ctx.reply(`✅ Deleted gallery item ID *${id}* successfully.`, { parse_mode: 'Markdown' })
    }
    await ctx.answerCallbackQuery()
    return
  }

  if (action.startsWith('delete_no_')) {
    const id = action.replace('delete_no_', '')
    await ctx.reply(`❌ Deletion of gallery item ID *${id}* cancelled.`, { parse_mode: 'Markdown' })
    await ctx.answerCallbackQuery()
    return
  }

  // Insert Confirm
  if (action === 'upload_confirm_yes') {
    const state = await getConversation(chatId)
    if (!state || state.command !== 'gallery_upload') {
      await ctx.reply('❌ Session expired or invalid.')
      await ctx.answerCallbackQuery()
      return
    }
    const supabase = getSupabaseAdmin()
    
    // Get next sort_order
    const { count } = await supabase.from('gallery').select('*', { count: 'exact', head: true })
    const sortOrder = count || 0

    const { error } = await supabase.from('gallery').insert({ ...state.data, sort_order: sortOrder })
    if (error) {
      await ctx.reply(`❌ Database insertion failed: ${error.message}`)
    } else {
      revalidateHome()
      await ctx.reply('🎉 Gallery item added successfully!')
      await clearConversation(chatId)
    }
    await ctx.answerCallbackQuery()
    return
  }

  if (action === 'upload_confirm_no') {
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
    await ctx.reply('❌ Gallery upload discarded.')
    await ctx.answerCallbackQuery()
    return
  }

  // Button actions (Delete) directly under item
  if (action.startsWith('btn_del_')) {
    const id = action.replace('btn_del_', '')
    await ctx.reply(`⚠️ Are you sure you want to delete gallery item ID *${id}*?`, {
      parse_mode: 'Markdown',
      reply_markup: confirmKB('gallery_delete', id),
    })
    await ctx.answerCallbackQuery()
    return
  }
}
