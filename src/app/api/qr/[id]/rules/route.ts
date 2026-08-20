import { NextRequest, NextResponse } from 'next/server'
import { requireUser, requireQrOwner } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireUser()
  if (auth.error) return auth.error
  const { supabase } = auth

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
  const auth = await requireUser()
  if (auth.error) return auth.error
  const { supabase, userId } = auth

  // オーナー確認
  const ownerError = await requireQrOwner(supabase, id, userId)
  if (ownerError) return ownerError

  const body = await request.json()
  const { name, destination_url, priority, condition_type, condition_value } = body

  if (!name || !destination_url || !condition_type) {
    return NextResponse.json({ error: '必須項目を入力してください' }, { status: 400 })
  }

  // 時間帯ルールはQRあたり3つまで
  if (condition_type === 'time_of_day') {
    const { count } = await supabase
      .from('redirect_rules')
      .select('id', { count: 'exact', head: true })
      .eq('qr_code_id', id)
      .eq('condition_type', 'time_of_day')
    if ((count ?? 0) >= 3) {
      return NextResponse.json({ error: '時間帯ルールは3つまでです' }, { status: 400 })
    }
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
    user_id: userId,
    action: 'create',
    changes: { rule: { name, destination_url, condition_type } },
  })

  return NextResponse.json(data, { status: 201 })
}
