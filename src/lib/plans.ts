export type PlanId = 'free' | 'pro' | 'business'
export type BillingCycle = 'monthly' | 'annual'

export const IS_BETA = true

export interface PlanDefinition {
  id: PlanId
  name: string
  price: number
  priceLabel: string
  betaPrice?: number
  betaPriceLabel?: string
  // 年額（2ヶ月無料 = 10ヶ月分）
  annualPrice?: number
  annualPriceLabel?: string
  annualMonthlyLabel?: string   // 月換算表示用
  betaAnnualPrice?: number
  betaAnnualPriceLabel?: string
  betaAnnualMonthlyLabel?: string
  description: string
  limits: {
    maxQrCodes: number
    maxScansPerMonth: number
    rules: boolean
    cushionPages: boolean
    analytics: 'basic' | 'full'
    csvExport: boolean
  }
  features: string[]
  popular?: boolean
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceLabel: '¥0',
    description: 'まずは試してみたい方に',
    limits: {
      maxQrCodes: 3,
      maxScansPerMonth: 1000,
      rules: false,
      cushionPages: false,
      analytics: 'basic',
      csvExport: false,
    },
    features: [
      'QR/NFCリダイレクト 3件',
      '月間アクセス 1,000回',
      '基本アクセス解析',
      'QRコード自動生成（PNG/SVG）',
      '変更履歴ログ',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 980,
    priceLabel: '¥980',
    betaPrice: 780,
    betaPriceLabel: '¥780',
    annualPrice: 9800,
    annualPriceLabel: '¥9,800',
    annualMonthlyLabel: '¥817',
    betaAnnualPrice: 7800,
    betaAnnualPriceLabel: '¥7,800',
    betaAnnualMonthlyLabel: '¥650',
    description: '本格運用したい方に',
    limits: {
      maxQrCodes: 50,
      maxScansPerMonth: 50000,
      rules: true,
      cushionPages: true,
      analytics: 'full',
      csvExport: true,
    },
    features: [
      'QR/NFCリダイレクト 50件',
      '月間アクセス 50,000回',
      '詳細アクセス解析',
      'スケジュール / デバイス別振分',
      'A/Bテスト',
      'クッションページ',
      'CSVエクスポート',
    ],
    popular: true,
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 4980,
    priceLabel: '¥4,980',
    betaPrice: 3980,
    betaPriceLabel: '¥3,980',
    annualPrice: 49800,
    annualPriceLabel: '¥49,800',
    annualMonthlyLabel: '¥4,150',
    betaAnnualPrice: 39800,
    betaAnnualPriceLabel: '¥39,800',
    betaAnnualMonthlyLabel: '¥3,316',
    description: '大規模運用・チーム向け',
    limits: {
      maxQrCodes: -1, // 無制限
      maxScansPerMonth: -1,
      rules: true,
      cushionPages: true,
      analytics: 'full',
      csvExport: true,
    },
    features: [
      'QR/NFCリダイレクト 無制限',
      '月間アクセス 無制限',
      '詳細アクセス解析',
      '全ルール機能',
      'クッションページ',
      'CSVエクスポート',
      '優先サポート',
    ],
  },
}

export function getPlanLimits(planId: PlanId) {
  return PLANS[planId]?.limits ?? PLANS.free.limits
}
