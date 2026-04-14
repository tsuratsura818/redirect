export interface Coupon {
  id: string
  code: string
  stripe_coupon_id: string | null
  discount_percent: number
  affiliate_user_id: string | null
  max_uses: number | null
  current_uses: number
  is_active: boolean
  description: string | null
  created_at: string
  updated_at: string
}

export interface CouponUsage {
  id: string
  coupon_id: string
  user_id: string
  stripe_subscription_id: string | null
  applied_at: string
  is_active: boolean
}

export type AffiliateStatus = 'pending' | 'approved' | 'rejected'

export interface AffiliateApplication {
  id: string
  user_id: string
  status: AffiliateStatus
  motivation: string | null
  community_name: string | null
  community_url: string | null
  applied_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  rejection_reason: string | null
}

export type PayoutStatus = 'pending' | 'approved' | 'paid' | 'rejected'

export interface AffiliatePayout {
  id: string
  affiliate_user_id: string
  amount: number
  active_referrals: number
  period_start: string
  period_end: string
  status: PayoutStatus
  paid_at: string | null
  notes: string | null
}

export interface AffiliateStats {
  totalReferrals: number
  activeReferrals: number
  totalEarnings: number
  pendingPayout: number
  couponCode: string
  monthlyEarnings: { month: string; amount: number; referrals: number }[]
}

export interface BankAccount {
  id: string
  user_id: string
  bank_name: string
  branch_name: string
  account_type: '普通' | '当座'
  account_number: string
  account_holder: string
}
