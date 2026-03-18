import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'
import { PLANS } from '@/lib/plans'
import type { PlanId } from '@/lib/plans'

// 管理者専用: Stripeを介さず即時プラン切替
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await requireAdmin(user.id)

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
      .eq('user_id', user.id)

    return NextResponse.json({ success: true, plan })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
