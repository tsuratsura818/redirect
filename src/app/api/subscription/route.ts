import { NextResponse } from 'next/server'
import { getUserSubscription } from '@/lib/subscription'
import { PLANS } from '@/lib/plans'
import { isAdmin } from '@/lib/admin'
import { requireUser } from '@/lib/auth'

// 現在のサブスクリプション情報を取得
export async function GET() {
  try {
    const auth = await requireUser()
    if (auth.error) return auth.error
    const { supabase, userId } = auth

    const subscription = await getUserSubscription(userId)
    const plan = PLANS[subscription.plan]

    // QRコード使用数
    const { count: qrCount } = await supabase
      .from('qr_codes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // 今月のスキャン数
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const { data: userQrs } = await supabase
      .from('qr_codes')
      .select('id')
      .eq('user_id', userId)
    const qrIds = (userQrs || []).map(q => q.id)

    let scanCount = 0
    if (qrIds.length > 0) {
      const { count } = await supabase
        .from('scan_logs')
        .select('*', { count: 'exact', head: true })
        .in('qr_code_id', qrIds)
        .gte('scanned_at', monthStart)
      scanCount = count || 0
    }

    const adminFlag = await isAdmin(userId)

    return NextResponse.json({
      subscription,
      plan,
      usage: {
        qr_codes: qrCount || 0,
        scans_this_month: scanCount,
      },
      isAdmin: adminFlag,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
