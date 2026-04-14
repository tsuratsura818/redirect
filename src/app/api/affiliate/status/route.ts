import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { AffiliateApplication, Coupon } from '@/types/affiliate'

// アフィリエイトステータス・クーポン情報取得
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()

    // 申請情報取得
    const { data: application } = await admin
      .from('affiliate_applications')
      .select('*')
      .eq('user_id', user.id)
      .single()

    let coupon: Coupon | null = null

    // 承認済みの場合はクーポン情報も取得
    if (application?.status === 'approved') {
      const { data: couponData } = await admin
        .from('coupons')
        .select('*')
        .eq('affiliate_user_id', user.id)
        .eq('is_active', true)
        .single()

      coupon = (couponData as Coupon) ?? null
    }

    return NextResponse.json({
      application: (application as AffiliateApplication) ?? null,
      coupon,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
