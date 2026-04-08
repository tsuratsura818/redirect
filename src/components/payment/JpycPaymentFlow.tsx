// src/components/payment/JpycPaymentFlow.tsx
// ============================================
// JPYC決済フロー
// プラン選択 → ウォレット接続 → 残高確認 → 署名 → 検証 → 完了
// ============================================

'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useJpycPayment } from '@/hooks/useJpycPayment';
import { useJpycBalance } from '@/hooks/useJpycBalance';
import { Web3Provider } from '@/components/providers/Web3Provider';
import { JpycPlanCard } from './JpycPlanCard';
import { JpycBalanceDisplay } from './JpycBalanceDisplay';
import { JPYC_PRICING, formatJpyc } from '@/lib/jpyc/pricing';
import type { JpycPlan, JpycPeriod } from '@/types/jpyc';

interface JpycPaymentFlowProps {
  plan: JpycPlan;
}

// Web3Providerでラップするエントリーポイント
export function JpycPaymentFlow({ plan }: JpycPaymentFlowProps) {
  return (
    <Web3Provider>
      <JpycPaymentFlowInner plan={plan} />
    </Web3Provider>
  );
}

function JpycPaymentFlowInner({ plan }: JpycPaymentFlowProps) {
  const [period, setPeriod] = useState<JpycPeriod>('1m');
  const { isConnected } = useAccount();
  const { balance, isLoading: balanceLoading } = useJpycBalance();
  const { state, executePayment } = useJpycPayment();

  const pricing = JPYC_PRICING[plan][period];
  const hasEnoughBalance = balance !== null && balance >= pricing.amount;

  // Step 1: 期間選択
  if (!isConnected) {
    return (
      <div className="space-y-4">
        <p className="text-sm font-medium">支払い期間を選択</p>
        <div className="grid grid-cols-3 gap-3">
          {(['1m', '3m', '12m'] as const).map((p) => (
            <JpycPlanCard
              key={p}
              plan={plan}
              period={p}
              selected={period === p}
              onSelect={() => setPeriod(p)}
            />
          ))}
        </div>

        <div className="pt-2">
          <p className="mb-3 text-sm text-muted">
            ウォレットを接続してJPYCで支払い
          </p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  // Step 2: 完了
  if (state.step === 'complete') {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-bold">決済完了</h3>
        <p className="text-sm text-muted">
          {formatJpyc(pricing.amount)} のお支払いが完了しました
        </p>
        {state.txHash && (
          <a
            href={`https://polygonscan.com/tx/${state.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-teal-600 underline"
          >
            トランザクションを確認
          </a>
        )}
      </div>
    );
  }

  // エラー
  if (state.step === 'error') {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-bold">エラーが発生しました</h3>
        <p className="text-sm text-red-600">{state.error}</p>
        <button
          onClick={() => executePayment(plan, period)}
          className="rounded-lg bg-primary px-4 py-2 text-sm text-white"
        >
          再試行
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 期間選択 */}
      <p className="text-sm font-medium">支払い期間を選択</p>
      <div className="grid grid-cols-3 gap-3">
        {(['1m', '3m', '12m'] as const).map((p) => (
          <JpycPlanCard
            key={p}
            plan={plan}
            period={p}
            selected={period === p}
            onSelect={() => setPeriod(p)}
          />
        ))}
      </div>

      {/* ウォレット情報 */}
      <div className="rounded-lg border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">接続中</span>
          <ConnectButton accountStatus="address" chainStatus="icon" />
        </div>

        <JpycBalanceDisplay
          balance={balance}
          isLoading={balanceLoading}
          requiredAmount={pricing.amount}
        />
      </div>

      {/* 支払いボタン */}
      <button
        onClick={() => executePayment(plan, period)}
        disabled={
          !hasEnoughBalance ||
          state.step === 'signing' ||
          state.step === 'verifying'
        }
        className="w-full rounded-lg bg-teal-600 px-4 py-3 font-medium text-white hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {(state.step === 'signing' || state.step === 'verifying') && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
        )}
        {state.step === 'signing' && '署名を確認中...'}
        {state.step === 'verifying' && 'トランザクション検証中...'}
        {state.step !== 'signing' && state.step !== 'verifying' && (
          <>JPYCで支払う（{formatJpyc(pricing.amount)}）</>
        )}
      </button>

      {!hasEnoughBalance && !balanceLoading && (
        <p className="text-xs text-red-500">
          JPYC残高が不足しています。JPYC EX で購入してください。
        </p>
      )}
    </div>
  );
}
