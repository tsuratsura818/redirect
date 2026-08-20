import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'
import { PLANS } from '@/lib/plans'
import type { PlanId } from '@/lib/plans'
import { requireUser } from '@/lib/auth'

// 管理者専用: Stripeを介さず即時プラン切替
export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser()
    if (auth.error) return auth.error
    const { userId } = auth

    await requireAdmin(userId)

    const { plan } = await request.json() as { plan: PlanId }

    if (!PLANS[plan]) {
      return NextResponse.json({ error: '無効なプランです' }, { status: 400 })
    }

    const admin = createAdminClient()
    await admin
      .from('user_subscriptions')
      .update({
        plan,
        status: 'active',
        cancel_at_period_end: false,
      })
      .eq('user_id', userId)

    return NextResponse.json({ success: true, plan })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
