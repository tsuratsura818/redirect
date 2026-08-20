/**
 * まわりみちの「毎回行き先が変わる」を、PivoLink の redirect_rules として作る。
 *
 *   node _create-mawarimichi-rules.mjs --dest https://mawarimichi.vercel.app
 *   node _create-mawarimichi-rules.mjs --delete       # ルールだけ削除（QR自体は残す）
 *   node _create-mawarimichi-rules.mjs --list         # いま入っているルールを一覧
 *
 * ★これがこの企画の主題。まわりみちアプリが自前で分岐するのではなく、
 *   PivoLink のルールエンジンが行き先URLを決める。
 *   ここのルールを止めれば、まわりみちの体験も実際に変わる（＝PivoLinkが動かしている証明）。
 *
 * 使っている PivoLink の機能（すべてダッシュボードから編集できる）:
 *   time_of_day      朝/昼/夕で行き先を変える     … QRあたり3つまで
 *   ab_test          重み付きランダムで振り分け   … 同じ時刻でも毎回違う道になる
 *   scan_step        端末ごとの読み込み回数       … 2回目の来訪は別の道
 *   scheduled_switch 予約切替                     … 実験終了日に自動でお礼ページへ
 *
 * 評価順（src/lib/redirect/resolver.ts）:
 *   schedule > scheduled_switch > time_of_day > scan_step > device > ab_test > default
 *   → 時間帯が決まればそれが勝つ。決まらない時間はA/Bテストがランダムに振る。
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

let { data: qrs, error: qrErr } = await db
  .from('qr_codes')
  .select('id, slug, name, default_url')
  .like('slug', `${PREFIX}%`)
  .order('sort_order')
if (qrErr) throw qrErr
// ★CM枠（mawarimichi-cm*）はこのスクリプトの対象外。
//   スポンサー振り分けとクッションページは _create-mawarimichi-campaign.mjs が持つ。
//   ここで巻き込むと、スポンサーのA/Bテストを消して寄り道用のルールで上書きしてしまう（実際にやった）。
const qrsAll = qrs
qrs = qrs.filter((q) => !q.slug.startsWith(`${PREFIX}cm`))
if (qrsAll.length !== qrs.length)
  console.log(`CM枠 ${qrsAll.length - qrs.length} 件は対象外（campaign スクリプトの担当）`)
if (!qrs.length) { console.error('まわりみちのQRがありません。先に _create-mawarimichi-qr.mjs を実行してください'); process.exit(1) }

if (args.includes('--list')) {
  for (const qr of qrs) {
    const { data: rules } = await db.from('redirect_rules').select('*')
      .eq('qr_code_id', qr.id).order('priority', { ascending: false })
    console.log(`\n${qr.slug}  (${rules?.length ?? 0}件)`)
    for (const r of rules ?? [])
      console.log(`  [${r.condition_type.padEnd(16)}] p${String(r.priority).padStart(3)} ${JSON.stringify(r.condition_value).padEnd(42)} → ${r.destination_url.replace(/^https?:\/\/[^/]+/, '')}`)
  }
  process.exit(0)
}

if (args.includes('--delete')) {
  const ids = qrs.map((q) => q.id)
  const { data, error } = await db.from('redirect_rules').delete().in('qr_code_id', ids).select('id')
  if (error) throw error
  console.log(`ルールを${data.length}件削除しました（QRとその遷移先はそのまま）`)
  process.exit(0)
}

if (!DEST) { console.error('--dest が必要です'); process.exit(1) }

/**
 * ★PivoLink の評価順を「戦う」のではなく「使う」。
 *   resolver.ts の順序は  time_of_day > scan_step > ab_test  で、先に当たったものが勝つ。
 *   最初これを知らずに時間帯で1日を覆ってしまい、A/Bテストが一度も発火しなかった。
 *
 *   そこで時間帯ルールは「営業時間の外」だけに張る。
 *   営業時間内は time_of_day に当たらないので、下位の scan_step / ab_test に落ちてくる。
 *
 *     営業時間外        → time_of_day が閉店案内へ飛ばす
 *     営業時間内・2回目〜 → scan_step が「前と違う道」へ
 *     営業時間内・1回目   → ab_test が毎回ランダムに振る
 */

/**
 * スポットの営業時間は **まわりみちの管理画面が正**。ここには持たない。
 *
 * ★以前はこのファイルに営業時間を直書きしていたが、それだと
 *   管理画面で営業時間を直しても PivoLink 側が古いままになり、
 *   「閉まっているのに通常画面へ送る」「開いているのに閉店案内へ送る」が起きる。
 *   同じ情報を2箇所に置かない。まわりみちのDBから読んで生成する。
 * ★つまり管理画面で営業時間を変えたら、このスクリプトを再実行すること。
 */
const mwEnv = Object.fromEntries(
  fs.readFileSync('pivolink-mawarimichi/.env.local', 'utf-8').split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()])
)
const mwDb = createClient(mwEnv.NEXT_PUBLIC_SUPABASE_URL, mwEnv.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})
const { data: mwSpots, error: mwErr } = await mwDb
  .from('spots').select('slug, open_hours, active, name')
if (mwErr) { console.error('まわりみちのスポットを読めません:', mwErr.message); process.exit(1) }

const OPEN_HOURS = Object.fromEntries(
  mwSpots.map((sp) => [
    `${PREFIX}${sp.slug}`,
    sp.open_hours ? [sp.open_hours.from, sp.open_hours.to] : null,
  ]),
)
console.log(`まわりみちの管理画面から営業時間を ${mwSpots.length} 件読み込みました`)

/**
 * スタートQRの時間帯。
 * ★昼（11:00-16:59）はあえて張らない。ここを覆うと運用時間帯のほとんどで
 *   time_of_day が勝ってしまい、A/Bテストもステップも一度も発火しなくなる。
 *   空けておくことで、昼＝下位ルールに落ちる＝毎回違う道になる。
 */
const START_BANDS = [
  { key: 'morning', name: '朝（7:00-10:59）',  start: '07:00', end: '10:59' },
  { key: 'evening', name: '夕（17:00-22:00）', start: '17:00', end: '22:00' },
]

/** A/Bテストの枝。同じ時刻・同じスポットでも、ここで道が分かれる */
const PICKS = [
  { key: 'a', weight: 34 },
  { key: 'b', weight: 33 },
  { key: 'c', weight: 33 },
]

const hhmm = (h) => `${String(h).padStart(2, '0')}:00`
const rows = []

for (const qr of qrs) {
  const path = new URL(qr.default_url).pathname
  const to = (q) => (q ? `${DEST}${path}?${q}` : `${DEST}${path}`)
  const isStart = qr.slug === `${PREFIX}start`

  if (isStart) {
    // ① スタートQR: 時間帯で「今日の顔」を決める
    for (const [i, b] of START_BANDS.entries()) {
      rows.push({
        qr_code_id: qr.id,
        name: `時間帯 ${b.name}`,
        destination_url: to(`band=${b.key}`),
        priority: 300 - i,
        condition_type: 'time_of_day',
        condition_value: { start_time: b.start, end_time: b.end },
        is_active: true,
      })
    }
  } else {
    // ② スポットQR: 営業時間の「外」だけ時間帯ルールを張る（中はA/Bに落とすため）
    const hours = OPEN_HOURS[qr.slug]
    if (hours) {
      const [from, to_] = hours
      if (from > 0) {
        rows.push({
          qr_code_id: qr.id,
          name: `開店前（0:00-${hhmm(from - 1).slice(0, 2)}:59）`,
          destination_url: to('closed=1'),
          priority: 300,
          condition_type: 'time_of_day',
          condition_value: { start_time: '00:00', end_time: `${String(from - 1).padStart(2, '0')}:59` },
          is_active: true,
        })
      }
      if (to_ < 24) {
        rows.push({
          qr_code_id: qr.id,
          name: `閉店後（${hhmm(to_)}-23:59）`,
          destination_url: to('closed=1'),
          priority: 299,
          condition_type: 'time_of_day',
          condition_value: { start_time: hhmm(to_), end_time: '23:59' },
          is_active: true,
        })
      }
    }
  }

  // ③ ステップアップ — 「何回目の参加か」。スタートQRにだけ張る。
  //
  //    ★スポットQRには張らない。PivoLinkのステップは
  //      「visit ≦ 読込回数 のうち最大のもの」を採用して以後それを継続する仕様なので、
  //      3回読んだ端末は永久にその枝に固定される。実測:
  //        1回目 pick=a / 2回目 visit=2 / 3回目 visit=3 / 4〜8回目 ずっと visit=3
  //      「毎回違う道」を売りにしているQRでこれが起きると、デモが4回目で止まる。
  //    ★スタートQRでは意味が変わる。「3回目以降はずっとリピーター扱い」は
  //      仕様として正しいので、そのまま使う。
  if (isStart) {
    for (const visit of [2, 3]) {
      rows.push({
        qr_code_id: qr.id,
        name: `${visit}回目の参加`,
        destination_url: to(`band=day&visit=${visit}&pick=${visit === 2 ? 'b' : 'c'}`),
        priority: 200 - visit,
        condition_type: 'scan_step',
        condition_value: { visit },
        is_active: true,
      })
    }
  }

  // ④ A/Bテスト — 「毎回違う道」の本体。営業時間内・初回はここに落ちる
  for (const [i, p] of PICKS.entries()) {
    rows.push({
      qr_code_id: qr.id,
      name: `ランダム振り分け ${p.key.toUpperCase()}`,
      destination_url: to(isStart ? `band=day&pick=${p.key}` : `pick=${p.key}`),
      priority: 100 - i,
      condition_type: 'ab_test',
      condition_value: { weight: p.weight },
      is_active: true,
    })
  }
}

await db.from('redirect_rules').delete().in('qr_code_id', qrs.map((q) => q.id))
const { data, error } = await db.from('redirect_rules').insert(rows).select('id, condition_type')
if (error) throw error

const byType = {}
for (const r of data) byType[r.condition_type] = (byType[r.condition_type] ?? 0) + 1
console.log(`QR ${qrs.length}件に、PivoLinkのルールを合計 ${data.length}件 作成しました`)
for (const [k, v] of Object.entries(byType)) console.log(`  ${k.padEnd(14)} ${v}件`)
console.log(`
ダッシュボード: https://redirect.tsuratsura.com/dashboard/qr`)
console.log(`検証: 同じQRを何度も叩くと、Location の pick= が変わります`)
