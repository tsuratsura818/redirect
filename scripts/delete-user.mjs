// 指定 email のユーザーを auth.users から削除
// user_profiles / user_subscriptions / qr_codes 等は ON DELETE CASCADE で連動削除される
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const target = process.argv[2]
if (!target) { console.error('usage: node scripts/delete-user.mjs <email>'); process.exit(1) }

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

if (!user) { console.log(`not found: ${target}`); process.exit(0) }

console.log('found:', { id: user.id, email: user.email, created_at: user.created_at })

const p = await admin.from('user_profiles').select('*').eq('id', user.id).maybeSingle()
const s = await admin.from('user_subscriptions').select('*').eq('user_id', user.id).maybeSingle()
const q = await admin.from('qr_codes').select('id,slug,name').eq('user_id', user.id)
console.log('user_profiles row:', p.data ? 'yes' : 'no')
console.log('user_subscriptions row:', s.data ? `yes (plan=${s.data.plan})` : 'no')
console.log('qr_codes owned:', q.data?.length ?? 0, q.data?.length ? `→ ${q.data.map(x => x.slug).join(', ')}` : '')

const del = await admin.auth.admin.deleteUser(user.id)
console.log('deleteUser:', del.error ?? 'ok')

const p2 = await admin.from('user_profiles').select('id').eq('id', user.id).maybeSingle()
const s2 = await admin.from('user_subscriptions').select('id').eq('user_id', user.id).maybeSingle()
console.log('after delete - user_profiles row remains:', !!p2.data, '/ user_subscriptions row remains:', !!s2.data)
