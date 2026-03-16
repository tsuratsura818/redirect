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

  const { data: rules } = await supabase
    .from('redirect_rules')
    .select('*')
    .eq('qr_code_id', id)
    .order('priority', { ascending: false })

  return NextResponse.json(rules || [])
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
  const { name, destination_url, priority, condition_type, condition_value } = body

  if (!name || !destination_url || !condition_type) {
    return NextResponse.json({ error: '必須項目を入力してください' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('redirect_rules')
    .insert({
      qr_code_id: id,
      name,
      destination_url,
      priority: priority || 0,
      condition_type,
      condition_value: condition_value || {},
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: '作成に失敗しました' }, { status: 500 })
  }

  // 変更履歴
  await supabase.from('redirect_history').insert({
    qr_code_id: id,
    user_id: user.id,
    action: 'create',
    changes: { rule: { name, destination_url, condition_type } },
  })

  return NextResponse.json(data, { status: 201 })
}
