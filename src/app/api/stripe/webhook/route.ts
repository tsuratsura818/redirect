import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  // Webhook Secretが未設定の場合はシグネチャ検証をスキップ（開発用）
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  let event: Stripe.Event

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } else {
      event = JSON.parse(body) as Stripe.Event
    }
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  const admin = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode === 'subscription' && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        const userId = subscription.metadata.supabase_user_id
        const plan = subscription.metadata.plan

        if (userId && plan) {
          await admin
            .from('user_subscriptions')
            .update({
              plan,
              status: 'active',
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscription.id,
              current_period_start: new Date((subscription as unknown as { current_period_start: number }).current_period_start * 1000).toISOString(),
              current_period_end: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
              cancel_at_period_end: false,
            })
            .eq('user_id', userId)
        }
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata.supabase_user_id

      if (userId) {
        const updates: Record<string, unknown> = {
          status: subscription.status === 'active' ? 'active'
            : subscription.status === 'past_due' ? 'past_due'
            : 'canceled',
          current_period_start: new Date((subscription as unknown as { current_period_start: number }).current_period_start * 1000).toISOString(),
          current_period_end: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        }

        // キャンセル済みかつ期間終了後 → freeに戻す
        if (subscription.status === 'canceled') {
          updates.plan = 'free'
          updates.stripe_subscription_id = null
        }

        await admin
          .from('user_subscriptions')
          .update(updates)
          .eq('user_id', userId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata.supabase_user_id

      if (userId) {
        await admin
          .from('user_subscriptions')
          .update({
            plan: 'free',
            status: 'active',
            stripe_subscription_id: null,
            current_period_start: null,
            current_period_end: null,
            cancel_at_period_end: false,
          })
          .eq('user_id', userId)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId = (invoice as unknown as { subscription: string | null }).subscription

      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = subscription.metadata.supabase_user_id

        if (userId) {
          await admin
            .from('user_subscriptions')
            .update({ status: 'past_due' })
            .eq('user_id', userId)
        }
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
