import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// デバイストークン登録・更新
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { token, platform } = await request.json()

    if (!token || !platform) {
      return NextResponse.json({ error: 'token と platform は必須です' }, { status: 400 })
    }

    if (!['ios', 'android', 'web'].includes(platform)) {
      return NextResponse.json({ error: '無効な platform です' }, { status: 400 })
    }

    const { error } = await supabase.from('device_tokens').upsert(
      {
        user_id: user.id,
        token,
        platform,
        is_active: true,
      },
      { onConflict: 'user_id,token' }
    )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

// デバイストークン削除（ログアウト時）
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'token は必須です' }, { status: 400 })
    }

    const { error } = await supabase
      .from('device_tokens')
      .delete()
      .eq('user_id', user.id)
      .eq('token', token)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}
