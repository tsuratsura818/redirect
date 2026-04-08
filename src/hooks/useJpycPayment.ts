// src/hooks/useJpycPayment.ts
// ============================================
// JPYC決済フロー全体を管理するカスタムフック
// EIP-3009ガスレス送金 → tx検証 → DB更新
// ============================================

'use client';

import { useState, useCallback } from 'react';
import { useAccount, useSignTypedData } from 'wagmi';
import { JPYC_PRICING } from '@/lib/jpyc/pricing';
import { JPYC_CONTRACT_ADDRESS, ACTIVE_CHAIN_ID, SIGNATURE_VALIDITY_SECONDS } from '@/lib/jpyc/config';
import type { JpycPlan, JpycPeriod, JpycPaymentState } from '@/types/jpyc';

const initialState: JpycPaymentState = {
  step: 'select',
  plan: null,
  period: null,
  txHash: null,
  error: null,
};

// EIP-3009 TransferWithAuthorization の EIP-712 domain & types
const EIP712_DOMAIN = {
  name: 'JPYCv2',
  version: '1',
  chainId: ACTIVE_CHAIN_ID,
  verifyingContract: JPYC_CONTRACT_ADDRESS[ACTIVE_CHAIN_ID],
} as const;

const TRANSFER_WITH_AUTHORIZATION_TYPES = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
} as const;

export function useJpycPayment() {
  const [state, setState] = useState<JpycPaymentState>(initialState);
  const { address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const executePayment = useCallback(async (plan: JpycPlan, period: JpycPeriod) => {
    if (!address) {
      setState({ ...initialState, step: 'error', error: 'ウォレットが接続されていません' });
      return;
    }

    const pricing = JPYC_PRICING[plan][period];
    // JPYC は 18 decimals: amount * 10^18
    const value = BigInt(pricing.amount) * BigInt(10 ** 18);

    try {
      // Step 1: サーバーからnonce取得
      setState({ ...initialState, step: 'signing', plan, period });

      const nonceRes = await fetch('/api/jpyc/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: address }),
      });
      const { nonce, merchantAddress } = await nonceRes.json();

      const now = Math.floor(Date.now() / 1000);
      const validAfter = BigInt(now - 60);  // 1分前から有効
      const validBefore = BigInt(now + SIGNATURE_VALIDITY_SECONDS);

      // Step 2: EIP-712署名をリクエスト
      const signature = await signTypedDataAsync({
        domain: EIP712_DOMAIN,
        types: TRANSFER_WITH_AUTHORIZATION_TYPES,
        primaryType: 'TransferWithAuthorization',
        message: {
          from: address,
          to: merchantAddress as `0x${string}`,
          value,
          validAfter,
          validBefore,
          nonce: nonce as `0x${string}`,
        },
      });

      // Step 3: サーバーに署名を送信 → リレイヤーがtxを送信
      setState((prev) => ({ ...prev, step: 'verifying' }));

      const submitRes = await fetch('/api/jpyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: address,
          value: value.toString(),
          validAfter: validAfter.toString(),
          validBefore: validBefore.toString(),
          nonce,
          signature,
          plan,
          period,
        }),
      });

      if (!submitRes.ok) {
        const err = await submitRes.json();
        throw new Error(err.error || '決済の送信に失敗しました');
      }

      const { txHash } = await submitRes.json();

      // Step 4: tx検証
      const verifyRes = await fetch('/api/jpyc/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash, plan, period }),
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        throw new Error(err.error || 'トランザクション検証に失敗しました');
      }

      // 完了
      setState({
        step: 'complete',
        plan,
        period,
        txHash,
        error: null,
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : '予期しないエラーが発生しました';
      // ユーザーが署名を拒否した場合
      const isUserRejection = message.includes('User rejected') || message.includes('user rejected');
      setState({
        ...initialState,
        step: 'error',
        error: isUserRejection ? '署名がキャンセルされました' : message,
      });
    }
  }, [address, signTypedDataAsync]);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return { state, executePayment, reset };
}
