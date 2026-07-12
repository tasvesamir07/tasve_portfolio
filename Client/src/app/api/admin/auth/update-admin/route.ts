import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const UpdateAdminSchema = z.object({
  email: z.string().email().max(300).optional(),
  display_name: z.string().max(200).optional(),
})

export async function PATCH(req: Request) {
  try {
    const parsed = UpdateAdminSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const updates: Record<string, string> = {}
    if (parsed.data.email !== undefined) updates.email = parsed.data.email
    if (parsed.data.display_name !== undefined) updates.display_name = parsed.data.display_name
    updates.updated_at = new Date().toISOString()

    if (Object.keys(updates).length <= 1) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data: admins } = await supabase.from('admins').select('id').limit(1)
    if (!admins || admins.length === 0) {
      return NextResponse.json({ error: 'No admin account found' }, { status: 404 })
    }

    const { error } = await supabase.from('admins').update(updates).eq('id', admins[0].id)
    if (error) {
      console.error('Update admin error:', error)
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Update admin error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
