// src/components/payment/PaymentMethodSelector.tsx
// ============================================
// Stripe / JPYC 切替タブUI
// 既存の pricing/page.tsx に組み込む
// ============================================

'use client';

import { useState } from 'react';
import { JpycPaymentFlow } from './JpycPaymentFlow';
import type { PaymentMethod, JpycPlan } from '@/types/jpyc';

interface PaymentMethodSelectorProps {
  plan: JpycPlan;
  onStripeCheckout: () => void;
}

export function PaymentMethodSelector({ plan, onStripeCheckout }: PaymentMethodSelectorProps) {
  const [method, setMethod] = useState<PaymentMethod>('stripe');

  return (
    <div className="w-full">
      {/* タブ切替 */}
      <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1 gap-1">
        <button
          onClick={() => setMethod('stripe')}
          className={`flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all ${
            method === 'stripe'
              ? 'bg-white text-foreground shadow-sm'
              : 'text-foreground/55 hover:text-foreground'
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
          クレジットカード
        </button>
        <button
          onClick={() => setMethod('jpyc')}
          className={`flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all ${
            method === 'jpyc'
              ? 'bg-white text-foreground shadow-sm'
              : 'text-foreground/55 hover:text-foreground'
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
            <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
            <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
          </svg>
          JPYC決済
        </button>
      </div>

      {/* コンテンツ */}
      <div className="mt-4">
        {method === 'stripe' ? (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              クレジットカードで月額課金します。
            </p>
            <button
              onClick={onStripeCheckout}
              className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white hover:bg-primary-dark transition-colors"
            >
              カードで支払う
            </button>
          </div>
        ) : (
          <JpycPaymentFlow plan={plan} />
        )}
      </div>
    </div>
  );
}
