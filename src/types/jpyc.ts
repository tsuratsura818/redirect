// src/types/jpyc.ts
// ============================================
// JPYC決済関連の型定義
// ============================================

export type PaymentMethod = 'stripe' | 'jpyc';
export type JpycPlan = 'pro' | 'business';
export type JpycPeriod = '1m' | '3m' | '12m';
export type JpycPaymentStatus = 'pending' | 'confirmed' | 'failed' | 'refunded';

export interface JpycPaymentRecord {
  id: string;
  user_id: string;
  tx_hash: string;
  chain: string;
  from_address: string;
  to_address: string;
  amount: number;
  plan: JpycPlan;
  period: JpycPeriod;
  status: JpycPaymentStatus;
  block_number: number | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface JpycVerifyRequest {
  txHash: string;
  plan: JpycPlan;
  period: JpycPeriod;
}

export interface JpycVerifyResponse {
  success: boolean;
  payment?: JpycPaymentRecord;
  error?: string;
}

export interface JpycPaymentState {
  step: 'select' | 'connect' | 'confirm' | 'signing' | 'verifying' | 'complete' | 'error';
  plan: JpycPlan | null;
  period: JpycPeriod | null;
  txHash: string | null;
  error: string | null;
}

export interface GaslessTransferParams {
  from: `0x${string}`;
  to: `0x${string}`;
  value: bigint;
  validAfter: bigint;
  validBefore: bigint;
  nonce: `0x${string}`;
}
