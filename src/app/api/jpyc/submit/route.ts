// src/app/api/jpyc/submit/route.ts
// ============================================
// EIP-3009 署名を受け取り、リレイヤーが tx を送信
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, createPublicClient, http, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { polygon, sepolia } from 'viem/chains';
import { JPYC_CONTRACT_ADDRESS, ACTIVE_CHAIN_ID } from '@/lib/jpyc/config';

const chain = ACTIVE_CHAIN_ID === 137 ? polygon : sepolia;

const JPYC_ABI = parseAbi([
  'function transferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s) external',
]);

function getClients() {
  const relayerAccount = privateKeyToAccount(
    process.env.JPYC_RELAYER_PRIVATE_KEY as `0x${string}`,
  );

  const walletClient = createWalletClient({
    account: relayerAccount,
    chain,
    transport: http(process.env.POLYGON_RPC_URL),
  });

  const publicClient = createPublicClient({
    chain,
    transport: http(process.env.POLYGON_RPC_URL),
  });

  return { walletClient, publicClient };
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.JPYC_RELAYER_PRIVATE_KEY) {
      return NextResponse.json({ error: 'Relayer not configured' }, { status: 503 });
    }

    const {
      from,
      value,
      validAfter,
      validBefore,
      nonce,
      signature,
    } = await req.json();

    // 署名を v, r, s に分解
    const sig = signature as `0x${string}`;
    const r = ('0x' + sig.slice(2, 66)) as `0x${string}`;
    const s = ('0x' + sig.slice(66, 130)) as `0x${string}`;
    const v = parseInt(sig.slice(130, 132), 16);

    const contractAddress = JPYC_CONTRACT_ADDRESS[ACTIVE_CHAIN_ID];
    const merchantAddress = process.env.JPYC_MERCHANT_ADDRESS as `0x${string}`;

    const { walletClient, publicClient } = getClients();

    // リレイヤーが tx を送信（ガス代はリレイヤー負担）
    const txHash = await walletClient.writeContract({
      address: contractAddress,
      abi: JPYC_ABI,
      functionName: 'transferWithAuthorization',
      args: [
        from as `0x${string}`,
        merchantAddress,
        BigInt(value),
        BigInt(validAfter),
        BigInt(validBefore),
        nonce as `0x${string}`,
        v,
        r,
        s,
      ],
    });

    // tx 確認を待つ（最大30秒）
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      timeout: 30_000,
    });

    if (receipt.status !== 'success') {
      return NextResponse.json(
        { error: 'トランザクションが失敗しました' },
        { status: 400 },
      );
    }

    return NextResponse.json({ txHash, blockNumber: Number(receipt.blockNumber) });

  } catch (err) {
    console.error('JPYC submit error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
