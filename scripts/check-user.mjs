// 指定 email の auth.users 状態を確認
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const target = process.argv[2]
if (!target) { console.error('usage: ... <email>'); process.exit(1) }

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n').filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')] })
)
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

let user = null
let page = 1
while (page < 20) {
  const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 })
  if (error) { console.error('listUsers error:', error); process.exit(1) }
  user = data.users.find(u => (u.email || '').toLowerCase() === target.toLowerCase())
  if (user) break
  if (data.users.length < 100) break
  page++
}

if (!user) {
  console.log(`NOT FOUND in auth.users: ${target}`)
  console.log('→ つまり「登録できてない」状態。次のsignupは新規として通る前提（ただし rate limit にかかる可能性あり）')
  process.exit(0)
}

console.log('FOUND:')
console.log('  id:', user.id)
console.log('  email:', user.email)
console.log('  created_at:', user.created_at)
console.log('  email_confirmed_at:', user.email_confirmed_at, user.email_confirmed_at ? '(確認済)' : '(未確認)')
console.log('  last_sign_in_at:', user.last_sign_in_at)
console.log('  banned_until:', user.banned_until)
