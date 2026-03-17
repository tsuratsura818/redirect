import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const categoryLabel: Record<string, string> = {
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

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
