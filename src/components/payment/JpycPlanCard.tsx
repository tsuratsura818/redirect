// src/components/payment/JpycPlanCard.tsx
// ============================================
// JPYC前払いプラン選択カード
// ============================================

'use client';

import { JPYC_PRICING, formatJpyc, formatDiscount } from '@/lib/jpyc/pricing';
import type { JpycPlan, JpycPeriod } from '@/types/jpyc';

interface JpycPlanCardProps {
  plan: JpycPlan;
  period: JpycPeriod;
  selected: boolean;
  onSelect: () => void;
}

export function JpycPlanCard({ plan, period, selected, onSelect }: JpycPlanCardProps) {
  const pricing = JPYC_PRICING[plan][period];
  const discount = formatDiscount(pricing.discount);

  return (
    <button
      onClick={onSelect}
      className={`relative rounded-lg border-2 p-3 text-left transition-all ${
        selected
          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950'
          : 'border-border hover:border-teal-300'
      }`}
    >
      {discount && (
        <span className="absolute -top-2 right-2 rounded-full bg-teal-500 px-2 py-0.5 text-[10px] font-bold text-white">
          {discount}
        </span>
      )}
      <p className="text-xs text-muted">{pricing.label}</p>
      <p className="mt-1 text-sm font-bold">{formatJpyc(pricing.amount)}</p>
      <p className="text-[10px] text-muted">
        月額 {pricing.monthlyEquiv.toLocaleString()} JPYC
      </p>
    </button>
  );
}
