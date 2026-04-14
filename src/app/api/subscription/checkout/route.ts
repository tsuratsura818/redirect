import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe, getPriceId } from '@/lib/stripe'
import { getUserSubscription } from '@/lib/subscription'
import type { PlanId } from '@/lib/plans'
import { PLANS } from '@/lib/plans'
import { validateCouponCode } from '@/lib/affiliate'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { plan, billing = 'monthly', couponCode } = await request.json() as {
      plan: PlanId
      billing?: 'monthly' | 'annual'
      couponCode?: string
    }

    const admin = createAdminClient()

    // クーポン検証（指定時のみ）
    let stripeCouponId: string | undefined
    let couponId: string | undefined
    let affiliateUserId: string | undefined

    if (couponCode?.trim()) {
      const couponResult = await validateCouponCode(couponCode.trim(), user.id)
      if (!couponResult.valid) {
        return NextResponse.json({ error: couponResult.error }, { status: 400 })
      }
      const coupon = couponResult.coupon!

      // Stripe Couponがなければ作成
      if (coupon.stripe_coupon_id) {
        stripeCouponId = coupon.stripe_coupon_id
      } else {
        const stripeCoupon = await stripe.coupons.create({
          percent_off: coupon.discount_percent,
          duration: 'forever',
          name: `Pivolink ${coupon.discount_percent}%OFF - ${coupon.code}`,
        })
        stripeCouponId = stripeCoupon.id

        // Stripe Coupon IDを保存
        await admin
          .from('coupons')
          .update({ stripe_coupon_id: stripeCouponId })
          .eq('id', coupon.id)
      }

      couponId = coupon.id
      affiliateUserId = coupon.affiliate_user_id ?? undefined
    }

    if (!PLANS[plan]) {
      return NextResponse.json({ error: '無効なプランです' }, { status: 400 })
    }

    const sub = await getUserSubscription(user.id)
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || ''

    // Freeへのダウングレード: Stripeサブスクリプションをキャンセル
    if (plan === 'free') {
      if (sub.stripe_subscription_id) {
        await stripe.subscriptions.update(sub.stripe_subscription_id, {
          cancel_at_period_end: true,
        })
        await admin
          .from('user_subscriptions')
          .update({ cancel_at_period_end: true })
          .eq('user_id', user.id)

        return NextResponse.json({
          success: true,
          message: '現在の請求期間の終了時にFreeプランに変更されます',
        })
      }
      // Stripeサブスクリプションがない場合は即時変更
      await admin
        .from('user_subscriptions')
        .update({ plan: 'free', status: 'active', cancel_at_period_end: false })
        .eq('user_id', user.id)
      return NextResponse.json({ success: true, message: 'Freeプランに変更しました' })
    }

    const priceId = getPriceId(plan, billing)
    if (!priceId) {
      return NextResponse.json({ error: `価格IDが未設定です (${plan}_${billing})` }, { status: 400 })
    }

    // 既存Stripeサブスクリプションがある場合: プラン変更（プロレーション）
    if (sub.stripe_subscription_id) {
      const stripeSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id)
      await stripe.subscriptions.update(sub.stripe_subscription_id, {
        items: [{
          id: stripeSub.items.data[0].id,
          price: priceId,
        }],
        cancel_at_period_end: false,
        proration_behavior: 'create_prorations',
        ...(stripeCouponId && { coupon: stripeCouponId }),
        metadata: {
          ...stripeSub.metadata,
          ...(couponId && { coupon_id: couponId }),
          ...(affiliateUserId && { affiliate_user_id: affiliateUserId }),
        },
      })

      const subUpdate: Record<string, unknown> = { plan, status: 'active', cancel_at_period_end: false }
      if (couponId) subUpdate.coupon_id = couponId
      if (affiliateUserId) subUpdate.affiliate_user_id = affiliateUserId

      await admin
        .from('user_subscriptions')
        .update(subUpdate)
        .eq('user_id', user.id)

      return NextResponse.json({
        success: true,
        message: `${PLANS[plan].name}プランに変更しました`,
      })
    }

    // 新規: Stripe Checkout Session作成
    let customerId = sub.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id

      await admin
        .from('user_subscriptions')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard/plan?success=true`,
      cancel_url: `${origin}/dashboard/plan?canceled=true`,
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan,
          ...(couponId && { coupon_id: couponId }),
          ...(affiliateUserId && { affiliate_user_id: affiliateUserId }),
        },
      },
      ...(stripeCouponId && {
        discounts: [{ coupon: stripeCouponId }],
      }),
    })

    return NextResponse.json({ url: session.url })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
