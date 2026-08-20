// コア機能テスト (DB + 公開エンドポイント)
// テストユーザー2人を作って各種挙動を検証 → 最後に CASCADE 削除
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n').filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')] })
)
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL
const SVC = env.SUPABASE_SERVICE_ROLE_KEY
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const BASE = env.NEXT_PUBLIC_BASE_URL

const admin = createClient(URL_, SVC, { auth: { persistSession: false } })
const pub = createClient(URL_, ANON, { auth: { persistSession: false } })

const results = []
function check(label, cond, info = '') {
  const pass = !!cond
  results.push({ label, pass, info })
  console.log(`${pass ? '✅' : '❌'} ${label}${info ? '   ' + info : ''}`)
}

const ts = Date.now()
const cleanup = []  // 後始末リスト

try {
  // ========== Setup ==========
  console.log('\n=== Setup: テストユーザー2人作成 ===')
  const t1 = await admin.auth.admin.createUser({
    email: `nishikawa+coretest1-${ts}@tsuratsura.com`, password: 'test12345678', email_confirm: true,
  })
  if (t1.error) throw new Error('user1 create: ' + t1.error.message)
  const u1 = t1.data.user.id
  cleanup.push(u1)
  console.log('user1:', u1, t1.data.user.email)

  const t2 = await admin.auth.admin.createUser({
    email: `nishikawa+coretest2-${ts}@tsuratsura.com`, password: 'test12345678', email_confirm: true,
  })
  if (t2.error) throw new Error('user2 create: ' + t2.error.message)
  const u2 = t2.data.user.id
  cleanup.push(u2)
  console.log('user2:', u2, t2.data.user.email)

  // ========== 1. signup → trigger 自動行作成 ==========
  console.log('\n=== [1] signup → handle_new_user トリガー動作 ===')
  const p1 = await admin.from('user_profiles').select('*').eq('id', u1).maybeSingle()
  check('user_profiles 自動行作成', !!p1.data, `display_name=${p1.data?.display_name}`)
  const s1 = await admin.from('user_subscriptions').select('*').eq('user_id', u1).maybeSingle()
  check('user_subscriptions plan=free 自動作成', s1.data?.plan === 'free')

  // ========== 2. RLS: 自分の user_profiles だけ見える ==========
  console.log('\n=== [2] RLS 動作確認 ===')
  const sess1 = await pub.auth.signInWithPassword({ email: t1.data.user.email, password: 'test12345678' })
  if (sess1.error) throw new Error('signIn user1: ' + sess1.error.message)
  const user1Client = createClient(URL_, ANON, {
    global: { headers: { Authorization: `Bearer ${sess1.data.session.access_token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const ownProf = await user1Client.from('user_profiles').select('*').eq('id', u1).maybeSingle()
  check('自分の user_profiles 取得可', ownProf.data?.id === u1)
  const otherProf = await user1Client.from('user_profiles').select('*').eq('id', u2).maybeSingle()
  check('他人の user_profiles 取得不可', otherProf.data === null, '(RLS によりフィルタ)')

  // ========== 3. QR 作成 (user1 で 3 件 = Free上限) ==========
  console.log('\n=== [3] QR 作成 (Free上限3まで) ===')
  const slugs = []
  for (let i = 1; i <= 3; i++) {
    const slug = `core-test-${ts}-${i}`
    const r = await user1Client.from('qr_codes').insert({
      user_id: u1, name: `Core test ${i}`, slug, default_url: 'https://example.com/' + i,
    }).select().single()
    check(`QR ${i}/3 作成成功 (RLS owner_all)`, !r.error, r.error?.message ?? `slug=${slug}`)
    if (!r.error) slugs.push({ id: r.data.id, slug })
  }

  // ========== 4. プラン上限ロジック (API checkQrLimit 相当) ==========
  console.log('\n=== [4] プラン上限ロジック整合性 ===')
  const PLAN_LIMITS = { free: 3, pro: 50, business: -1 }
  const { count: cnt } = await admin.from('qr_codes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', u1)
  const sub = await admin.from('user_subscriptions').select('plan').eq('user_id', u1).single()
  const max = PLAN_LIMITS[sub.data.plan]
  const apiAllowedAt4 = cnt < max
  check('Free 3件作成済み → API が 4件目を拒否する条件', !apiAllowedAt4,
    `現在 ${cnt}件 / 上限 ${max}件 → API は 403 を返す`)

  // ========== 5. /r/[slug] 公開リダイレクト ==========
  console.log('\n=== [5] /r/[slug] 公開リダイレクト ===')
  const targetSlug = slugs[0].slug
  const r1 = await fetch(`${BASE}/r/${targetSlug}`, { redirect: 'manual' })
  check('/r/<slug> → 3xx', r1.status >= 300 && r1.status < 400, `status=${r1.status}`)
  const loc = r1.headers.get('location')
  check('Location ヘッダ = default_url', loc === 'https://example.com/1', `actual=${loc}`)

  // scan_logs に行が入ったか + scan_count トリガー
  await new Promise(r => setTimeout(r, 1500))
  const qrAfter = await admin.from('qr_codes').select('scan_count').eq('slug', targetSlug).single()
  check('scan_count トリガーで +1', qrAfter.data?.scan_count >= 1, `scan_count=${qrAfter.data?.scan_count}`)
  const logs = await admin.from('scan_logs').select('*').eq('qr_code_id', slugs[0].id)
  check('scan_logs に記録', (logs.data?.length ?? 0) >= 1, `${logs.data?.length} 行`)

  // ========== 6. 無効な slug → not_found ==========
  console.log('\n=== [6] 無効な slug ===')
  const r404 = await fetch(`${BASE}/r/no-such-slug-${ts}`, { redirect: 'manual' })
  check('存在しない slug → 4xx', r404.status >= 400 && r404.status < 500, `status=${r404.status}`)

  // ========== 7. プラン切替 → 上限解除 ==========
  console.log('\n=== [7] プラン切替 (Free→Pro) ===')
  await admin.from('user_subscriptions').update({ plan: 'pro', status: 'active' }).eq('user_id', u1)
  const subAfter = await admin.from('user_subscriptions').select('plan').eq('user_id', u1).single()
  check('user_subscriptions.plan = pro', subAfter.data?.plan === 'pro')

  const { count: cntAfter } = await admin.from('qr_codes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', u1)
  const maxPro = PLAN_LIMITS[subAfter.data.plan]
  check('Pro 切替後の上限チェック (3 < 50 → 4件目作成OK)', cntAfter < maxPro,
    `${cntAfter}件 / 上限 ${maxPro}件`)

  // ========== 8. 他人の QR を user1 が GET できないこと ==========
  console.log('\n=== [8] RLS: 他人の qr_codes 操作 ===')
  // user2 でQRを作る
  const sess2 = await pub.auth.signInWithPassword({ email: t2.data.user.email, password: 'test12345678' })
  const user2Client = createClient(URL_, ANON, {
    global: { headers: { Authorization: `Bearer ${sess2.data.session.access_token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const qr2 = await user2Client.from('qr_codes').insert({
    user_id: u2, name: 'User2 QR', slug: `core-test-${ts}-u2`, default_url: 'https://other.com',
  }).select().single()
  check('user2 が自分の QR 作成', !qr2.error)

  // user1 が user2 の QR を UPDATE しようとする → 失敗 (RLS owner_all)
  const tryUpd = await user1Client.from('qr_codes')
    .update({ name: 'hijacked' }).eq('id', qr2.data.id).select()
  // RLS で行が見えない → 戻り値が [] になる (エラーにはならない仕様)
  check('user1 から user2 の qr_codes UPDATE は無効', (tryUpd.data?.length ?? 0) === 0,
    `affected rows = ${tryUpd.data?.length ?? 0}`)

  // qr_codes は public SELECT が有効 (リダイレクト用)、これは設計仕様
  const pubSel = await user1Client.from('qr_codes').select('id, slug').eq('id', qr2.data.id).maybeSingle()
  check('qr_codes は公開SELECT (リダイレクト判定用、設計仕様)', !!pubSel.data,
    'public_read policy: 仕様通り')

  // ========== 9. 管理画面 API レイヤー (plan 列含む) ==========
  console.log('\n=== [9] /api/admin/users ロジック再現 (plan列含む) ===')
  const { data: { users: allUsers } } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const { data: allSubs } = await admin.from('user_subscriptions').select('user_id, plan, status')
  const subMap = new Map((allSubs || []).map(s => [s.user_id, s]))
  const apiResult = allUsers.map(u => ({
    id: u.id,
    email: u.email,
    plan: subMap.get(u.id)?.plan || 'free',
  }))
  const user1Result = apiResult.find(r => r.id === u1)
  check('admin API 戻り値に plan 列', !!user1Result?.plan,
    `user1.plan=${user1Result?.plan}`)
  check('user1 の plan = pro (上で切替済)', user1Result?.plan === 'pro')

  // ========== 10. メール送信 (Resend SMTP 経由) — レート消費するので signUp は省略 ==========
  // → 既に nishikawa+pivotest で確認済、ここではスキップ

  // ========== 11. CASCADE 削除 ==========
  console.log('\n=== [10] CASCADE 削除 ===')
  const u1QrIds = (await admin.from('qr_codes').select('id').eq('user_id', u1)).data?.map(r => r.id) ?? []
  const u1LogCount = (await admin.from('scan_logs').select('id', { count: 'exact', head: true })
    .in('qr_code_id', u1QrIds)).count ?? 0
  console.log(`(削除前: user1 の qr_codes=${u1QrIds.length}件, scan_logs=${u1LogCount}件)`)

  await admin.auth.admin.deleteUser(u1)
  cleanup.shift()  // u1 は削除済

  const profGone = await admin.from('user_profiles').select('id').eq('id', u1).maybeSingle()
  const subGone = await admin.from('user_subscriptions').select('id').eq('user_id', u1).maybeSingle()
  const qrGone = await admin.from('qr_codes').select('id').in('id', u1QrIds.length ? u1QrIds : ['00000000-0000-0000-0000-000000000000'])
  check('user 削除 → user_profiles CASCADE', !profGone.data)
  check('user 削除 → user_subscriptions CASCADE', !subGone.data)
  check('user 削除 → qr_codes CASCADE', (qrGone.data?.length ?? 0) === 0)
} catch (e) {
  console.error('\n!!! Test halted by exception:', e.message)
} finally {
  // ========== Cleanup ==========
  console.log('\n=== Cleanup ===')
  for (const uid of cleanup) {
    const d = await admin.auth.admin.deleteUser(uid)
    console.log(`deleteUser ${uid}: ${d.error?.message ?? 'ok'}`)
  }

  // ========== Summary ==========
  console.log('\n========== SUMMARY ==========')
  const pass = results.filter(r => r.pass).length
  const fail = results.filter(r => !r.pass).length
  console.log(`PASS: ${pass} / ${pass + fail}`)
  if (fail > 0) {
    console.log('\nFAIL items:')
    results.filter(r => !r.pass).forEach(r => console.log(`  ❌ ${r.label} — ${r.info}`))
  }
}
