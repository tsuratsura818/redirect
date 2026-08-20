// 1) site_url を localhost:3000 -> 本番 に
// 2) リダイレクト許可リストに本番ドメインを追加
// 3) 確認メール件名・本文・送信元名を Pivolink ブランドに
import { writeFileSync } from 'node:fs'

const PAT = process.env.SUPABASE_PAT
const REF = 'kqsjflnwuqgzzmdejgil'
const SITE = 'https://redirect.tsuratsura.com'
if (!PAT) { console.error('SUPABASE_PAT env missing'); process.exit(1) }

async function api(method, path, body) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}${path}`, {
    method,
    headers: { 'Authorization': `Bearer ${PAT}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await r.text()
  if (!r.ok) { console.error(`${method} ${path} -> ${r.status}\n${text}`); process.exit(1) }
  try { return JSON.parse(text) } catch { return text }
}

const showKeys = [
  'site_url', 'uri_allow_list', 'smtp_sender_name', 'smtp_admin_email', 'smtp_host',
  'mailer_subjects_confirmation', 'mailer_subjects_recovery',
  'mailer_subjects_magic_link', 'mailer_subjects_invite', 'mailer_subjects_email_change',
]

console.log('--- BEFORE ---')
const before = await api('GET', '/config/auth')
for (const k of showKeys) console.log(`  ${k}:`, typeof before[k] === 'string' ? before[k].slice(0, 100) : before[k])
writeFileSync(new URL('./_before-auth-config.json', import.meta.url), JSON.stringify(before, null, 2))

const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Hiragino Sans',sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1f2937;background:#ffffff;">
  <div style="text-align:center;margin-bottom:32px;">
    <div style="font-size:24px;font-weight:700;color:#1f2937;letter-spacing:-0.02em;">Pivolink</div>
    <div style="font-size:12px;color:#6b7280;margin-top:4px;">QR / NFC リダイレクト管理</div>
  </div>

  <h1 style="font-size:18px;font-weight:700;margin:0 0 16px;color:#1f2937;">メールアドレスの確認をお願いします</h1>

  <p style="font-size:14px;line-height:1.7;margin:0 0 24px;color:#374151;">
    Pivolink にご登録いただきありがとうございます。<br>
    下記のボタンからメールアドレスの確認を完了してください。
  </p>

  <div style="text-align:center;margin:32px 0;">
    <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 36px;background:#3b82f6;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;border-radius:8px;">メールアドレスを確認する</a>
  </div>

  <p style="font-size:12px;color:#6b7280;line-height:1.7;margin:24px 0 0;">
    ボタンが押せない場合は、下記URLをブラウザに貼り付けてください:<br>
    <a href="{{ .ConfirmationURL }}" style="color:#3b82f6;word-break:break-all;">{{ .ConfirmationURL }}</a>
  </p>

  <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px;">

  <p style="font-size:11px;color:#9ca3af;line-height:1.6;margin:0;">
    このメールに心当たりがない場合は破棄してください。<br>
    Pivolink — <a href="${SITE}" style="color:#9ca3af;">${SITE}</a>
  </p>
</div>`

const payload = {
  site_url: SITE,
  uri_allow_list: `${SITE},${SITE}/**,${SITE}/auth/callback,${SITE}/dashboard`,
  mailer_subjects_confirmation: '【Pivolink】メールアドレス確認のお願い',
  mailer_templates_confirmation_content: html,
  mailer_subjects_recovery: '【Pivolink】パスワード再設定のご案内',
  mailer_subjects_magic_link: '【Pivolink】ログインリンク',
  mailer_subjects_invite: '【Pivolink】招待のお知らせ',
  mailer_subjects_email_change: '【Pivolink】メールアドレス変更の確認',
}

console.log('\n--- PATCH ---')
const after = await api('PATCH', '/config/auth', payload)
for (const k of showKeys) console.log(`  ${k}:`, typeof after[k] === 'string' ? after[k].slice(0, 100) : after[k])
console.log('\nupdated OK')
