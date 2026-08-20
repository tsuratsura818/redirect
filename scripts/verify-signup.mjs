// 修正後の動作検証: admin.createUser で実際にユーザーを作り、
// user_profiles と user_subscriptions の自動行が入るかを確認 → 後始末
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n').filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')] })
)

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

const email = `verify+${Date.now()}@anshin-inter.com`
console.log('createUser email:', email)
const c = await admin.auth.admin.createUser({ email, password: 'test12345678', email_confirm: true })
console.log('createUser error:', c.error)
if (!c.data?.user) process.exit(1)
const uid = c.data.user.id
console.log('uid:', uid)

const p = await admin.from('user_profiles').select('*').eq('id', uid).maybeSingle()
const s = await admin.from('user_subscriptions').select('*').eq('user_id', uid).maybeSingle()
console.log('user_profiles row:', p.data, '/ err:', p.error?.message)
console.log('user_subscriptions row:', s.data, '/ err:', s.error?.message)

const d = await admin.auth.admin.deleteUser(uid)
console.log('cleanup deleteUser err:', d.error?.message ?? 'ok')
