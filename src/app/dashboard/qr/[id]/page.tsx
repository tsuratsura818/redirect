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

  const { data: qrCode } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

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
