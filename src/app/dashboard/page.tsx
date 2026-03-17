import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { QrCode, ScanLog } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // QRコード一覧
  const { data: qrCodes } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const codes = (qrCodes || []) as QrCode[]

  // 直近7日間のスキャン数
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
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">ダッシュボード</h1>
          <p className="text-muted text-sm mt-1">QRコード・NFCタグの管理状況を確認できます</p>
        </div>
        <Link
          href="/dashboard/qr/new"
          className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors font-medium flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新規作成
        </Link>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="text-sm text-muted mb-1">登録QR / NFC</div>
          <div className="text-3xl font-bold text-foreground">{codes.length}</div>
          <div className="text-xs text-success mt-1">{activeCodes} 件アクティブ</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="text-sm text-muted mb-1">総スキャン数</div>
          <div className="text-3xl font-bold text-foreground">{totalScans.toLocaleString()}</div>
          <div className="text-xs text-muted mt-1">全期間</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="text-sm text-muted mb-1">直近7日間</div>
          <div className="text-3xl font-bold text-foreground">{recentScanCount.toLocaleString()}</div>
          <div className="text-xs text-muted mt-1">スキャン数</div>
        </div>
      </div>

      {/* QRコード一覧 */}
      <div className="bg-card rounded-xl border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-bold text-foreground">リダイレクト一覧</h2>
        </div>
        {codes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <p className="text-muted mb-4">まだリダイレクトURLがありません</p>
            <Link
              href="/dashboard/qr/new"
              className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              最初のリダイレクトを作成
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {codes.map(code => (
              <Link
                key={code.id}
                href={`/dashboard/qr/${code.id}`}
                className="flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors gap-3"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${code.is_active ? 'bg-success' : 'bg-gray-300'}`} />
                  <div className="min-w-0">
                    <div className="font-medium text-foreground truncate">{code.name}</div>
                    <div className="text-sm text-muted">/r/{code.slug}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-6 text-sm shrink-0">
                  <div className="text-right">
                    <div className="text-foreground font-medium">{code.scan_count.toLocaleString()}</div>
                    <div className="text-muted text-xs sm:text-sm">スキャン</div>
                  </div>
                  <svg className="w-5 h-5 text-muted hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
