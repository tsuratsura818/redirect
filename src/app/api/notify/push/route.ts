import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notifyUser } from '@/lib/firebase-admin'

// 手動プッシュ通知送信（管理者用 or 内部呼び出し用）
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { userId, title, body, data } = await request.json()

    // 自分自身への通知、または管理者からの通知のみ許可
    const targetUserId = userId ?? user.id
    if (targetUserId !== user.id) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (profile?.role !== 'admin') {
        return NextResponse.json({ error: '権限がありません' }, { status: 403 })
      }
    }

    if (!title || !body) {
      return NextResponse.json({ error: 'title と body は必須です' }, { status: 400 })
    }

    const result = await notifyUser(targetUserId, title, body, data)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}
