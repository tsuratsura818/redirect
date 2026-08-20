import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireUser } from '@/lib/auth'
import { notifyAdmin } from '@/lib/notify'

// ユーザー自身のフィードバック一覧
export async function GET() {
  const auth = await requireUser()
  if (auth.error) return auth.error
  const { userId } = auth

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('feedbacks')
    .select('id, type, title, body, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// フィードバック投稿
export async function POST(req: NextRequest) {
  const auth = await requireUser()
  if (auth.error) return auth.error
  const { userId } = auth

  const { type, title, body } = await req.json()
  if (!title || !body) {
    return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.from('feedbacks').insert({
    user_id: userId,
    type: type || 'improvement',
    title,
    body,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 利用者の生の声。溜まったまま気付かないのが一番もったいないので通知する
  const notified = await notifyAdmin({
    subject: `フィードバック: ${title}`,
    heading: '💬 フィードバックが届きました',
    rows: [
      { label: '種別', value: String(type || 'improvement') },
      { label: 'タイトル', value: String(title) },
      { label: '本文', value: String(body) },
    ],
    linkPath: '/dashboard/admin',
    linkLabel: '管理画面で確認する',
  })
  if (!notified.ok) {
    console.error('[feedback] 管理者通知に失敗:', notified.error)
  }

  return NextResponse.json({ success: true })
}
