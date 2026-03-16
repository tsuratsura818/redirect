import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { QrCode } from '@/types/database'
import { format } from 'date-fns'

export default async function QrListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: qrCodes } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const codes = (qrCodes || []) as QrCode[]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">QRコード管理</h1>
          <p className="text-muted text-sm mt-1">{codes.length} 件のQRコード</p>
        </div>
        <Link
          href="/dashboard/qr/new"
          className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新規作成
        </Link>
      </div>

      {codes.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-muted mb-4">QRコードを作成して管理を始めましょう</p>
          <Link
            href="/dashboard/qr/new"
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg"
          >
            最初のQRコードを作成
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {codes.map(code => (
            <Link
              key={code.id}
              href={`/dashboard/qr/${code.id}`}
              className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    code.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {code.is_active ? 'アクティブ' : '停止中'}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{code.name}</h3>
                    <p className="text-sm text-muted mt-0.5">
                      /r/{code.slug}
                      {code.description && ` — ${code.description}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8 text-sm">
                  <div className="text-right">
                    <div className="font-bold text-foreground">{code.scan_count.toLocaleString()}</div>
                    <div className="text-muted">スキャン</div>
                  </div>
                  <div className="text-right text-muted">
                    {format(new Date(code.created_at), 'yyyy/MM/dd')}
                  </div>
                  <svg className="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
