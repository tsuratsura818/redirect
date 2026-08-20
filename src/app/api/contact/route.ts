import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notifyAdmin } from '@/lib/notify'

const categoryLabel: Record<string, string> = {
  consulting: '企画・導入のご相談',
  general: '一般的なお問い合わせ',
  bug: '不具合の報告',
  feature: '機能リクエスト',
  billing: 'お支払い・プランについて',
  other: 'その他',
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, category, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { error } = await admin.from('contact_messages').insert({
      name,
      email,
      category: categoryLabel[category] || category,
      message,
    })

    if (error) {
      return NextResponse.json({ error: '送信に失敗しました' }, { status: 500 })
    }

    // DBに入るだけだと誰も気付かない。通知に失敗しても問い合わせ自体は成功扱いにする
    const notified = await notifyAdmin({
      subject: `お問い合わせ: ${name}様`,
      heading: '📩 お問い合わせが届きました',
      rows: [
        { label: 'お名前', value: String(name) },
        { label: 'メール', value: String(email) },
        { label: '種別', value: categoryLabel[category] || String(category ?? '—') },
        { label: '本文', value: String(message) },
      ],
      linkPath: '/dashboard/admin',
      linkLabel: '管理画面で確認する',
    })
    if (!notified.ok) {
      console.error('[contact] 管理者通知に失敗:', notified.error)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
