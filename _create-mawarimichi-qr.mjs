/**
 * まわりみち用のQRを PivoLink 本番に作成する。
 *
 *   node _create-mawarimichi-qr.mjs --dest https://xxxx.trycloudflare.com
 *   node _create-mawarimichi-qr.mjs --dest https://... --update   # 遷移先だけ差し替え
 *   node _create-mawarimichi-qr.mjs --delete                      # 取り消し（slug前方一致）
 *
 * QRに焼くのは PivoLink の /r/<slug>。遷移先はダッシュボードからいつでも変更できる。
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

const SPOTS = [
  ['start',    'dev-start-kyoto', 'START 京都駅ビル 観光案内所', 'スタート地点。ここから目的地を選ぶ'],
  ['rokuhara', 'dev-rokuhara',    '六波羅蜜寺',                 '寄り道スポット'],
  ['rokudo',   'dev-rokudo',      '六道珍皇寺',                 '寄り道スポット'],
  ['kenninji', 'dev-kenninji',    '建仁寺',                     '寄り道スポット'],
  ['shoseien', 'dev-shoseien',    '渉成園',                     '寄り道スポット'],
  ['yasui',    'dev-yasui',       '安井金比羅宮',               '寄り道スポット'],
  ['kawai',    'dev-kawai',       '河井寬次郎記念館',           '寄り道スポット'],
  ['bukkoji',  'dev-bukkoji',     '佛光寺と、d食堂',            '寄り道スポット（コラボ）'],
  ['ichihime', 'dev-ichihime',    '市比賣神社',                 '寄り道スポット'],
  // 飲食スポット（架空の店。実証実験で参加店が決まったら名前を差し替える）
  ['asagiri',    'dev-asagiri',    '喫茶 朝霧',           '飲食スポット（朝・おやつ）'],
  ['nanakamado', 'dev-nanakamado', '食堂 なゝかまど',     '飲食スポット（ランチ・夕）コラボ'],
  ['hitoyasumi', 'dev-hitoyasumi', '甘味 ひとやすみ',     '飲食スポット（おやつ）コラボ'],
  ['miyakoroji', 'dev-miyakoroji', '居酒屋 みやこ路地',   '飲食スポット（夕）'],
  ['mizunowa',   'dev-mizunowa',   '町家珈琲 みずのわ',   '飲食スポット（朝・ランチ・おやつ）'],
]

if (args.includes('--delete')) {
  const { data, error } = await db.from('qr_codes').delete().like('slug', `${PREFIX}%`).select('slug')
  if (error) throw error
  console.log(`削除: ${data.length}件`, data.map((d) => d.slug).join(', '))
  process.exit(0)
}

if (!DEST) { console.error('--dest が必要です'); process.exit(1) }

const { data: users } = await db.auth.admin.listUsers()
const owner = users.users.find((u) => u.email === 'nishikawa@tsuratsura.com')
if (!owner) { console.error('所有者ユーザーが見つかりません'); process.exit(1) }

const rows = SPOTS.map(([key, token, name, desc], i) => ({
  user_id: owner.id,
  slug: `${PREFIX}${key}`,
  name: `まわりみち｜${name}`,
  description: `${desc} ／ 遷移先はここから差し替え可能`,
  default_url: `${DEST}/s/${token}`,
  is_active: true,
  sort_order: 100 + i,
  qr_color_dark: '#1B1814',
  qr_color_light: '#FFFFFF',
}))

if (args.includes('--update')) {
  for (const r of rows) {
    const { error } = await db.from('qr_codes').update({ default_url: r.default_url }).eq('slug', r.slug)
    if (error) throw error
    console.log(`更新 ${r.slug} → ${r.default_url}`)
  }
} else {
  const { data, error } = await db.from('qr_codes').upsert(rows, { onConflict: 'slug' }).select('slug,default_url')
  if (error) throw error
  for (const d of data) console.log(`${d.slug.padEnd(24)} → ${d.default_url}`)
  console.log(`\n${data.length}件を作成しました（所有者: nishikawa@tsuratsura.com）`)
}
