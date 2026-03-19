import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const NOTIFY_TO   = 'nishikawa@tsuratsura.com'
const NOTIFY_FROM = 'Pivolink <notifications@redirect.tsuratsura.com>'

export async function POST(req: Request) {
  // 同一オリジンからのリクエストのみ許可（簡易チェック）
  const origin = req.headers.get('origin') ?? ''
  const host   = req.headers.get('host')   ?? ''
  if (!origin.includes(host) && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // RESEND_API_KEY 未設定時はサイレントにスキップ（登録自体は成功させる）
    console.warn('[notify/signup] RESEND_API_KEY が設定されていません')
    return NextResponse.json({ ok: true, skipped: true })
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
    // 取得失敗してもメール送信は続行
  }

  const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })

  const html = `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:520px;margin:0 auto;background:#f8fafc;border-radius:16px;overflow:hidden;">
      <!-- ヘッダー -->
      <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:32px 32px 24px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;">
          <div style="width:4px;height:24px;border-radius:2px;background:linear-gradient(to bottom,#43e97b,#10b981);"></div>
          <span style="font-size:18px;font-weight:800;letter-spacing:0.04em;color:#fff;">
            PIVO<span style="color:#10b981;">LINK</span>
          </span>
        </div>
        <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.01em;">
          🎉 新規ユーザー登録
        </h1>
        <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.5);">${now}</p>
      </div>

      <!-- 本文 -->
      <div style="padding:28px 32px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;width:100px;">メールアドレス</td>
            <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:600;color:#0f172a;">${email || '（取得できませんでした）'}</td>
          </tr>
          <tr>
            <td style="padding:12px 0;font-size:13px;color:#64748b;">累計ユーザー数</td>
            <td style="padding:12px 0;font-size:14px;font-weight:600;color:#0f172a;">${userCount} 名</td>
          </tr>
        </table>

        <div style="margin-top:24px;padding:16px 20px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;">
          <p style="margin:0;font-size:13px;color:#166534;line-height:1.6;">
            ダッシュボードで詳細を確認できます →
            <a href="https://redirect.tsuratsura.com/dashboard/admin" style="color:#10b981;font-weight:700;">管理画面を開く</a>
          </p>
        </div>
      </div>

      <!-- フッター -->
      <div style="padding:16px 32px;background:#f1f5f9;font-size:11px;color:#94a3b8;text-align:center;">
        Pivolink 自動通知 · redirect.tsuratsura.com
      </div>
    </div>
  `

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: NOTIFY_FROM,
        to: [NOTIFY_TO],
        subject: `【Pivolink】新規ユーザー登録: ${email}`,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[notify/signup] Resend error:', err)
      return NextResponse.json({ ok: false, error: err }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[notify/signup] fetch error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
