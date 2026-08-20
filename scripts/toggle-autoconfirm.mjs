// mailer_autoconfirm を ON/OFF
// usage: node scripts/toggle-autoconfirm.mjs on|off
const PAT = process.env.SUPABASE_PAT
const REF = 'kqsjflnwuqgzzmdejgil'
const arg = (process.argv[2] || '').toLowerCase()
if (!PAT) { console.error('SUPABASE_PAT env missing'); process.exit(1) }
if (!['on', 'off'].includes(arg)) { console.error('usage: ... on|off'); process.exit(1) }

const next = arg === 'on'

const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/config/auth`, {
  method: 'PATCH',
  headers: { 'Authorization': `Bearer ${PAT}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ mailer_autoconfirm: next }),
})
const text = await r.text()
console.log('status:', r.status)
const json = JSON.parse(text)
console.log('mailer_autoconfirm:', json.mailer_autoconfirm)
