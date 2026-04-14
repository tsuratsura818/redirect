import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'
import { stripe } from '@/lib/stripe'
import crypto from 'crypto'

// アフィリエイト申請の承認/却下
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await requireAdmin(user.id)

    const { status, rejectionReason } = await request.json() as {
      status: 'approved' | 'rejected'
      rejectionReason?: string
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: '無効なステータスです' }, { status: 400 })
    }

    const admin = createAdminClient()

    // 申請取得
    const { data: application, error: fetchError } = await admin
      .from('affiliate_applications')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !application) {
      return NextResponse.json({ error: '申請が見つかりません' }, { status: 404 })
    }

    if (application.status !== 'pending') {
      return NextResponse.json({ error: '審査済みの申請です' }, { status: 400 })
    }

    // 承認の場合：クーポン自動作成
    if (status === 'approved') {
      const randomCode = crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 6)
      const couponCode = `AFF-${randomCode}`

      // Stripeクーポン作成
      const stripeCoupon = await stripe.coupons.create({
        percent_off: 10,
        duration: 'forever',
        name: couponCode,
      })

      // DBにクーポン挿入
      const { error: couponError } = await admin
        .from('coupons')
        .insert({
          code: couponCode,
          stripe_coupon_id: stripeCoupon.id,
          discount_percent: 10,
          affiliate_user_id: application.user_id,
          is_active: true,
          current_uses: 0,
        })

      if (couponError) throw couponError
    }

    // 申請ステータス更新
    const { error: updateError } = await admin
      .from('affiliate_applications')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        rejection_reason: status === 'rejected' ? (rejectionReason || null) : null,
      })
      .eq('id', id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true, status })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
