import { createAdminClient } from '@/lib/supabase/admin'
import type { Coupon, AffiliateStatus } from '@/types/affiliate'

const PAYOUT_PER_REFERRAL = 100 // 月100円/人

export { PAYOUT_PER_REFERRAL }

export async function validateCouponCode(
  code: string,
  userId: string,
): Promise<{ valid: boolean; coupon?: Coupon; error?: string }> {
  const admin = createAdminClient()

  // クーポン存在チェック
  const { data: coupon } = await admin
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (!coupon) {
    return { valid: false, error: '無効なクーポンコードです' }
  }

  // 使用上限チェック
  if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) {
    return { valid: false, error: 'このクーポンは使用上限に達しています' }
  }

  // ユーザー重複チェック（1人1クーポン）
  const { data: existing } = await admin
    .from('coupon_usages')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (existing) {
    return { valid: false, error: '既にクーポンを適用済みです' }
  }

  return { valid: true, coupon: coupon as Coupon }
}

export async function getAffiliateStatus(userId: string): Promise<AffiliateStatus | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('affiliate_applications')
    .select('status')
    .eq('user_id', userId)
    .single()

  return data?.status ?? null
}

export async function isApprovedAffiliate(userId: string): Promise<boolean> {
  const status = await getAffiliateStatus(userId)
  return status === 'approved'
}

export async function getAffiliateCoupon(userId: string): Promise<Coupon | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('coupons')
    .select('*')
    .eq('affiliate_user_id', userId)
    .eq('is_active', true)
    .single()

  return (data as Coupon) ?? null
}

export async function countActiveReferrals(affiliateUserId: string): Promise<number> {
  const admin = createAdminClient()

  // affiliate_user_idのクーポン → そのクーポンを使った有料プランアクティブユーザー数
  const { data: coupons } = await admin
    .from('coupons')
    .select('id')
    .eq('affiliate_user_id', affiliateUserId)

  if (!coupons || coupons.length === 0) return 0

  const couponIds = coupons.map((c) => c.id)

  const { count } = await admin
    .from('coupon_usages')
    .select('*, user_subscriptions!inner(status, plan)', { count: 'exact', head: true })
    .in('coupon_id', couponIds)
    .eq('is_active', true)
    .eq('user_subscriptions.status', 'active')
    .neq('user_subscriptions.plan', 'free')

  return count ?? 0
}
