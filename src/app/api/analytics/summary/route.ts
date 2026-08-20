import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireUser } from '@/lib/auth'
import { jstDateString } from '@/lib/date'

// アカウント全体のアクセス解析サマリー
export async function GET(request: NextRequest) {
  const auth = await requireUser()
  if (auth.error) return auth.error
  const { userId } = auth

  const { searchParams } = new URL(request.url)
  const days = Math.max(1, Math.min(365, parseInt(searchParams.get('days') || '30', 10) || 30))

  const since = new Date()
  since.setDate(since.getDate() - days)

  // 所有する QR 一覧
  const admin = createAdminClient()
  const { data: qrCodes } = await admin
    .from('qr_codes')
    .select('id, slug, name, default_url, is_active, scan_count, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  const codes = qrCodes || []
  const codeIds = codes.map(c => c.id)

  if (codeIds.length === 0) {
    return NextResponse.json({
      period_days: days,
      total_qr: 0,
      active_qr: 0,
      total_scans_all_time: 0,
      total_scans_period: 0,
      daily: [],
      devices: [],
      os: [],
      browsers: [],
      per_qr: [],
    })
  }

  // 期間内の scan_logs
  const { data: logs } = await admin
    .from('scan_logs')
    .select('qr_code_id, scanned_at, device_type, os, browser')
    .in('qr_code_id', codeIds)
    .gte('scanned_at', since.toISOString())

  const scanLogs = logs || []

  // 日別集計（JST基準）
  const dailyMap = new Map<string, number>()
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dailyMap.set(jstDateString(d), 0)
  }
  for (const log of scanLogs) {
    const date = jstDateString(new Date(log.scanned_at))
    dailyMap.set(date, (dailyMap.get(date) || 0) + 1)
  }
  const daily = Array.from(dailyMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // デバイス別
  const deviceMap = new Map<string, number>()
  for (const log of scanLogs) {
    const k = log.device_type || 'unknown'
    deviceMap.set(k, (deviceMap.get(k) || 0) + 1)
  }
  const devices = Array.from(deviceMap.entries())
    .map(([device_type, count]) => ({ device_type, count }))
    .sort((a, b) => b.count - a.count)

  // OS別
  const osMap = new Map<string, number>()
  for (const log of scanLogs) {
    const k = log.os || 'unknown'
    osMap.set(k, (osMap.get(k) || 0) + 1)
  }
  const osList = Array.from(osMap.entries())
    .map(([os, count]) => ({ os, count }))
    .sort((a, b) => b.count - a.count)

  // ブラウザ別
  const browserMap = new Map<string, number>()
  for (const log of scanLogs) {
    const k = log.browser || 'unknown'
    browserMap.set(k, (browserMap.get(k) || 0) + 1)
  }
  const browsers = Array.from(browserMap.entries())
    .map(([browser, count]) => ({ browser, count }))
    .sort((a, b) => b.count - a.count)

  // QRごとの期間内スキャン数
  const perQrMap = new Map<string, number>()
  for (const log of scanLogs) {
    perQrMap.set(log.qr_code_id, (perQrMap.get(log.qr_code_id) || 0) + 1)
  }
  const per_qr = codes.map(c => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    default_url: c.default_url,
    is_active: c.is_active,
    total_scans_all_time: c.scan_count,
    scans_in_period: perQrMap.get(c.id) || 0,
    created_at: c.created_at,
  })).sort((a, b) => b.scans_in_period - a.scans_in_period)

  return NextResponse.json({
    period_days: days,
    total_qr: codes.length,
    active_qr: codes.filter(c => c.is_active).length,
    total_scans_all_time: codes.reduce((s, c) => s + (c.scan_count || 0), 0),
    total_scans_period: scanLogs.length,
    daily,
    devices,
    os: osList,
    browsers,
    per_qr,
  })
}
