import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'

// 月次推定収益単価（ベータ価格・月換算）
const PLAN_MRR: Record<string, number> = {
  pro: 715,        // ¥780(月額) と ¥650(年額換算) の中間推定
  business: 3648,  // ¥3,980(月額) と ¥3,317(年額換算) の中間推定
}

// 推定固定費（月次）
const FIXED_COSTS = {
  vercel: 3000,    // Vercel Pro ~$20
  supabase: 3750,  // Supabase Pro ~$25（スケール後）
  misc: 1250,      // ドメイン・その他
  total: 8000,
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await requireAdmin(user.id)

    const admin = createAdminClient()

    // プラン別ユーザー数
    const { data: subscriptions } = await admin
      .from('user_subscriptions')
      .select('plan, status, cancel_at_period_end, created_at')

    const planCounts = { free: 0, pro: 0, business: 0 }
    let cancelPending = 0
    let paidActive = 0

    for (const sub of subscriptions || []) {
      const plan = sub.plan as keyof typeof planCounts
      if (planCounts[plan] !== undefined) planCounts[plan]++
      if (sub.cancel_at_period_end) cancelPending++
      if (sub.plan !== 'free' && sub.status === 'active' && !sub.cancel_at_period_end) paidActive++
    }

    const totalUsers = (subscriptions || []).length

    // MRR推定
    const mrr = planCounts.pro * PLAN_MRR.pro + planCounts.business * PLAN_MRR.business
    const arr = mrr * 12

    // 転換率
    const conversionRate = totalUsers > 0 ? ((planCounts.pro + planCounts.business) / totalUsers) * 100 : 0

    // チャーン率（キャンセル待ち / 有料ユーザー）
    const paidTotal = planCounts.pro + planCounts.business
    const churnRate = paidTotal > 0 ? (cancelPending / paidTotal) * 100 : 0

    // LTV推定（ARPU / 月次チャーン率）— チャーン0の場合は36ヶ月で計算
    const arpu = paidTotal > 0
      ? (planCounts.pro * PLAN_MRR.pro + planCounts.business * PLAN_MRR.business) / paidTotal
      : 0
    const monthlyChurnDecimal = churnRate / 100
    const ltv = monthlyChurnDecimal > 0 ? arpu / monthlyChurnDecimal : arpu * 36

    // 損益分岐点（何名の有料ユーザーが必要か）
    const avgRevenuePerPaidUser = paidTotal > 0 ? mrr / paidTotal : PLAN_MRR.pro
    const breakevenUsers = FIXED_COSTS.total / (avgRevenuePerPaidUser || PLAN_MRR.pro)

    // 月次ユーザー登録数（過去6ヶ月）
    const now = new Date()
    const monthlyGrowth: { month: string; users: number; paid: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

      const monthSubs = (subscriptions || []).filter(s => {
        const created = new Date(s.created_at)
        return created >= d && created < nextD
      })

      monthlyGrowth.push({
        month: monthStr,
        users: monthSubs.length,
        paid: monthSubs.filter(s => s.plan !== 'free').length,
      })
    }

    // 累計ユーザー数（月次）
    let cumulative = 0
    const cumulativeGrowth = monthlyGrowth.map(m => {
      cumulative += m.users
      return { ...m, cumulative }
    })

    return NextResponse.json({
      planCounts,
      paidActive,
      cancelPending,
      totalUsers,
      mrr,
      arr,
      conversionRate,
      churnRate,
      arpu,
      ltv,
      breakevenUsers: Math.ceil(breakevenUsers),
      breakevenProgress: Math.min((paidTotal / Math.ceil(breakevenUsers)) * 100, 100),
      fixedCosts: FIXED_COSTS,
      monthlyGrowth: cumulativeGrowth,
      profitLoss: mrr - FIXED_COSTS.total,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
