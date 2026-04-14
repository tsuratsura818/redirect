import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isApprovedAffiliate, countActiveReferrals, getAffiliateCoupon, PAYOUT_PER_REFERRAL } from '@/lib/affiliate'
import type { AffiliateStats, AffiliatePayout } from '@/types/affiliate'

// アフィリエイト統計取得
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 承認済みアフィリエイトのみ
    const approved = await isApprovedAffiliate(user.id)
    if (!approved) {
      return NextResponse.json({ error: 'アフィリエイトとして承認されていません' }, { status: 403 })
    }

    const admin = createAdminClient()

    // 並列でデータ取得
    const [activeReferrals, coupon, { data: payouts }] = await Promise.all([
      countActiveReferrals(user.id),
      getAffiliateCoupon(user.id),
      admin
        .from('affiliate_payouts')
        .select('*')
        .eq('affiliate_user_id', user.id)
        .order('period_start', { ascending: false }),
    ])

    const payoutList = (payouts as AffiliatePayout[]) || []

    // 総紹介数（累計のクーポン使用数）
    const { count: totalReferrals } = await admin
      .from('coupon_usages')
      .select('id', { count: 'exact', head: true })
      .in(
        'coupon_id',
        coupon ? [coupon.id] : [],
      )

    // 報酬計算
    const totalEarnings = payoutList
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0)

    const pendingPayout = payoutList
      .filter((p) => p.status === 'pending' || p.status === 'approved')
      .reduce((sum, p) => sum + p.amount, 0)

    // 月次データ
    const monthlyEarnings = payoutList.map((p) => ({
      month: p.period_start.slice(0, 7),
      amount: p.amount,
      referrals: p.active_referrals,
    }))

    const stats: AffiliateStats = {
      totalReferrals: totalReferrals ?? 0,
      activeReferrals,
      totalEarnings,
      pendingPayout,
      couponCode: coupon?.code ?? '',
      monthlyEarnings,
    }

    return NextResponse.json(stats)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
