// 実 signup を発火させて Pivolink ブランドの確認メールを送る
// 送信先は nishikawa+pivotest{ts}@tsuratsura.com → Gmail サブアドレッシングで本アドレス受信
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n').filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')] })
)
const pub = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } })

const email = `nishikawa+pivotest${Date.now()}@tsuratsura.com`
console.log('signUp email:', email)
const r = await pub.auth.signUp({ email, password: 'test12345678' })
console.log('error:', r.error)
console.log('user.id:', r.data?.user?.id)
console.log('email_confirmed:', r.data?.user?.email_confirmed_at ?? '(未確認、メール送信されたはず)')
