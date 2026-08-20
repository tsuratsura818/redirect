// 指定 email のユーザーのプランを変更（Stripe 経由しない、課金なし）
// usage: node scripts/set-plan.mjs <email> <plan>  e.g. node scripts/set-plan.mjs higasa@anshin-inter.com pro
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const [, , email, plan] = process.argv
if (!email || !plan) { console.error('usage: ... <email> <plan: free|pro|business>'); process.exit(1) }
if (!['free', 'pro', 'business'].includes(plan)) { console.error('plan must be free|pro|business'); process.exit(1) }

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n').filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')] })
)
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

// 1) ユーザー検索
let user = null, page = 1
while (page < 20) {
  const { data } = await admin.auth.admin.listUsers({ page, perPage: 100 })
  user = data.users.find(u => (u.email || '').toLowerCase() === email.toLowerCase())
  if (user || data.users.length < 100) break
  page++
}
if (!user) { console.error('user not found:', email); process.exit(1) }
console.log('user:', user.id, user.email)

// 2) 現在のプラン
const before = await admin.from('user_subscriptions').select('*').eq('user_id', user.id).maybeSingle()
console.log('before plan:', before.data?.plan, 'status:', before.data?.status,
  'stripe_subscription_id:', before.data?.stripe_subscription_id ?? '(null)')

// 3) プラン上書き (Stripe カラムは触らない)
const upd = await admin.from('user_subscriptions')
  .update({ plan, status: 'active', cancel_at_period_end: false })
  .eq('user_id', user.id)
  .select()
  .single()
if (upd.error) { console.error('update error:', upd.error); process.exit(1) }
console.log('after plan:', upd.data.plan, 'status:', upd.data.status,
  'stripe_subscription_id:', upd.data.stripe_subscription_id ?? '(null)')
