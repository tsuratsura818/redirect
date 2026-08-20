// Apply fix-signup-trigger.sql via Supabase Management API, then verify
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const PAT = process.env.SUPABASE_PAT
const REF = 'kqsjflnwuqgzzmdejgil'
if (!PAT) { console.error('SUPABASE_PAT env missing'); process.exit(1) }

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n').filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')] })
)

async function runSql(query, label) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${PAT}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  })
  const text = await r.text()
  console.log(`\n=== ${label} ===\nstatus: ${r.status}\nbody: ${text.slice(0, 1500)}`)
  if (!r.ok) throw new Error(`SQL failed: ${label}`)
  try { return JSON.parse(text) } catch { return text }
}

// 1) Inspect CURRENT handle_new_user definition first
await runSql(
  `SELECT p.proname, pg_get_functiondef(p.oid) AS definition
   FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
   WHERE n.nspname IN ('public','auth') AND p.proname = 'handle_new_user'`,
  'BEFORE: handle_new_user definition'
)
await runSql(
  `SELECT t.tgname, c.relname AS table, p.proname AS function, t.tgenabled
   FROM pg_trigger t JOIN pg_class c ON t.tgrelid = c.oid
   JOIN pg_proc p ON t.tgfoid = p.oid
   WHERE NOT t.tgisinternal AND c.relname = 'users' AND c.relnamespace = 'auth'::regnamespace`,
  'BEFORE: triggers on auth.users'
)

// 2) Apply fix
const fixSql = readFileSync(new URL('../supabase/fix-signup-trigger.sql', import.meta.url), 'utf8')
await runSql(fixSql, 'APPLY fix-signup-trigger.sql')

// 3) Verify new definition
await runSql(
  `SELECT p.proname, pg_get_functiondef(p.oid) AS definition
   FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
   WHERE n.nspname = 'public' AND p.proname = 'handle_new_user'`,
  'AFTER: handle_new_user definition'
)

// 4) Real signup test via anon
const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } })
const testEmail = `verify+${Date.now()}@example.com`
console.log(`\n=== VERIFY: supabase.auth.signUp with ${testEmail} ===`)
const s = await anon.auth.signUp({ email: testEmail, password: 'test12345678' })
console.log('user.id:', s.data?.user?.id ?? null)
console.log('error:', s.error ?? null)

// 5) Inspect side-effects: user_profiles & user_subscriptions rows
if (s.data?.user?.id) {
  const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  const p = await admin.from('user_profiles').select('*').eq('id', s.data.user.id).maybeSingle()
  const sub = await admin.from('user_subscriptions').select('*').eq('user_id', s.data.user.id).maybeSingle()
  console.log('user_profiles row:', p.data, 'err:', p.error?.message)
  console.log('user_subscriptions row:', sub.data, 'err:', sub.error?.message)

  // 6) Cleanup test user
  const del = await admin.auth.admin.deleteUser(s.data.user.id)
  console.log('cleanup deleteUser err:', del.error?.message ?? 'ok')
}
