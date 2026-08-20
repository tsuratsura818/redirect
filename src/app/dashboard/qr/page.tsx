import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { QrCode } from '@/types/database'
import QrListClient from './QrListClient'

export default async function QrListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: qrCodes } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  const codes = (qrCodes || []) as QrCode[]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">QR / NFC 管理</h1>
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

      {codes.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-muted mb-4">QR / NFCを作成して管理を始めましょう</p>
          <Link
            href="/dashboard/qr/new"
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg"
          >
            最初のQR / NFCを作成
          </Link>
        </div>
      ) : (
        <QrListClient initialCodes={codes} />
      )}
    </div>
  )
}
