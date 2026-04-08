// src/hooks/useJpycBalance.ts
// ============================================
// JPYC残高取得フック
// wagmi の useReadContract でERC20 balanceOf を直接呼び出し
// ============================================

'use client';

import { useAccount, useReadContract } from 'wagmi';
import { erc20Abi } from 'viem';
import { JPYC_CONTRACT_ADDRESS, ACTIVE_CHAIN_ID } from '@/lib/jpyc/config';

export function useJpycBalance() {
  const { address, isConnected } = useAccount();

  const contractAddress = JPYC_CONTRACT_ADDRESS[ACTIVE_CHAIN_ID];

  const { data: rawBalance, isLoading, error } = useReadContract({
    address: contractAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    },
  });

  // JPYC は decimals=18 だが、1 JPYC = 1 JPY なので
  // rawBalance を number に変換（整数部のみ使用）
  const balance = rawBalance !== undefined
    ? Math.floor(Number(rawBalance) / 1e18)
    : null;

  return {
    balance,
    isLoading: isLoading || (!isConnected),
    error,
    isConnected,
    address,
  };
}
