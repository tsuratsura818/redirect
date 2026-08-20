import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getUserSubscription } from '@/lib/subscription'
import { requireUser } from '@/lib/auth'

// Stripe Customer Portalセッション作成（請求履歴・支払い方法管理）
export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser()
    if (auth.error) return auth.error
    const { userId } = auth

    const sub = await getUserSubscription(userId)

    if (!sub.stripe_customer_id) {
      return NextResponse.json({ error: '有料プランに加入していません' }, { status: 400 })
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || ''

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${origin}/dashboard/plan`,
    })

    return NextResponse.json({ url: session.url })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
