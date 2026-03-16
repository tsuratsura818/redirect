import type { RedirectRule, ScheduleCondition, DeviceCondition, AbTestCondition } from '@/types/database'

export type DeviceType = 'ios' | 'android' | 'desktop' | 'other'

export function detectDeviceType(userAgent: string): DeviceType {
  const ua = userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(ua)) return 'ios'
  if (/android/.test(ua)) return 'android'
  if (/windows|macintosh|linux/.test(ua) && !/mobile/.test(ua)) return 'desktop'
  return 'other'
}

export function resolveRedirectUrl(
  rules: RedirectRule[],
  defaultUrl: string,
  deviceType: DeviceType
): { url: string; ruleId: string | null } {
  // アクティブなルールのみ、優先度順でソート
  const activeRules = rules
    .filter(r => r.is_active)
    .sort((a, b) => b.priority - a.priority)

  // 1. スケジュールルールを最優先チェック
  const now = new Date()
  for (const rule of activeRules) {
    if (rule.condition_type === 'schedule') {
      const cond = rule.condition_value as ScheduleCondition
      const start = new Date(cond.start_at)
      const end = new Date(cond.end_at)
      if (now >= start && now <= end) {
        return { url: rule.destination_url, ruleId: rule.id }
      }
    }
  }

  // 2. デバイスルールをチェック
  for (const rule of activeRules) {
    if (rule.condition_type === 'device') {
      const cond = rule.condition_value as DeviceCondition
      if (cond.device === deviceType) {
        return { url: rule.destination_url, ruleId: rule.id }
      }
    }
  }

  // 3. A/Bテストルールをチェック
  const abRules = activeRules.filter(r => r.condition_type === 'ab_test')
  if (abRules.length > 0) {
    const totalWeight = abRules.reduce((sum, r) => {
      const cond = r.condition_value as AbTestCondition
      return sum + (cond.weight || 0)
    }, 0)

    if (totalWeight > 0) {
      let random = Math.random() * totalWeight
      for (const rule of abRules) {
        const cond = rule.condition_value as AbTestCondition
        random -= cond.weight || 0
        if (random <= 0) {
          return { url: rule.destination_url, ruleId: rule.id }
        }
      }
    }
  }

  // 4. デフォルトルールをチェック
  const defaultRule = activeRules.find(r => r.condition_type === 'default')
  if (defaultRule) {
    return { url: defaultRule.destination_url, ruleId: defaultRule.id }
  }

  // 5. フォールバック
  return { url: defaultUrl, ruleId: null }
}
