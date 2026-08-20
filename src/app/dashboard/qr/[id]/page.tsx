import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { QrCode } from '@/types/database'
import QrDetailClient from './QrDetailClient'

export default async function QrDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // id が UUID 形式なら id 検索、それ以外は slug 検索（QR/NFCスキャンからの遷移に対応）
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  const { data: qrCode } = await supabase
    .from('qr_codes')
    .select('*')
    .eq(isUuid ? 'id' : 'slug', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!qrCode) notFound()

  return (
    <div>
      <Link href="/dashboard/qr" className="text-muted hover:text-foreground text-sm flex items-center gap-1 mb-4">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        QR / NFC 一覧
      </Link>
      <QrDetailClient qrCode={qrCode as QrCode} />
    </div>
  )
}
