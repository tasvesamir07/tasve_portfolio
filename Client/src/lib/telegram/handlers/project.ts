import type { Context } from 'grammy'
import { InlineKeyboard } from 'grammy'
import { getSupabaseAdmin } from '../config'
import { getConversation, setConversation, clearConversation } from '../store'
import { formatProject, formatProjectList } from '../formats'
import { projectFieldKB, confirmKB, cancelKB } from '../keyboards'
import { handlePhotoUpload } from './upload'
import { revalidateHome } from '@/lib/revalidate'

export async function handleProjectCommand(ctx: Context) {
  const text = ctx.message?.text || ''
  const args = text.split(' ').slice(1)
  const sub = args[0]

  if (sub === 'create') {
    await setConversation(ctx.chat!.id, 'project_create', 0, {})
    await ctx.reply('🖥️ *Create Project* (Step 1/8)\n\nEnter the project title:', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  if (sub === 'edit') {
    const id = args[1]
    if (!id) {
      await ctx.reply('❌ Please specify a project ID: `/project edit <id>`', { parse_mode: 'Markdown' })
      return
    }
    await showEditFields(ctx, id)
    return
  }

  if (sub === 'delete') {
    const id = args[1]
    if (!id) {
      await ctx.reply('❌ Please specify a project ID: `/project delete <id>`', { parse_mode: 'Markdown' })
      return
    }
    await ctx.reply(`⚠️ Are you sure you want to delete project ID *${id}*?`, {
      parse_mode: 'Markdown',
      reply_markup: confirmKB('project_delete', id),
    })
    return
  }

  // Default: list all projects
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })
  
  if (error) {
    await ctx.reply(`❌ Failed to retrieve projects: ${error.message}`)
    return
  }

  if (!data || data.length === 0) {
    await ctx.reply('🖥️ No projects found. Type `/project create` to add one.', { parse_mode: 'Markdown' })
    return
  }

  await ctx.reply('🖥️ *Projects List:*', { parse_mode: 'Markdown' })
  for (const item of data) {
    const keyboard = new InlineKeyboard()
      .text('✏️ Edit', `project_btn_edit_${item.id}`)
      .text('🗑️ Delete', `project_btn_del_${item.id}`)
    
    await ctx.reply(`*${item.title}*\nCategory: \`${item.category}\` (ID: \`${item.id}\` | Order: ${item.sort_order})`, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    })
  }
}

async function showEditFields(ctx: Context, id: string | number) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).maybeSingle()
  if (error || !data) {
    await ctx.reply('❌ Project not found.')
    return
  }

  await ctx.reply(formatProject(data), {
    parse_mode: 'Markdown',
    reply_markup: projectFieldKB(id),
  })
}

// Conversation step processors
export async function handleProjectCreateWizard(ctx: Context, step: number, data: Record<string, any>) {
  const chatId = ctx.chat!.id
  const text = ctx.message?.text || ''

  if (step === 0) {
    if (!text.trim()) {
      await ctx.reply('❌ Title cannot be empty. Please enter the project title:')
      return
    }
    const updated = { ...data, title: text }
    await setConversation(chatId, 'project_create', 1, updated)
    await ctx.reply('🖥️ *Step 2/8: Category*\n\nEnter category (`fullstack`, `ai`, `iot`, or `other`):', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  if (step === 1) {
    const cat = text.trim().toLowerCase()
    if (!['fullstack', 'ai', 'iot', 'other'].includes(cat)) {
      await ctx.reply('❌ Invalid category. Please enter one of: `fullstack`, `ai`, `iot`, `other`: ')
      return
    }
    const updated = { ...data, category: cat }
    await setConversation(chatId, 'project_create', 2, updated)
    await ctx.reply('🖥️ *Step 3/8: Tag*\n\nEnter tag (e.g. `Featured`, `AI Powered`, `New`):', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  if (step === 2) {
    const tagVal = text.trim()
    const updated = { ...data, tag: tagVal }
    await setConversation(chatId, 'project_create', 3, updated)
    await ctx.reply('🖥️ *Step 4/8: Description*\n\nEnter a short description:', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  if (step === 3) {
    if (!text.trim()) {
      await ctx.reply('❌ Description cannot be empty. Please enter description:')
      return
    }
    const updated = { ...data, desc: text }
    await setConversation(chatId, 'project_create', 4, updated)
    await ctx.reply('🖥️ *Step 5/8: Tech Stack (Tags)*\n\nEnter technologies used (comma-separated, e.g. `React, Node, Postgres`):', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  if (step === 4) {
    const updated = { ...data, tags: text }
    await setConversation(chatId, 'project_create', 5, updated)
    await ctx.reply('🖥️ *Step 6/8: Image*\n\nSend the project preview image, or type `skip`:', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  if (step === 5) {
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

    const updated = { ...data, image: imageUrl }
    await setConversation(chatId, 'project_create', 6, updated)
    await ctx.reply('🖥️ *Step 7/8: GitHub Link*\n\nEnter the GitHub repository URL, or type `skip`:', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  if (step === 6) {
    const val = text.trim()
    const githubUrl = val.toLowerCase() === 'skip' ? '' : val
    const updated = { ...data, github: githubUrl }
    await setConversation(chatId, 'project_create', 7, updated)
    await ctx.reply('🖥️ *Step 8/8: Live Demo Link*\n\nEnter the Live Demo URL, or type `skip`:', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  if (step === 7) {
    const val = text.trim()
    const liveUrl = val.toLowerCase() === 'skip' ? '' : val
    const updated: any = { ...data, live: liveUrl }
    await setConversation(chatId, 'project_create', 8, updated)

    const summary = `🖥️ *Verify Project Details*
*Title:* ${updated.title}
*Category:* ${updated.category}
*Tag:* ${updated.tag}
*Description:* ${updated.desc}
*Tech Stack:* ${updated.tags}
*GitHub:* ${updated.github || 'None'}
*Live Demo:* ${updated.live || 'None'}
*Image:* ${updated.image ? `[View Image](${updated.image})` : 'None'}

Do you confirm insertion of this project?`

    await ctx.reply(summary, {
      parse_mode: 'Markdown',
      reply_markup: confirmKB('project_create_confirm'),
    })
    return
  }
}

// Conversation step processor for editing fields
export async function handleProjectEditStep(ctx: Context, data: Record<string, any>) {
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
        const { data: oldItem } = await supabase.from('projects').select('image').eq('id', id).maybeSingle()
        val = await handlePhotoUpload(ctx, oldItem?.image)
      } catch (err: any) {
        await ctx.reply(`❌ Image upload failed: ${err.message}. Please send the image again:`)
        return
      }
    } else {
      val = text.trim()
    }
  }

  if (!val.trim() && field !== 'image' && field !== 'github' && field !== 'live' && field !== 'diagram_url') {
    await ctx.reply('❌ Value cannot be empty. Please enter the new value:')
    return
  }

  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('projects')
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
  await ctx.reply(`✅ Successfully updated field *${field}* for project ID *${id}*.`, { parse_mode: 'Markdown' })
}

// Action dispatcher
export async function handleProjectCallback(ctx: Context, action: string) {
  const chatId = ctx.chat!.id

  // Start edit field prompt
  if (action.startsWith('field_')) {
    const parts = action.replace('field_', '').split('_')
    const field = parts[0]
    const id = parts[1]
    
    await setConversation(chatId, 'project_edit', 0, { id, field })
    await ctx.reply(`✏️ Please send the new value for *${field}* (or upload a new photo if updating the preview image):`, {
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
    const { data: item } = await supabase.from('projects').select('image').eq('id', id).maybeSingle()
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

    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) {
      await ctx.editMessageText(`❌ Failed to delete project ID *${id}*: ${error.message}`, { parse_mode: 'Markdown' })
    } else {
      revalidateHome()
      await ctx.editMessageText(`✅ Deleted project ID *${id}* successfully.`, { parse_mode: 'Markdown' })
    }
    await ctx.answerCallbackQuery()
    return
  }

  if (action.startsWith('delete_no_')) {
    const id = action.replace('delete_no_', '')
    await ctx.editMessageText(`❌ Deletion of project ID *${id}* cancelled.`, { parse_mode: 'Markdown' })
    await ctx.answerCallbackQuery()
    return
  }

  // Insert Confirm
  if (action === 'create_confirm_yes') {
    const state = await getConversation(chatId)
    if (!state || state.command !== 'project_create') {
      await ctx.editMessageText('❌ Session expired or invalid.')
      await ctx.answerCallbackQuery()
      return
    }
    const supabase = getSupabaseAdmin()
    
    // Get next sort_order
    const { count } = await supabase.from('projects').select('*', { count: 'exact', head: true })
    const sortOrder = count || 0

    const { error } = await supabase.from('projects').insert({ ...state.data, sort_order: sortOrder })
    if (error) {
      await ctx.editMessageText(`❌ Database insertion failed: ${error.message}`)
    } else {
      revalidateHome()
      await ctx.editMessageText('🎉 Project created successfully!')
      await clearConversation(chatId)
    }
    await ctx.answerCallbackQuery()
    return
  }

  if (action === 'create_confirm_no') {
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
    await ctx.editMessageText('❌ Project creation discarded.')
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
    await ctx.reply(`⚠️ Are you sure you want to delete project ID *${id}*?`, {
      parse_mode: 'Markdown',
      reply_markup: confirmKB('project_delete', id),
    })
    await ctx.answerCallbackQuery()
    return
  }
}
