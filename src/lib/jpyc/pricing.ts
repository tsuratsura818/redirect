// src/lib/jpyc/pricing.ts
// ============================================
// JPYC決済 価格テーブル（前払い割引計算）
// ============================================

export type PlanId = 'pro' | 'business';
export type Period = '1m' | '3m' | '12m';

interface PricingEntry {
  amount: number;       // JPYC単位（= 円）
  label: string;        // 表示用ラベル
  discount: number;     // 割引率（0.05 = 5%）
  months: number;       // 月数
  monthlyEquiv: number; // 月額換算
}

export const JPYC_PRICING: Record<PlanId, Record<Period, PricingEntry>> = {
  pro: {
    '1m':  { amount: 980,   label: '1ヶ月',  discount: 0,    months: 1,  monthlyEquiv: 980 },
    '3m':  { amount: 2800,  label: '3ヶ月',  discount: 0.05, months: 3,  monthlyEquiv: 933 },
    '12m': { amount: 10580, label: '12ヶ月', discount: 0.10, months: 12, monthlyEquiv: 882 },
  },
  business: {
    '1m':  { amount: 4980,  label: '1ヶ月',  discount: 0,    months: 1,  monthlyEquiv: 4980 },
    '3m':  { amount: 14200, label: '3ヶ月',  discount: 0.05, months: 3,  monthlyEquiv: 4733 },
    '12m': { amount: 53780, label: '12ヶ月', discount: 0.10, months: 12, monthlyEquiv: 4482 },
  },
} as const;

export function getExpiryDate(period: Period): Date {
  const now = new Date();
  const months = JPYC_PRICING.pro[period].months;
  return new Date(now.setMonth(now.getMonth() + months));
}

export function formatJpyc(amount: number): string {
  return `${amount.toLocaleString()} JPYC`;
}

export function formatDiscount(discount: number): string {
  if (discount === 0) return '';
  return `${Math.round(discount * 100)}%OFF`;
}
