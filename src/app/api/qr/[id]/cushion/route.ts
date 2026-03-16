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

  const { data } = await supabase
    .from('cushion_pages')
    .select('*')
    .eq('qr_code_id', id)
    .single()

  return NextResponse.json(data || null)
}

export async function PUT(
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

  // 既存チェック
  const { data: existing } = await supabase
    .from('cushion_pages')
    .select('id')
    .eq('qr_code_id', id)
    .single()

  if (existing) {
    const { data, error } = await supabase
      .from('cushion_pages')
      .update(body)
      .eq('qr_code_id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 })
    }
    return NextResponse.json(data)
  }

  const { data, error } = await supabase
    .from('cushion_pages')
    .insert({ qr_code_id: id, ...body })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: '作成に失敗しました' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
