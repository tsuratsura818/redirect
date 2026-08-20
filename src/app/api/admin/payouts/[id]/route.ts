import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'
import { requireUser } from '@/lib/auth'

// 報酬ステータス更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await requireUser()
    if (auth.error) return auth.error
    await requireAdmin(auth.userId)

    const { status } = await request.json() as {
      status: 'approved' | 'paid' | 'rejected'
    }

    if (!['approved', 'paid', 'rejected'].includes(status)) {
      return NextResponse.json({ error: '無効なステータスです' }, { status: 400 })
    }

    const admin = createAdminClient()

    const updates: Record<string, unknown> = { status }

    // 支払い済みの場合は paid_at を設定
    if (status === 'paid') {
      updates.paid_at = new Date().toISOString()
    }

    const { data: payout, error } = await admin
      .from('affiliate_payouts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(payout)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
