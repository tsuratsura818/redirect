// Resend テスト送信 (UTF-8 明示版)
import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

execSync('vercel env pull .env.prod-tmp --environment=production --yes', { stdio: 'inherit' })
const envText = readFileSync(new URL('../.env.prod-tmp', import.meta.url), 'utf8')
const KEY = envText.match(/^RESEND_API_KEY=(?:"?)([^"\n]+)/m)[1]
execSync('rm -f .env.prod-tmp')

const body = {
  from: 'Pivolink <nishikawa+redirect@tsuratsura.com>',
  to: ['nishikawa@tsuratsura.com'],
  subject: '【Pivolink】Resend接続テスト（文字化け修正版）',
  html: `<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8"></head><body style="font-family:sans-serif;">
    <p>これは Resend 経由のテスト送信です。</p>
    <p>このメールが読めれば、UTF-8 で正しく届いています。</p>
    <p>From: Pivolink &lt;nishikawa+redirect@tsuratsura.com&gt;</p>
  </body></html>`,
}

const r = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${KEY}`,
    'Content-Type': 'application/json; charset=utf-8',
  },
  body: JSON.stringify(body),
})
console.log('status:', r.status, '\nbody:', await r.text())
