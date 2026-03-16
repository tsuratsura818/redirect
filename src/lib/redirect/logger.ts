import { createAdminClient } from '@/lib/supabase/admin'
import { UAParser } from 'ua-parser-js'
import { createHash } from 'crypto'

interface LogScanParams {
  qrCodeId: string
  redirectRuleId: string | null
  destinationUrl: string
  userAgent: string | null
  ip: string | null
  referer: string | null
}

export async function logScan(params: LogScanParams) {
  const supabase = createAdminClient()

  let deviceType: string | null = null
  let os: string | null = null
  let browser: string | null = null

  if (params.userAgent) {
    const parser = new UAParser(params.userAgent)
    const result = parser.getResult()
    deviceType = result.device.type || 'desktop'
    os = result.os.name || null
    browser = result.browser.name || null
  }

  const ipHash = params.ip
    ? createHash('sha256').update(params.ip).digest('hex').slice(0, 16)
    : null

  await supabase.from('scan_logs').insert({
    qr_code_id: params.qrCodeId,
    redirect_rule_id: params.redirectRuleId,
    destination_url: params.destinationUrl,
    ip_hash: ipHash,
    user_agent: params.userAgent,
    device_type: deviceType,
    os,
    browser,
    referer: params.referer,
  })
}
