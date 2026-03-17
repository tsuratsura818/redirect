import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || ''

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

    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        category: categoryLabel[category] || category,
        message,
      }),
    })

    if (!res.ok) {
      return NextResponse.json({ error: '送信に失敗しました' }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
