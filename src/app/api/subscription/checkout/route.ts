import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe, PRICE_IDS } from '@/lib/stripe'
import { getUserSubscription } from '@/lib/subscription'
import type { PlanId } from '@/lib/plans'
import { PLANS } from '@/lib/plans'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { plan } = await request.json() as { plan: PlanId }

    if (!PLANS[plan]) {
      return NextResponse.json({ error: '無効なプランです' }, { status: 400 })
    }

    const sub = await getUserSubscription(user.id)
    const admin = createAdminClient()
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

    const priceId = PRICE_IDS[plan]
    if (!priceId) {
      return NextResponse.json({ error: '価格が設定されていません' }, { status: 400 })
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
      })

      await admin
        .from('user_subscriptions')
        .update({ plan, status: 'active', cancel_at_period_end: false })
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
        metadata: { supabase_user_id: user.id, plan },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
