import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('qr_codes')
    .select('*, redirect_rules(*), cushion_pages(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: '見つかりません' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const body = await request.json()

  // オーナー確認
  const { data: existing } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: '見つかりません' }, { status: 404 })
  }

  const updateData: Record<string, unknown> = {}
  const changes: Record<string, { old: unknown; new: unknown }> = {}

  for (const key of ['name', 'default_url', 'description', 'is_active', 'expires_at', 'fallback_url'] as const) {
    if (body[key] !== undefined && body[key] !== existing[key]) {
      updateData[key] = body[key]
      changes[key] = { old: existing[key], new: body[key] }
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(existing)
  }

  const { data, error } = await supabase
    .from('qr_codes')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 })
  }

  // 変更履歴を記録
  await supabase.from('redirect_history').insert({
    qr_code_id: id,
    user_id: user.id,
    action: 'update',
    changes,
  })

  return NextResponse.json(data)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const { error } = await supabase
    .from('qr_codes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: '削除に失敗しました' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
