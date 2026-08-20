/**
 * マイグレーション/シードSQLを Supabase に直接流す。
 *
 *   MW_DB_PW='...' node scripts/apply-sql.mjs supabase/migrations/0006_open_hours.sql ...
 *
 * ★パスワードは引数にもファイルにも書かない（コマンド履歴に残るので環境変数で渡す）。
 *   保管場所は Notion の認証情報DB。
 * ★PostgREST 経由では DDL が流せないので、セッションプーラーに直接つなぐ。
 *   ホストは aws-0-*（aws-1-* のプロジェクトもあるので、繋がらなければそちらを試す）。
 */

import { readFileSync } from 'node:fs'
import pg from 'pg'
const pw = process.env.MW_DB_PW
if (!pw) { console.error('MW_DB_PW 未設定'); process.exit(1) }
const c = new pg.Client({
  host: 'aws-0-ap-northeast-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.nvyfleqkdsbgtmjwqtsz',
  password: pw,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
})
await c.connect()
for (const f of process.argv.slice(2)) {
  await c.query(readFileSync(f, 'utf-8'))
  console.log('applied', f)
}
const { rows } = await c.query(`
  select slug,
         coalesce(array_to_string(meal_times,'/'),'-') as meals,
         coalesce(open_hours::text,'終日') as hours,
         active
  from spots order by slug`)
console.table(rows)
const r2 = await c.query(`select rule_type, priority, config from routing_rules order by priority`)
console.log('rules:', r2.rows.map(r => `${r.rule_type}(p${r.priority}) ${Object.keys(r.config).join(',')}`).join(' | '))
await c.end()
