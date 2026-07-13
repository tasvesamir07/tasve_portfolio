import type { Context } from 'grammy'
import { InlineKeyboard } from 'grammy'
import { getSupabaseAdmin } from '../config'
import { getConversation, setConversation, clearConversation } from '../store'
import { formatBlog, formatBlogList } from '../formats'
import { blogFieldKB, confirmKB, cancelKB } from '../keyboards'
import { handleDocumentUpload } from './upload'
import { revalidateHome } from '@/lib/revalidate'

// Helper to slugify string
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, '') // Trim - from end
}

export async function handleBlogCommand(ctx: Context) {
  const text = ctx.message?.text || ''
  const args = text.split(' ').slice(1)
  const sub = args[0]

  if (sub === 'create') {
    await setConversation(ctx.chat!.id, 'blog_create', 0, {})
    await ctx.reply('📝 *Create Blog Post* (Step 1/6)\n\nEnter the blog title:', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  if (sub === 'edit') {
    const id = args[1]
    if (!id) {
      await ctx.reply('❌ Please specify a blog ID: `/blog edit <id>`', { parse_mode: 'Markdown' })
      return
    }
    await showEditFields(ctx, id)
    return
  }

  if (sub === 'delete') {
    const id = args[1]
    if (!id) {
      await ctx.reply('❌ Please specify a blog ID: `/blog delete <id>`', { parse_mode: 'Markdown' })
      return
    }
    await ctx.reply(`⚠️ Are you sure you want to delete blog ID *${id}*?`, {
      parse_mode: 'Markdown',
      reply_markup: confirmKB('blog_delete', id),
    })
    return
  }

  if (sub === 'publish') {
    const id = args[1]
    if (!id) {
      await ctx.reply('❌ Please specify a blog ID: `/blog publish <id>`', { parse_mode: 'Markdown' })
      return
    }
    await togglePublish(ctx, id)
    return
  }

  // Default: list all blogs
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    await ctx.reply(`❌ Failed to retrieve blogs: ${error.message}`)
    return
  }

  if (!data || data.length === 0) {
    await ctx.reply('📝 No blogs found. Type `/blog create` to add one.', { parse_mode: 'Markdown' })
    return
  }

  await ctx.reply('📝 *Articles List:*', { parse_mode: 'Markdown' })
  for (const item of data) {
    const status = item.published ? '🟢 Published' : '⚪ Draft'
    const keyboard = new InlineKeyboard()
      .text('✏️ Edit', `blog_btn_edit_${item.id}`)
      .text('🗑️ Delete', `blog_btn_del_${item.id}`)
      .text(item.published ? '📁 Unpublish' : '📢 Publish', `blog_btn_pub_${item.id}`)
    
    await ctx.reply(`*${item.title}*\nStatus: ${status}\nSlug: \`/${item.slug}\` (ID: \`${item.id}\`)`, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    })
  }
}

async function showEditFields(ctx: Context, id: string | number) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('blogs').select('*').eq('id', id).maybeSingle()
  if (error || !data) {
    await ctx.reply('❌ Blog article not found.')
    return
  }

  await ctx.reply(formatBlog(data), {
    parse_mode: 'Markdown',
    reply_markup: blogFieldKB(id),
  })
}

async function togglePublish(ctx: Context, id: string | number) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('blogs').select('published').eq('id', id).maybeSingle()
  if (error || !data) {
    await ctx.reply('❌ Blog article not found.')
    return
  }

  const nextStatus = !data.published
  const { error: updateError } = await supabase
    .from('blogs')
    .update({ published: nextStatus, updated_at: new Date().toISOString() })
    .eq('id', id)
  
  if (updateError) {
    await ctx.reply(`❌ Failed to update publish status: ${updateError.message}`)
    return
  }

  revalidateHome()
  await ctx.reply(`✅ Article ID *${id}* is now *${nextStatus ? 'Published 📢' : 'Draft 📁'}*.`, {
    parse_mode: 'Markdown',
  })
}

// Conversation step processors
export async function handleBlogCreateWizard(ctx: Context, step: number, data: Record<string, any>) {
  const chatId = ctx.chat!.id
  const text = ctx.message?.text || ''

  if (step === 0) {
    // Save Title, ask for Slug
    if (!text.trim()) {
      await ctx.reply('❌ Title cannot be empty. Please enter the blog title:')
      return
    }
    if (text.length > 300) {
      await ctx.reply('❌ Title is too long (max 300 chars). Enter title:')
      return
    }
    const updated = { ...data, title: text }
    await setConversation(chatId, 'blog_create', 1, updated)
    await ctx.reply('📝 *Step 2/6: Slug*\n\nEnter the URL slug (or type `skip` to auto-generate from title):', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  if (step === 1) {
    // Save Slug, ask for Excerpt
    let slugVal = text.trim().toLowerCase()
    if (slugVal === 'skip') {
      slugVal = slugify(data.title)
    } else {
      slugVal = slugify(slugVal)
    }

    if (slugVal.length > 300) {
      await ctx.reply('❌ Slug is too long (max 300 chars). Enter slug:')
      return
    }

    // Check slug uniqueness
    const supabase = getSupabaseAdmin()
    const { data: existing } = await supabase.from('blogs').select('id').eq('slug', slugVal).maybeSingle()
    if (existing) {
      await ctx.reply(`❌ Slug \`/${slugVal}\` is already taken. Enter a unique slug:`, { parse_mode: 'Markdown' })
      return
    }

    const updated = { ...data, slug: slugVal }
    await setConversation(chatId, 'blog_create', 2, updated)
    await ctx.reply('📝 *Step 3/6: Excerpt*\n\nEnter a brief excerpt or summary for the article:', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  if (step === 2) {
    // Save Excerpt, ask for Content
    if (!text.trim()) {
      await ctx.reply('❌ Excerpt cannot be empty. Please enter the excerpt:')
      return
    }
    if (text.length > 1000) {
      await ctx.reply('❌ Excerpt is too long (max 1000 chars). Enter excerpt:')
      return
    }
    const updated = { ...data, excerpt: text }
    await setConversation(chatId, 'blog_create', 3, updated)
    await ctx.reply('📝 *Step 4/6: Content*\n\nSend the blog content (markdown text) or upload a `.md` file:', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  if (step === 3) {
    // Save Content (handles document or text), ask for Tags
    let contentVal = ''
    if (ctx.message?.document) {
      try {
        contentVal = await handleDocumentUpload(ctx)
      } catch (err: any) {
        await ctx.reply(`❌ Document download failed: ${err.message}. Please send the content text or try uploading again:`)
        return
      }
    } else {
      contentVal = text
    }

    if (!contentVal.trim()) {
      await ctx.reply('❌ Content cannot be empty. Please send the blog content:')
      return
    }

    const updated = { ...data, content: contentVal }
    await setConversation(chatId, 'blog_create', 4, updated)
    await ctx.reply('📝 *Step 5/6: Tags*\n\nEnter tags (comma-separated, e.g. `React, Nextjs, Web`):', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  if (step === 4) {
    // Save Tags, ask for Published status
    const tagsVal = text.trim()
    if (tagsVal.length > 1000) {
      await ctx.reply('❌ Tags string is too long (max 1000 chars). Enter tags:')
      return
    }
    const updated = { ...data, tags: tagsVal }
    await setConversation(chatId, 'blog_create', 5, updated)
    await ctx.reply('📝 *Step 6/6: Publish*\n\nPublish immediately? Type `yes` to publish or `no` to save as draft:', {
      parse_mode: 'Markdown',
      reply_markup: cancelKB(),
    })
    return
  }

  if (step === 5) {
    // Save Published status, ask for confirmation
    const val = text.trim().toLowerCase()
    if (val !== 'yes' && val !== 'no') {
      await ctx.reply('❌ Invalid input. Please type `yes` or `no`: ')
      return
    }
    const publishedVal = val === 'yes'
    
    // Estimate read time
    const words = data.content.split(/\s+/).length
    const minutes = Math.max(1, Math.round(words / 200))
    const readTimeVal = `${minutes} min read`

    const updated: any = { ...data, published: publishedVal, read_time: readTimeVal }
    await setConversation(chatId, 'blog_create', 6, updated)

    const summary = `📝 *Verify Article Details*
*Title:* ${updated.title}
*Slug:* /${updated.slug}
*Excerpt:* ${updated.excerpt}
*Tags:* ${updated.tags}
*Read Time:* ${updated.read_time}
*Status:* ${updated.published ? 'Published 📢' : 'Draft 📁'}

Do you confirm insertion of this blog post?`

    await ctx.reply(summary, {
      parse_mode: 'Markdown',
      reply_markup: confirmKB('blog_create_confirm'),
    })
    return
  }
}

// Conversation step processor for editing fields
export async function handleBlogEditStep(ctx: Context, data: Record<string, any>) {
  const chatId = ctx.chat!.id
  const text = ctx.message?.text || ''
  const id = data.id
  const field = data.field

  let val: any = text
  if (field === 'slug') {
    val = slugify(text)
  }

  if (!val.trim() && field !== 'cover_image') {
    await ctx.reply('❌ Value cannot be empty. Please enter the new value:')
    return
  }

  const supabase = getSupabaseAdmin()
  const payload: Record<string, any> = {
    [field]: val,
    updated_at: new Date().toISOString(),
  }

  if (field === 'content') {
    // Recalculate read time
    const words = val.split(/\s+/).length
    const minutes = Math.max(1, Math.round(words / 200))
    payload.read_time = `${minutes} min read`
  }

  const { error } = await supabase.from('blogs').update(payload).eq('id', id)
  if (error) {
    await ctx.reply(`❌ Failed to update field: ${error.message}`)
    return
  }

  revalidateHome()
  await clearConversation(chatId)
  await ctx.reply(`✅ Successfully updated field *${field}* for blog ID *${id}*.`, { parse_mode: 'Markdown' })
}

// Action dispatcher
export async function handleBlogCallback(ctx: Context, action: string) {
  const chatId = ctx.chat!.id

  // Start edit field prompt
  if (action.startsWith('field_')) {
    const parts = action.replace('field_', '').split('_')
    const field = parts[0]
    const id = parts[1]
    
    await setConversation(chatId, 'blog_edit', 0, { id, field })
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
    const { error } = await supabase.from('blogs').delete().eq('id', id)
    if (error) {
      await ctx.editMessageText(`❌ Failed to delete blog ID *${id}*: ${error.message}`, { parse_mode: 'Markdown' })
    } else {
      revalidateHome()
      await ctx.editMessageText(`✅ Deleted blog ID *${id}* successfully.`, { parse_mode: 'Markdown' })
    }
    await ctx.answerCallbackQuery()
    return
  }

  if (action.startsWith('delete_no_')) {
    const id = action.replace('delete_no_', '')
    await ctx.editMessageText(`❌ Deletion of blog ID *${id}* cancelled.`, { parse_mode: 'Markdown' })
    await ctx.answerCallbackQuery()
    return
  }

  // Insert Confirm
  if (action === 'create_confirm_yes') {
    const state = await getConversation(chatId)
    if (!state || state.command !== 'blog_create') {
      await ctx.editMessageText('❌ Session expired or invalid.')
      await ctx.answerCallbackQuery()
      return
    }
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('blogs').insert(state.data)
    if (error) {
      await ctx.editMessageText(`❌ Database insertion failed: ${error.message}`)
    } else {
      revalidateHome()
      await ctx.editMessageText('🎉 Blog post created successfully!')
      await clearConversation(chatId)
    }
    await ctx.answerCallbackQuery()
    return
  }

  if (action === 'create_confirm_no') {
    await clearConversation(chatId)
    await ctx.editMessageText('❌ Blog post creation discarded.')
    await ctx.answerCallbackQuery()
    return
  }

  // Button actions (Edit / Delete / Publish) directly under item
  if (action.startsWith('btn_edit_')) {
    const id = action.replace('btn_edit_', '')
    await showEditFields(ctx, id)
    await ctx.answerCallbackQuery()
    return
  }

  if (action.startsWith('btn_del_')) {
    const id = action.replace('btn_del_', '')
    await ctx.reply(`⚠️ Are you sure you want to delete blog ID *${id}*?`, {
      parse_mode: 'Markdown',
      reply_markup: confirmKB('blog_delete', id),
    })
    await ctx.answerCallbackQuery()
    return
  }

  if (action.startsWith('btn_pub_')) {
    const id = action.replace('btn_pub_', '')
    await togglePublish(ctx, id)
    await ctx.answerCallbackQuery()
    return
  }
}
