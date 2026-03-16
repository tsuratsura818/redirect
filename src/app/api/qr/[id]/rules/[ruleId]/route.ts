import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ruleId: string }> }
) {
  const { id, ruleId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  // オーナー確認
  const { data: qrCode } = await supabase
    .from('qr_codes')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!qrCode) {
    return NextResponse.json({ error: '見つかりません' }, { status: 404 })
  }

  const body = await request.json()

  const { data, error } = await supabase
    .from('redirect_rules')
    .update(body)
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
    user_id: user.id,
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

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
    user_id: user.id,
    action: 'delete',
    changes: { rule_id: ruleId },
  })

  return NextResponse.json({ success: true })
}
