import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserSubscription } from '@/lib/subscription'
import { PLANS } from '@/lib/plans'

// 現在のサブスクリプション情報を取得
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const subscription = await getUserSubscription(user.id)
    const plan = PLANS[subscription.plan]

    // QRコード使用数
    const { count: qrCount } = await supabase
      .from('qr_codes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // 今月のスキャン数
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const { data: userQrs } = await supabase
      .from('qr_codes')
      .select('id')
      .eq('user_id', user.id)
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

    return NextResponse.json({
      subscription,
      plan,
      usage: {
        qr_codes: qrCount || 0,
        scans_this_month: scanCount,
      },
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
