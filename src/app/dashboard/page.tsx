import { createClient } from '@/lib/supabase/server'
import type { QrCode } from '@/types/database'
import DashboardContent from './DashboardContent'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: qrCodes } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const codes = (qrCodes || []) as QrCode[]

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: recentScans } = await supabase
    .from('scan_logs')
    .select('id, qr_code_id, scanned_at')
    .in('qr_code_id', codes.map(c => c.id))
    .gte('scanned_at', sevenDaysAgo.toISOString())

  const recentScanCount = (recentScans || []).length
  const totalScans = codes.reduce((sum, c) => sum + c.scan_count, 0)
  const activeCodes = codes.filter(c => c.is_active).length

  return (
    <DashboardContent
      codes={codes}
      totalScans={totalScans}
      activeCodes={activeCodes}
      recentScanCount={recentScanCount}
    />
  )
}
