import { createAdminClient } from '@/lib/supabase/admin'
import type { CushionPage } from '@/types/database'
import CushionView from './CushionView'

export const dynamic = 'force-dynamic'

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ dest?: string }>
}) {
  const { slug } = await params
  const { dest } = await searchParams
  const destination = dest || '/'

  // クッションページ設定を取得
  const supabase = createAdminClient()
  const { data: qrCode } = await supabase
    .from('qr_codes')
    .select('id')
    .eq('slug', slug)
    .single()

  let cushion: CushionPage | null = null
  if (qrCode) {
    const { data } = await supabase
      .from('cushion_pages')
      .select('*')
      .eq('qr_code_id', qrCode.id)
      .single()
    cushion = (data as CushionPage | null) ?? null
  }

  return <CushionView dest={destination} cushion={cushion} />
}
