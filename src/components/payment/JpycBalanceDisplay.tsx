// src/components/payment/JpycBalanceDisplay.tsx
'use client';

import { formatJpyc } from '@/lib/jpyc/pricing';

interface JpycBalanceDisplayProps {
  balance: number | null;
  isLoading: boolean;
  requiredAmount: number;
}

export function JpycBalanceDisplay({ balance, isLoading, requiredAmount }: JpycBalanceDisplayProps) {
  const sufficient = balance !== null && balance >= requiredAmount;

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted">JPYC残高</span>
      {isLoading ? (
        <svg className="h-4 w-4 animate-spin text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
      ) : balance !== null ? (
        <span className={`text-sm font-medium ${sufficient ? 'text-green-600' : 'text-red-500'}`}>
          {formatJpyc(balance)}
        </span>
      ) : (
        <span className="text-sm text-muted">--</span>
      )}
    </div>
  );
}
