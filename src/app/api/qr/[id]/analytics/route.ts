import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  // オーナー確認
  const { data: qrCode } = await supabase
    .from('qr_codes')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!qrCode) {
    return NextResponse.json({ error: '見つかりません' }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '30', 10)

  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data: logs } = await supabase
    .from('scan_logs')
    .select('*')
    .eq('qr_code_id', id)
    .gte('scanned_at', since.toISOString())
    .order('scanned_at', { ascending: false })

  const scanLogs = logs || []

  // 日別集計
  const dailyMap = new Map<string, number>()
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dailyMap.set(d.toISOString().split('T')[0], 0)
  }
  for (const log of scanLogs) {
    const date = log.scanned_at.split('T')[0]
    dailyMap.set(date, (dailyMap.get(date) || 0) + 1)
  }
  const daily = Array.from(dailyMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // デバイス別
  const deviceMap = new Map<string, number>()
  for (const log of scanLogs) {
    const device = log.device_type || 'unknown'
    deviceMap.set(device, (deviceMap.get(device) || 0) + 1)
  }
  const devices = Array.from(deviceMap.entries())
    .map(([device_type, count]) => ({ device_type, count }))
    .sort((a, b) => b.count - a.count)

  // OS別
  const osMap = new Map<string, number>()
  for (const log of scanLogs) {
    const os = log.os || 'unknown'
    osMap.set(os, (osMap.get(os) || 0) + 1)
  }
  const osList = Array.from(osMap.entries())
    .map(([os, count]) => ({ os, count }))
    .sort((a, b) => b.count - a.count)

  // ブラウザ別
  const browserMap = new Map<string, number>()
  for (const log of scanLogs) {
    const browser = log.browser || 'unknown'
    browserMap.set(browser, (browserMap.get(browser) || 0) + 1)
  }
  const browsers = Array.from(browserMap.entries())
    .map(([browser, count]) => ({ browser, count }))
    .sort((a, b) => b.count - a.count)

  // ルール別
  const ruleMap = new Map<string, { url: string; count: number }>()
  for (const log of scanLogs) {
    const key = log.destination_url
    const existing = ruleMap.get(key) || { url: key, count: 0 }
    existing.count++
    ruleMap.set(key, existing)
  }
  const destinations = Array.from(ruleMap.values())
    .sort((a, b) => b.count - a.count)

  return NextResponse.json({
    total: scanLogs.length,
    daily,
    devices,
    os: osList,
    browsers,
    destinations,
  })
}
