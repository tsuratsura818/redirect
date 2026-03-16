import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveRedirectUrl, detectDeviceType } from '@/lib/redirect/resolver'
import { logScan } from '@/lib/redirect/logger'
import type { RedirectRule, CushionPage } from '@/types/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = createAdminClient()

  // QRコード検索
  const { data: qrCode } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!qrCode) {
    return NextResponse.redirect(new URL('/not-found', request.url))
  }

  // 有効期限チェック
  if (!qrCode.is_active || (qrCode.expires_at && new Date(qrCode.expires_at) < new Date())) {
    const fallback = qrCode.fallback_url || new URL('/expired', request.url).toString()
    return NextResponse.redirect(fallback)
  }

  // リダイレクトルール取得
  const { data: rules } = await supabase
    .from('redirect_rules')
    .select('*')
    .eq('qr_code_id', qrCode.id)
    .eq('is_active', true)
    .order('priority', { ascending: false })

  // デバイス判定
  const userAgent = request.headers.get('user-agent') || ''
  const deviceType = detectDeviceType(userAgent)

  // リダイレクト先を決定
  const { url: destinationUrl, ruleId } = resolveRedirectUrl(
    (rules || []) as RedirectRule[],
    qrCode.default_url,
    deviceType
  )

  // クッションページチェック
  const { data: cushion } = await supabase
    .from('cushion_pages')
    .select('*')
    .eq('qr_code_id', qrCode.id)
    .eq('is_active', true)
    .single()

  // スキャンログ記録（非同期、レスポンスをブロックしない）
  logScan({
    qrCodeId: qrCode.id,
    redirectRuleId: ruleId,
    destinationUrl,
    userAgent,
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    referer: request.headers.get('referer'),
  }).catch(() => {})

  // クッションページがあれば表示
  if (cushion && (cushion as CushionPage).is_active) {
    const cushionUrl = new URL(`/r/${slug}/cushion`, request.url)
    cushionUrl.searchParams.set('dest', destinationUrl)
    return NextResponse.redirect(cushionUrl)
  }

  // 直接リダイレクト
  return NextResponse.redirect(destinationUrl)
}
