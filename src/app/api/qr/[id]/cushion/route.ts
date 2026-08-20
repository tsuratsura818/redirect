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

  const { data } = await supabase
    .from('cushion_pages')
    .select('*')
    .eq('qr_code_id', id)
    .maybeSingle()

  return NextResponse.json(data || null)
}

export async function PUT(
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
  // 受け付けるカラムをホワイトリスト化（qr_code_id 等の上書きを防止）
  const allowed = [
    'is_active', 'title', 'message', 'button_text',
    'background_color', 'text_color', 'accent_color', 'logo_url',
    'display_seconds', 'coupon_enabled', 'coupon_code', 'coupon_note',
  ] as const
  const fields: Record<string, unknown> = {}
  for (const key of allowed) {
    if (body[key] !== undefined) fields[key] = body[key]
  }

  // 既存チェック
  const { data: existing } = await supabase
    .from('cushion_pages')
    .select('id')
    .eq('qr_code_id', id)
    .maybeSingle()

  if (existing) {
    const { data, error } = await supabase
      .from('cushion_pages')
      .update(fields)
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
    .insert({ qr_code_id: id, ...fields })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: '作成に失敗しました' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
