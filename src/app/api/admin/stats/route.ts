import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'
import { requireUser } from '@/lib/auth'

// サービス全体の統計
export async function GET() {
  try {
    const auth = await requireUser()
    if (auth.error) return auth.error
    const { userId } = auth

    await requireAdmin(userId)

    const admin = createAdminClient()

    const [
      { count: userCount },
      { count: qrCount },
      { count: scanCount },
    ] = await Promise.all([
      admin.from('user_profiles').select('*', { count: 'exact', head: true }).then(r => ({ count: r.count || 0 })),
      admin.from('qr_codes').select('*', { count: 'exact', head: true }).then(r => ({ count: r.count || 0 })),
      admin.from('scan_logs').select('*', { count: 'exact', head: true }).then(r => ({ count: r.count || 0 })),
    ])

    // 直近7日間のスキャン
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const { count: recentScans } = await admin
      .from('scan_logs')
      .select('*', { count: 'exact', head: true })
      .gte('scanned_at', sevenDaysAgo.toISOString())

    // 直近7日間の新規ユーザー
    const { count: recentUsers } = await admin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString())

    return NextResponse.json({
      total_users: userCount,
      total_qr_codes: qrCount,
      total_scans: scanCount,
      recent_scans_7d: recentScans || 0,
      recent_users_7d: recentUsers || 0,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
