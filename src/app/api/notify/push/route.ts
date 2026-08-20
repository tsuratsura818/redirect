import { NextRequest, NextResponse } from 'next/server'
import { notifyUser } from '@/lib/firebase-admin'
import { requireUser } from '@/lib/auth'

// 手動プッシュ通知送信（管理者用 or 内部呼び出し用）
export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser()
    if (auth.error) return auth.error
    const { supabase, userId } = auth

    const { userId: bodyUserId, title, body, data } = await request.json()

    // 他ユーザーへの通知は管理者のみ許可
    const targetUserId = typeof bodyUserId === 'string' && bodyUserId.length > 0 ? bodyUserId : userId
    if (targetUserId !== userId) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .single()
      if (!profile || profile.role !== 'admin') {
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
