import { getSupabaseAdmin } from './config'

export async function isAuthorized(chatId: number): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('authorized_chat_ids')
    .select('id')
    .eq('chat_id', chatId)
    .maybeSingle()
  if (error) {
    console.error('isAuthorized error:', error)
    return false
  }
  return !!data
}

export async function authorizeChat(chatId: number): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('authorized_chat_ids')
    .insert({ chat_id: chatId })
  if (error) {
    console.error('authorizeChat error:', error)
    return false
  }
  return true
}

export async function verifyPhone(inputPhone: string): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('profile')
    .select('phone')
    .eq('id', 1)
    .single()
  if (error) {
    console.error('verifyPhone error:', error)
    return false
  }
  const dbPhone = data.phone || ''
  
  // Normalize both phone numbers to compare digits only
  const normInput = inputPhone.replace(/\D/g, '')
  const normDb = dbPhone.replace(/\D/g, '')
  
  return normInput.length > 0 && normInput === normDb
}

export interface ConversationState {
  command: string
  step: number
  data: Record<string, any>
}

export async function getConversation(chatId: number): Promise<ConversationState | null> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('conversation_state')
    .select('command, step, data')
    .eq('user_id', chatId)
    .maybeSingle()
  if (error) {
    console.error('getConversation error:', error)
    return null
  }
  return data
}

export async function setConversation(
  chatId: number,
  command: string,
  step: number,
  data: Record<string, any>
): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('conversation_state')
    .upsert({
      user_id: chatId,
      command,
      step,
      data,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
  if (error) {
    console.error('setConversation error:', error)
    return false
  }
  return true
}

export async function clearConversation(chatId: number): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('conversation_state')
    .delete()
    .eq('user_id', chatId)
  if (error) {
    console.error('clearConversation error:', error)
    return false
  }
  return true
}
