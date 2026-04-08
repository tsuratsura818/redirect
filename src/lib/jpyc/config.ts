// src/lib/jpyc/config.ts
// ============================================
// チェーン設定・コントラクトアドレス
// ============================================

import { polygon, sepolia } from 'viem/chains';

export const ACTIVE_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 11155111;
export const ACTIVE_CHAIN = ACTIVE_CHAIN_ID === 137 ? polygon : sepolia;

// JPYC V2 コントラクトアドレス（Polygon mainnet）
// Sepoliaテストネットの場合はJPYC公式ドキュメント参照
export const JPYC_CONTRACT_ADDRESS: Record<number, `0x${string}`> = {
  137: '0x431D5dfF2a31c95a8dc5B2cE2FB99B924FD9E82E',    // Polygon mainnet
  11155111: '0x0000000000000000000000000000000000000000', // Sepolia（要確認）
};

export const MERCHANT_ADDRESS = process.env.JPYC_MERCHANT_ADDRESS as `0x${string}`;

// EIP-3009 署名の有効期間（秒）
export const SIGNATURE_VALIDITY_SECONDS = 300; // 5分
