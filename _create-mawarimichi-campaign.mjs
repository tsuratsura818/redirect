/**
 * まわりみちの「実験期間」と「スポンサーCM枠」を PivoLink の機能で作る。
 *
 *   node _create-mawarimichi-campaign.mjs --dest https://mawarimichi.vercel.app \
 *        --start 2026-09-01T00:00 --end 2026-11-30T23:59
 *   node _create-mawarimichi-campaign.mjs --list
 *   node _create-mawarimichi-campaign.mjs --delete
 *
 * ─────────────────────────────────────────────
 * ① 実験期間の開始・終了 — 現地の看板を一度も触らずに切り替える
 *
 *   schedule          開始日時より前 → 「まだ始まっていません」へ
 *   scheduled_switch  終了日時を過ぎたら → 「お礼」ページへ
 *
 *   評価順が schedule > scheduled_switch > time_of_day > ... なので、
 *   期間外は必ずこの2つが勝つ。期間中はどちらも当たらず、通常のルールに落ちる。
 *
 * ② スポンサーCM — PivoLink のクッションページがそのまま広告枠になる
 *
 *   まわりみち（スタンプ3個ごと）
 *     → /r/mawarimichi-cm            入口。ab_test でスポンサーを振り分け
 *       → /r/mawarimichi-cm-a|b      それぞれクッションページ＝広告クリエイティブ
 *         → /cm/return               アプリが元の画面へ戻す
 *
 *   広告の文言・色・ロゴ・表示秒数・クーポンコードは cushion_pages に入り、
 *   PivoLink のダッシュボードから編集できる。表示回数も PivoLink のアナリティクスに乗る。
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf-8').split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()])
)
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const args = process.argv.slice(2)
const argOf = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined }
const DEST = (argOf('dest') || '').replace(/\/$/, '')
const PREFIX = 'mawarimichi-'
const PIVOLINK = 'https://redirect.tsuratsura.com'

/** JSTの "YYYY-MM-DDTHH:mm" を ISO(UTC) にする。★ここを間違えると9時間ズレる */
const jstToIso = (s) => new Date(`${s}:00+09:00`).toISOString()

const { data: qrs } = await db.from('qr_codes')
  .select('id, slug, name, default_url').like('slug', `${PREFIX}%`).order('sort_order')

if (args.includes('--list')) {
  for (const qr of qrs) {
    const { data: rules } = await db.from('redirect_rules').select('*')
      .eq('qr_code_id', qr.id)
      .in('condition_type', ['schedule', 'scheduled_switch'])
    const { data: cushion } = await db.from('cushion_pages').select('*').eq('qr_code_id', qr.id).maybeSingle()
    if (!rules?.length && !cushion) continue
    console.log(`\n${qr.slug}`)
    for (const r of rules ?? [])
      console.log(`  [${r.condition_type}] ${JSON.stringify(r.condition_value)} → ${r.destination_url.replace(/^https?:\/\/[^/]+/, '')}`)
    if (cushion)
      console.log(`  [cushion] "${cushion.title}" ${cushion.display_seconds}秒 有効=${cushion.is_active} クーポン=${cushion.coupon_code ?? 'なし'}`)
  }
  process.exit(0)
}

if (args.includes('--delete')) {
  const ids = qrs.map((q) => q.id)
  const { data: d1 } = await db.from('redirect_rules').delete().in('qr_code_id', ids)
    .in('condition_type', ['schedule', 'scheduled_switch']).select('id')
  const cmIds = qrs.filter((q) => q.slug.startsWith(`${PREFIX}cm`)).map((q) => q.id)
  await db.from('cushion_pages').delete().in('qr_code_id', cmIds)
  const { data: d2 } = await db.from('qr_codes').delete().in('id', cmIds).select('slug')
  console.log(`期間ルール${d1?.length ?? 0}件・CM枠${d2?.length ?? 0}件を削除しました`)
  process.exit(0)
}

if (!DEST) { console.error('--dest が必要です'); process.exit(1) }

const START = argOf('start') ?? '2026-08-18T00:00'
const END = argOf('end') ?? '2026-11-30T23:59'

const { data: users } = await db.auth.admin.listUsers()
const owner = users.users.find((u) => u.email === 'nishikawa@tsuratsura.com')
if (!owner) { console.error('所有者ユーザーが見つかりません'); process.exit(1) }

/* ---------- ① 実験期間 ---------- */

const periodRows = []
for (const qr of qrs) {
  if (qr.slug.startsWith(`${PREFIX}cm`)) continue // CM枠は期間の対象外

  periodRows.push({
    qr_code_id: qr.id,
    name: `開催前（〜${START}）`,
    // ★schedule は「この期間に入っていたら」なので、遠い過去〜開始直前 を窓にする
    destination_url: `${DEST}/notyet?from=${encodeURIComponent(qr.slug)}`,
    priority: 900,
    condition_type: 'schedule',
    condition_value: { start_at: jstToIso('2020-01-01T00:00'), end_at: jstToIso(START) },
    is_active: true,
  })

  periodRows.push({
    qr_code_id: qr.id,
    name: `開催終了（${END}〜）`,
    destination_url: `${DEST}/finished`,
    priority: 890,
    condition_type: 'scheduled_switch',
    condition_value: { switch_at: jstToIso(END) },
    is_active: true,
  })
}

await db.from('redirect_rules').delete()
  .in('qr_code_id', qrs.map((q) => q.id))
  .in('condition_type', ['schedule', 'scheduled_switch'])
const { data: added, error: e1 } = await db.from('redirect_rules').insert(periodRows).select('id')
if (e1) throw e1

/* ---------- ② スポンサーCM枠 ---------- */

/** スポンサー2枠（デモ）。文言・色・クーポンはダッシュボードから編集できる */
const SPONSORS = [
  {
    key: 'a',
    name: '京都・東山 観光協会（デモ枠）',
    cushion: {
      title: '東山を、もう一日。',
      message:
        'まわりみちで見つけた道は、まだ半分です。\n翌日また来ると、同じ目的地でもぜんぜん違う道になります。\n\n※これはスポンサー枠のデモ表示です',
      button_text: '道にもどる',
      background_color: '#2A2620',
      text_color: '#F7F2E8',
      accent_color: '#C8553D',
      display_seconds: 15,
      coupon_enabled: true,
      coupon_code: 'MAWARI-HIGASHIYAMA',
      coupon_note: '参加店舗でご提示ください（デモ表記・実利用はできません）',
    },
  },
  {
    key: 'b',
    name: '参加店舗共通（デモ枠）',
    cushion: {
      title: '歩いたあとの、一杯を。',
      message:
        'まわりみちの参加店で使える共通クーポンです。\n甘味・珈琲・おばんざい、坂の途中でひとやすみ。\n\n※これはスポンサー枠のデモ表示です',
      button_text: '道にもどる',
      background_color: '#3A5E4A',
      text_color: '#FFFFFF',
      accent_color: '#C9A227',
      display_seconds: 15,
      coupon_enabled: true,
      coupon_code: 'MAWARI-ICHIPAI',
      coupon_note: '1日1回・他券と併用不可（デモ表記・実利用はできません）',
    },
  },
]

// 既存のCM枠を作り直す
const oldCm = qrs.filter((q) => q.slug.startsWith(`${PREFIX}cm`)).map((q) => q.id)
if (oldCm.length) {
  await db.from('cushion_pages').delete().in('qr_code_id', oldCm)
  await db.from('qr_codes').delete().in('id', oldCm)
}

// スポンサーごとのQR（＝広告クリエイティブ1枠）
const sponsorRows = SPONSORS.map((s, i) => ({
  user_id: owner.id,
  slug: `${PREFIX}cm-${s.key}`,
  name: `まわりみち｜CM枠 ${s.name}`,
  description: 'スポンサーCM。クッションページが広告クリエイティブ本体',
  default_url: `${DEST}/cm/return?s=${s.key}`,
  is_active: true,
  sort_order: 900 + i,
  qr_color_dark: '#1B1814',
}))

// CMの入口QR（A/Bテストでスポンサーを振り分ける）
const entryRow = {
  user_id: owner.id,
  slug: `${PREFIX}cm`,
  name: 'まわりみち｜CM入口（スポンサー振り分け）',
  description: 'スタンプ3個ごとにここを通る。ab_test がスポンサーを選ぶ',
  default_url: `${DEST}/cm/return`,
  is_active: true,
  sort_order: 899,
  qr_color_dark: '#1B1814',
}

const { data: cmQrs, error: e2 } = await db.from('qr_codes')
  .insert([entryRow, ...sponsorRows]).select('id, slug')
if (e2) throw e2

const bySlug = Object.fromEntries(cmQrs.map((q) => [q.slug, q.id]))

// クッションページ（＝広告）をスポンサー枠に付ける
const { error: e3 } = await db.from('cushion_pages').insert(
  SPONSORS.map((s) => ({
    qr_code_id: bySlug[`${PREFIX}cm-${s.key}`],
    is_active: true,
    ...s.cushion,
  })),
)
if (e3) throw e3

// 入口 → 各スポンサーへの A/Bテスト
const { error: e4 } = await db.from('redirect_rules').insert(
  SPONSORS.map((s, i) => ({
    qr_code_id: bySlug[`${PREFIX}cm`],
    name: `スポンサー ${s.name}`,
    destination_url: `${PIVOLINK}/r/${PREFIX}cm-${s.key}`,
    priority: 100 - i,
    condition_type: 'ab_test',
    condition_value: { weight: 50 },
    is_active: true,
  })),
)
if (e4) throw e4

console.log(`① 実験期間: ${qrs.filter((q) => !q.slug.startsWith(`${PREFIX}cm`)).length}件のQRに ${added.length}件のルール`)
console.log(`     開催前  schedule         〜${START} → /notyet`)
console.log(`     開催終了 scheduled_switch ${END}〜  → /finished`)
console.log(`② スポンサーCM: 入口1件 + スポンサー${SPONSORS.length}枠（クッションページ付き）`)
for (const s of SPONSORS) console.log(`     ${PREFIX}cm-${s.key}  「${s.cushion.title}」${s.cushion.display_seconds}秒 / ${s.cushion.coupon_code}`)
console.log(`\nまわりみち側の env: MAWARIMICHI_CM_URL=${PIVOLINK}/r/${PREFIX}cm`)
