import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'

// デバイストークン登録・更新
export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser()
    if (auth.error) return auth.error
    const { supabase, userId } = auth

    const { token, platform } = await request.json()

    if (!token || !platform) {
      return NextResponse.json({ error: 'token と platform は必須です' }, { status: 400 })
    }

    if (!['ios', 'android', 'web'].includes(platform)) {
      return NextResponse.json({ error: '無効な platform です' }, { status: 400 })
    }

    const { error } = await supabase.from('device_tokens').upsert(
      {
        user_id: userId,
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
    const auth = await requireUser()
    if (auth.error) return auth.error
    const { supabase, userId } = auth

    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'token は必須です' }, { status: 400 })
    }

    const { error } = await supabase
      .from('device_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('token', token)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}
