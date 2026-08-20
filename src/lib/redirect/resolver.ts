import type {
  RedirectRule,
  ScheduleCondition,
  DeviceCondition,
  AbTestCondition,
  ScheduledSwitchCondition,
  TimeOfDayCondition,
  ScanStepCondition,
} from '@/types/database'

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
  deviceType: DeviceType,
  scanCount: number
): { url: string; ruleId: string | null } {
  // アクティブなルールのみ、優先度順でソート
  const activeRules = rules
    .filter(r => r.is_active)
    .sort((a, b) => b.priority - a.priority)

  const now = new Date()

  // 1. スケジュールルール（期間指定）を最優先チェック
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

  // 2. 予約切替（scheduled_switch）— switch_at を過ぎたルールのうち、最も新しいものを採用
  const passedSwitches = activeRules
    .filter(r => r.condition_type === 'scheduled_switch')
    .map(r => ({
      rule: r,
      at: new Date((r.condition_value as ScheduledSwitchCondition).switch_at).getTime(),
    }))
    .filter(x => !Number.isNaN(x.at) && now.getTime() >= x.at)
    .sort((a, b) => b.at - a.at)
  if (passedSwitches.length > 0) {
    return { url: passedSwitches[0].rule.destination_url, ruleId: passedSwitches[0].rule.id }
  }

  // 3. 時間帯（time_of_day）— 現在のJST時刻が範囲内なら採用
  const jstNow = currentJstTime()
  for (const rule of activeRules) {
    if (rule.condition_type === 'time_of_day') {
      const cond = rule.condition_value as TimeOfDayCondition
      if (cond.start_time && cond.end_time && isWithinTimeRange(jstNow, cond.start_time, cond.end_time)) {
        return { url: rule.destination_url, ruleId: rule.id }
      }
    }
  }

  // 4. ステップアップ（scan_step）— visit が scanCount 以下で最大のルールを採用（最後のステップを継続）
  const stepRules = activeRules
    .filter(r => r.condition_type === 'scan_step')
    .map(r => ({ rule: r, visit: (r.condition_value as ScanStepCondition).visit }))
    .filter(x => typeof x.visit === 'number' && x.visit >= 1 && x.visit <= scanCount)
    .sort((a, b) => b.visit - a.visit)
  if (stepRules.length > 0) {
    return { url: stepRules[0].rule.destination_url, ruleId: stepRules[0].rule.id }
  }

  // 5. デバイスルールをチェック
  for (const rule of activeRules) {
    if (rule.condition_type === 'device') {
      const cond = rule.condition_value as DeviceCondition
      if (cond.device === deviceType) {
        return { url: rule.destination_url, ruleId: rule.id }
      }
    }
  }

  // 6. A/Bテストルールをチェック
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

  // 7. デフォルトルールをチェック
  const defaultRule = activeRules.find(r => r.condition_type === 'default')
  if (defaultRule) {
    return { url: defaultRule.destination_url, ruleId: defaultRule.id }
  }

  // 8. フォールバック
  return { url: defaultUrl, ruleId: null }
}

// 現在の日本時間を "HH:MM" で返す（VercelはサーバーがUTCのため明示変換）
function currentJstTime(): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tokyo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date())
  let h = parts.find(p => p.type === 'hour')?.value ?? '00'
  const m = parts.find(p => p.type === 'minute')?.value ?? '00'
  if (h === '24') h = '00' // 一部環境で深夜が "24" になる対策
  return `${h}:${m}`
}

// now が start〜end の範囲内か判定（"HH:MM"の文字列比較）
// 開始・終了とも「含む」（"12:01〜17:00" は 17:00 も対象）。end<start は日跨ぎ扱い
function isWithinTimeRange(now: string, start: string, end: string): boolean {
  if (start === end) return false
  if (start < end) return now >= start && now <= end
  return now >= start || now <= end
}
