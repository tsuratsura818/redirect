import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notifyAdmin } from '@/lib/notify'

export async function POST(req: Request) {
  // 同一オリジンからのリクエストのみ許可（簡易チェック）
  const origin = req.headers.get('origin') ?? ''
  const host   = req.headers.get('host')   ?? ''
  if (!origin.includes(host) && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let email = ''
  try {
    const body = await req.json() as { email?: string }
    email = body.email ?? ''
  } catch {
    // body が不正でも続行
  }

  // 現在の総ユーザー数を取得
  let userCount = '—'
  try {
    const supabase = await createClient()
    const { count } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
    userCount = String(count ?? '—')
  } catch {
    // 取得に失敗しても通知は送る
  }

  const result = await notifyAdmin({
    subject: `新規ユーザー登録: ${email}`,
    heading: '🎉 新規ユーザー登録',
    rows: [
      { label: 'メールアドレス', value: email || '（取得できませんでした）' },
      { label: '累計ユーザー数', value: `${userCount} 名` },
    ],
  })

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
