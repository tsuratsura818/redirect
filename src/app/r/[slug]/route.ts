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

  // 読み込み回数（ステップアップ用）— Cookieで端末ごとにカウント
  const stepCookieName = `qrstep_${slug}`
  const prevCount = Number.parseInt(request.cookies.get(stepCookieName)?.value || '0', 10)
  const scanCount = (Number.isNaN(prevCount) ? 0 : prevCount) + 1

  // リダイレクト先を決定
  const { url: destinationUrl, ruleId } = resolveRedirectUrl(
    (rules || []) as RedirectRule[],
    qrCode.default_url,
    deviceType,
    scanCount
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

  // 読み込み回数Cookieをレスポンスにセット（端末ごと・1年保持）
  const withStepCookie = (res: NextResponse) => {
    res.cookies.set(stepCookieName, String(scanCount), {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax',
    })
    return res
  }

  // クッションページがあれば表示
  if (cushion && (cushion as CushionPage).is_active) {
    const cushionUrl = new URL(`/r/${slug}/cushion`, request.url)
    cushionUrl.searchParams.set('dest', destinationUrl)
    return withStepCookie(NextResponse.redirect(cushionUrl))
  }

  // 直接リダイレクト
  return withStepCookie(NextResponse.redirect(destinationUrl))
}
