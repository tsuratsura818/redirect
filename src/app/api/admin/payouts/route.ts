import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'
import { countActiveReferrals, PAYOUT_PER_REFERRAL } from '@/lib/affiliate'

// 報酬一覧取得
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await requireAdmin(user.id)

    const admin = createAdminClient()
    const { data: payouts, error } = await admin
      .from('affiliate_payouts')
      .select('*')
      .order('period_start', { ascending: false })

    if (error) throw error

    // ユーザーメール情報付与
    const userIds = [...new Set((payouts || []).map((p) => p.affiliate_user_id))]
    const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })
    const emailMap = new Map(users.map((u) => [u.id, u.email || '']))

    const result = (payouts || []).map((p) => ({
      ...p,
      email: emailMap.get(p.affiliate_user_id) || '',
    }))

    return NextResponse.json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// 当月の報酬計算トリガー
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await requireAdmin(user.id)

    const result = await calculateMonthlyPayouts()
    return NextResponse.json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// 月次報酬計算ロジック（cronからも使用）
export async function calculateMonthlyPayouts() {
  const admin = createAdminClient()

  // 当月の期間
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()
  const periodKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  // 承認済みアフィリエイト一覧取得
  const { data: affiliates } = await admin
    .from('affiliate_applications')
    .select('user_id')
    .eq('status', 'approved')

  if (!affiliates || affiliates.length === 0) {
    return { created: 0, skipped: 0, period: periodKey }
  }

  let created = 0
  let skipped = 0

  for (const affiliate of affiliates) {
    // 当月の既存報酬チェック
    const { data: existing } = await admin
      .from('affiliate_payouts')
      .select('id')
      .eq('affiliate_user_id', affiliate.user_id)
      .gte('period_start', periodStart)
      .lte('period_start', periodEnd)
      .single()

    if (existing) {
      skipped++
      continue
    }

    // アクティブ紹介数カウント
    const activeReferrals = await countActiveReferrals(affiliate.user_id)
    const amount = activeReferrals * PAYOUT_PER_REFERRAL

    if (amount <= 0) {
      skipped++
      continue
    }

    // 報酬レコード作成
    const { error: insertError } = await admin
      .from('affiliate_payouts')
      .insert({
        affiliate_user_id: affiliate.user_id,
        amount,
        active_referrals: activeReferrals,
        period_start: periodStart,
        period_end: periodEnd,
        status: 'pending',
      })

    if (insertError) throw insertError
    created++
  }

  return { created, skipped, period: periodKey }
}
