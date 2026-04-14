import pg from 'pg'
import fs from 'fs'

// Supabase DB直接接続（IPv4 Add-on前提）
// 接続文字列: postgresql://postgres.[ref]:[password]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
const ref = 'kqsjflnwuqgzzmdejgil'
const connectionString = process.env.DATABASE_URL ||
  `postgresql://postgres.${ref}:${process.env.SUPABASE_DB_PASSWORD}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`

async function run() {
  let sql = fs.readFileSync('supabase/coupon-affiliate-migration.sql', 'utf-8')

  // PostgreSQLではCREATE TRIGGER IF NOT EXISTSはサポートされていない
  sql = sql.replace(/CREATE TRIGGER IF NOT EXISTS/g, 'CREATE OR REPLACE TRIGGER')

  console.log('Connecting to Supabase PostgreSQL...')
  console.log(`Host: aws-0-ap-northeast-1.pooler.supabase.com`)

  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })

  try {
    await client.connect()
    console.log('Connected!\n')

    console.log('Executing migration...\n')
    await client.query(sql)
    console.log('✅ Migration completed successfully!\n')

    // 確認
    const tables = ['coupons', 'coupon_usages', 'affiliate_applications', 'affiliate_payouts']
    for (const t of tables) {
      const res = await client.query(`SELECT COUNT(*) FROM ${t}`)
      console.log(`  ✅ ${t}: ${res.rows[0].count} rows`)
    }

    // user_subscriptions カラム確認
    const cols = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'user_subscriptions' AND column_name IN ('coupon_id', 'affiliate_user_id')
    `)
    console.log(`  ✅ user_subscriptions: +${cols.rows.map(r => r.column_name).join(', ')}`)

  } catch (err) {
    console.error('❌ Migration failed:', err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

run()
