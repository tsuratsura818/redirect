export interface QrCode {
  id: string
  user_id: string
  slug: string
  name: string
  description: string | null
  default_url: string
  is_active: boolean
  expires_at: string | null
  fallback_url: string | null
  scan_count: number
  created_at: string
  updated_at: string
}

export type ConditionType = 'default' | 'schedule' | 'device' | 'ab_test'

export interface ScheduleCondition {
  start_at: string
  end_at: string
}

export interface DeviceCondition {
  device: 'ios' | 'android' | 'desktop'
}

export interface AbTestCondition {
  weight: number
}

export type ConditionValue = ScheduleCondition | DeviceCondition | AbTestCondition | Record<string, never>

export interface RedirectRule {
  id: string
  qr_code_id: string
  name: string
  destination_url: string
  priority: number
  condition_type: ConditionType
  condition_value: ConditionValue
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ScanLog {
  id: string
  qr_code_id: string
  redirect_rule_id: string | null
  destination_url: string
  scanned_at: string
  ip_hash: string | null
  user_agent: string | null
  device_type: string | null
  os: string | null
  browser: string | null
  country: string | null
  city: string | null
  referer: string | null
}

export interface RedirectHistory {
  id: string
  qr_code_id: string
  user_id: string
  action: 'create' | 'update' | 'delete'
  changes: Record<string, unknown>
  created_at: string
}

export interface CushionPage {
  id: string
  qr_code_id: string
  title: string
  message: string | null
  button_text: string
  background_color: string
  text_color: string
  accent_color: string
  logo_url: string | null
  display_seconds: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface QrCodeWithRules extends QrCode {
  redirect_rules: RedirectRule[]
  cushion_pages: CushionPage[]
}

export interface UserProfile {
  id: string
  role: 'admin' | 'user'
  display_name: string | null
  is_banned: boolean
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  profile: UserProfile | null
  qr_count: number
}

// アナリティクス集計用
export interface DailyScanStat {
  date: string
  count: number
}

export interface DeviceStat {
  device_type: string
  count: number
}

export interface OsStat {
  os: string
  count: number
}

export interface BrowserStat {
  browser: string
  count: number
}
