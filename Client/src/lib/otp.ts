import { randomInt } from 'node:crypto'
import { getSupabaseAdmin } from './supabase-admin'

export function generateOTP(): string {
  return randomInt(100000, 999999).toString()
}

export async function storeOTP(adminId: number): Promise<{ id: number; code: string } | null> {
  const supabase = getSupabaseAdmin()
  const code = generateOTP()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('otp_codes')
    .insert({ admin_id: adminId, code, expires_at: expiresAt })
    .select('id, code')
    .single()

  if (error) {
    console.error('Failed to store OTP:', error)
    return null
  }
  return data
}

export async function verifyOTP(adminId: number, code: string): Promise<boolean> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('otp_codes')
    .select('id, code, expires_at, used')
    .eq('admin_id', adminId)
    .eq('code', code)
    .eq('used', false)
    .gte('expires_at', new Date().toISOString())
    .limit(1)
    .single()

  if (error || !data) return false

  const { error: updateError } = await supabase
    .from('otp_codes')
    .update({ used: true })
    .eq('id', data.id)

  if (updateError) {
    console.error('Failed to mark OTP as used:', updateError)
  }

  return true
}
