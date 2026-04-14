import { createAdminClient } from '@/lib/supabase/admin'
import type { PlanId } from '@/lib/plans'
import { getPlanLimits } from '@/lib/plans'

export interface UserSubscription {
  id: string
  user_id: string
  plan: PlanId
  status: 'active' | 'canceled' | 'past_due' | 'expired'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  payment_method: 'stripe' | 'jpyc'
  jpyc_tx_hash: string | null
  jpyc_amount: number | null
  jpyc_paid_at: string | null
  jpyc_expires_at: string | null
  coupon_id: string | null
  affiliate_user_id: string | null
  created_at: string
  updated_at: string
}

export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!data) {
    // 存在しない場合はfreeプランを作成
    const { data: created } = await admin
      .from('user_subscriptions')
      .insert({ user_id: userId, plan: 'free' })
      .select()
      .single()
    return created as UserSubscription
  }

  return data as UserSubscription
}

export async function checkQrLimit(userId: string): Promise<{ allowed: boolean; current: number; max: number }> {
  const sub = await getUserSubscription(userId)
  const limits = getPlanLimits(sub.plan)

  if (limits.maxQrCodes === -1) return { allowed: true, current: 0, max: -1 }

  const admin = createAdminClient()
  const { count } = await admin
    .from('qr_codes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const current = count || 0
  return {
    allowed: current < limits.maxQrCodes,
    current,
    max: limits.maxQrCodes,
  }
}

export async function checkFeatureAccess(userId: string, feature: 'rules' | 'cushionPages' | 'csvExport'): Promise<boolean> {
  const sub = await getUserSubscription(userId)
  const limits = getPlanLimits(sub.plan)
  return limits[feature]
}
