// Supabase Auth に Resend SMTP を投入
import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const PAT = process.env.SUPABASE_PAT
const REF = 'kqsjflnwuqgzzmdejgil'
if (!PAT) { console.error('SUPABASE_PAT env missing'); process.exit(1) }

// Resend API key を Vercel env から取得
console.log('--- pulling RESEND_API_KEY from vercel ---')
execSync('vercel env pull .env.prod-tmp --environment=production --yes', { stdio: 'inherit' })
const envText = readFileSync(new URL('../.env.prod-tmp', import.meta.url), 'utf8')
const m = envText.match(/^RESEND_API_KEY=(?:"?)([^"\n]+)/m)
if (!m) { console.error('RESEND_API_KEY not found'); process.exit(1) }
const RESEND_API_KEY = m[1]
execSync('rm -f .env.prod-tmp')
console.log('RESEND_API_KEY prefix:', RESEND_API_KEY.slice(0, 8) + '...')

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

const payload = {
  smtp_admin_email: 'nishikawa+redirect@tsuratsura.com',
  smtp_sender_name: 'Pivolink',
  smtp_host: 'smtp.resend.com',
  smtp_port: '465',
  smtp_user: 'resend',
  smtp_pass: RESEND_API_KEY,
  smtp_max_frequency: 1,
}

console.log('\n--- PATCH /config/auth ---')
const after = await api('PATCH', '/config/auth', payload)
const show = ['smtp_admin_email', 'smtp_sender_name', 'smtp_host', 'smtp_port', 'smtp_user', 'smtp_max_frequency']
for (const k of show) console.log(`  ${k}:`, after[k])
console.log('  smtp_pass:', after.smtp_pass ? '<set>' : '<missing>')
