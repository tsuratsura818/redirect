import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const body = await request.json()
  const { name, slug, default_url, description } = body

  if (!name || !slug || !default_url) {
    return NextResponse.json({ error: '必須項目を入力してください' }, { status: 400 })
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
    return NextResponse.json({ error: 'スラッグは英数字、ハイフン、アンダースコアのみ使用できます' }, { status: 400 })
  }

  // スラッグの重複チェック
  const { data: existing } = await supabase
    .from('qr_codes')
    .select('id')
    .eq('slug', slug)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'このスラッグは既に使われています' }, { status: 409 })
  }

  const { data, error } = await supabase
    .from('qr_codes')
    .insert({
      user_id: user.id,
      name,
      slug,
      default_url,
      description: description || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: '作成に失敗しました' }, { status: 500 })
  }

  // 変更履歴を記録
  await supabase.from('redirect_history').insert({
    qr_code_id: data.id,
    user_id: user.id,
    action: 'create',
    changes: { name, slug, default_url },
  })

  return NextResponse.json(data, { status: 201 })
}
