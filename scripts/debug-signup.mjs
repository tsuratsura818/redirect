// Debug: 新規signup失敗の根本原因特定
// 1) 実signup再現で詳細エラー取得（admin createUserで内部エラーを浮上させる）
// 2) auth.users トリガー / handle_new_user 関数定義をDBから取得
// 3) user_profiles と user_subscriptions のNOT NULL列を列挙

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n').filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')] })
)

const url = env.NEXT_PUBLIC_SUPABASE_URL
const service = env.SUPABASE_SERVICE_ROLE_KEY
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const admin = createClient(url, service, { auth: { persistSession: false } })
const pub = createClient(url, anon, { auth: { persistSession: false } })

// Try a real signup with a fresh email (anon) - same path the user used
const testEmail = `debug+${Date.now()}@example.com`
console.log('\n=== 1) anon supabase.auth.signUp re-creation ===')
console.log('email:', testEmail)
const s1 = await pub.auth.signUp({ email: testEmail, password: 'test12345678' })
console.log('data:', JSON.stringify(s1.data?.user ?? null))
console.log('error:', JSON.stringify(s1.error, null, 2))

// Same but via admin to get an internal error message (often more detail)
console.log('\n=== 2) admin.auth.admin.createUser ===')
const s2 = await admin.auth.admin.createUser({
  email: `debug-admin+${Date.now()}@example.com`,
  password: 'test12345678',
  email_confirm: true,
})
console.log('data:', JSON.stringify(s2.data?.user ?? null))
console.log('error:', JSON.stringify(s2.error, null, 2))

// Query the DB about the trigger function definition via PostgREST `rpc` is not exposed by default.
// Use the REST `pg-meta` style via /rest/v1/?select... won't work either. Instead, ask for table descriptions.
console.log('\n=== 3) Probe handle_new_user dependent tables ===')
for (const table of ['user_profiles', 'user_subscriptions', 'subscriptions']) {
  const r = await admin.from(table).select('*').limit(1)
  console.log(`\n[${table}] error:`, r.error?.message ?? null, 'rows:', r.data?.length)
  if (r.data && r.data[0]) console.log('  cols:', Object.keys(r.data[0]))
}

console.log('\n=== 4) Direct insert test bypassing trigger (admin into user_profiles) ===')
const fakeId = crypto.randomUUID()
const r3 = await admin.from('user_profiles').insert({ id: fakeId, display_name: 'debug' }).select()
console.log('insert error:', r3.error)
if (!r3.error) await admin.from('user_profiles').delete().eq('id', fakeId)

console.log('\n=== 5) Direct insert test into user_subscriptions ===')
const r4 = await admin.from('user_subscriptions').insert({ user_id: fakeId, plan: 'free' }).select()
console.log('insert error:', r4.error)
if (!r4.error) await admin.from('user_subscriptions').delete().eq('user_id', fakeId)
