import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

// 管理者: 全フィードバック一覧
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('feedbacks')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// 管理者: ステータス・メモ更新
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id, status, admin_note } = await req.json()
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const admin = createAdminClient()
  const updates: Record<string, unknown> = {}
  if (status) updates.status = status
  if (typeof admin_note === 'string') updates.admin_note = admin_note

  const { error } = await admin.from('feedbacks').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
