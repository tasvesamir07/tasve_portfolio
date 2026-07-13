import { resolveBotToken, getSupabaseAdmin } from '../config'
import type { Context } from 'grammy'

export async function handlePhotoUpload(ctx: Context, oldUrl?: string): Promise<string> {
  const photo = ctx.message?.photo
  if (!photo || photo.length === 0) throw new Error('No photo found in message')
  const fileId = photo[photo.length - 1].file_id
  const file = await ctx.api.getFile(fileId)
  const filePath = file.file_path
  if (!filePath) throw new Error('No file path returned')
  
  const token = await resolveBotToken()
  const fileUrl = `https://api.telegram.org/file/bot${token}/${filePath}`
  const res = await fetch(fileUrl)
  if (!res.ok) throw new Error('Failed to download file from Telegram')
  const blob = await res.blob()
  const arrayBuffer = await blob.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  const ext = filePath.split('.').pop() || 'webp'
  const fileName = `${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}.${ext}`
  
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.storage
    .from('Media')
    .upload(fileName, buffer, { contentType: `image/${ext}` })
  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage.from('Media').getPublicUrl(fileName)
  
  // Try to remove old image if oldUrl was provided
  if (oldUrl) {
    try {
      const match = oldUrl.match(/\/object\/public\/Media\/(.+)$/)
      if (match && match[1]) {
        const decoded = decodeURIComponent(match[1])
        await supabase.storage.from('Media').remove([decoded])
      }
    } catch (e) {
      console.error('Failed to clean up old image:', e)
    }
  }
  
  return publicUrl
}

export async function handleDocumentUpload(ctx: Context): Promise<string> {
  const doc = ctx.message?.document
  if (!doc) throw new Error('No document found in message')
  const fileId = doc.file_id
  const file = await ctx.api.getFile(fileId)
  const filePath = file.file_path
  if (!filePath) throw new Error('No file path returned')
  
  const token = await resolveBotToken()
  const fileUrl = `https://api.telegram.org/file/bot${token}/${filePath}`
  const res = await fetch(fileUrl)
  if (!res.ok) throw new Error('Failed to download file from Telegram')
  return await res.text()
}
