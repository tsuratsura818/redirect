// src/app/api/jpyc/nonce/route.ts
// ============================================
// EIP-3009 用 nonce 生成
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

const MERCHANT_ADDRESS = process.env.JPYC_MERCHANT_ADDRESS!;

export async function POST(req: NextRequest) {
  try {
    const { from } = (await req.json()) as { from: string };

    if (!from) {
      return NextResponse.json({ error: 'from address is required' }, { status: 400 });
    }

    // ランダム nonce（bytes32）
    const nonce = '0x' + randomBytes(32).toString('hex');

    return NextResponse.json({
      nonce,
      merchantAddress: MERCHANT_ADDRESS,
    });

  } catch (err) {
    console.error('Nonce generation error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
