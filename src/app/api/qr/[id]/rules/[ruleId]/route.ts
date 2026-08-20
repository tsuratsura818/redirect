import { NextRequest, NextResponse } from 'next/server'
import { requireUser, requireQrOwner } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ruleId: string }> }
) {
  const { id, ruleId } = await params
  const auth = await requireUser()
  if (auth.error) return auth.error
  const { supabase, userId } = auth

  // オーナー確認
  const ownerError = await requireQrOwner(supabase, id, userId)
  if (ownerError) return ownerError

  const body = await request.json()
  const allowed = ['name', 'destination_url', 'priority', 'condition_type', 'condition_value', 'is_active'] as const
  const updateData: Record<string, unknown> = {}
  for (const key of allowed) {
    if (body[key] !== undefined) updateData[key] = body[key]
  }

  const { data, error } = await supabase
    .from('redirect_rules')
    .update(updateData)
    .eq('id', ruleId)
    .eq('qr_code_id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 })
  }

  // 変更履歴
  await supabase.from('redirect_history').insert({
    qr_code_id: id,
    user_id: userId,
    action: 'update',
    changes: { rule_id: ruleId, ...body },
  })

  return NextResponse.json(data)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ruleId: string }> }
) {
  const { id, ruleId } = await params
  const auth = await requireUser()
  if (auth.error) return auth.error
  const { supabase, userId } = auth

  // オーナー確認
  const ownerError = await requireQrOwner(supabase, id, userId)
  if (ownerError) return ownerError

  const { error } = await supabase
    .from('redirect_rules')
    .delete()
    .eq('id', ruleId)
    .eq('qr_code_id', id)

  if (error) {
    return NextResponse.json({ error: '削除に失敗しました' }, { status: 500 })
  }

  await supabase.from('redirect_history').insert({
    qr_code_id: id,
    user_id: userId,
    action: 'delete',
    changes: { rule_id: ruleId },
  })

  return NextResponse.json({ success: true })
}
