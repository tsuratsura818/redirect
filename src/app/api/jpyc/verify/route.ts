// src/app/api/jpyc/verify/route.ts
// ============================================
// JPYC tx hash 検証 → Supabase 更新
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { polygon, sepolia } from 'viem/chains';
import { JPYC_PRICING, getExpiryDate } from '@/lib/jpyc/pricing';
import type { JpycPlan, JpycPeriod } from '@/types/jpyc';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // service role for write
);

function getPublicClient() {
  const chain = Number(process.env.NEXT_PUBLIC_CHAIN_ID) === 137 ? polygon : sepolia;
  return createPublicClient({
    chain,
    transport: http(process.env.POLYGON_RPC_URL),
  });
}

const TRANSFER_EVENT = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)');

export async function POST(req: NextRequest) {
  try {
    const { txHash, plan, period } = (await req.json()) as {
      txHash: string;
      plan: JpycPlan;
      period: JpycPeriod;
    };

    // 1. 重複チェック
    const { data: existing } = await supabase
      .from('jpyc_payments')
      .select('id')
      .eq('tx_hash', txHash)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'このトランザクションは既に処理済みです' }, { status: 409 });
    }

    // 2. tx receipt 取得
    const publicClient = getPublicClient();
    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    if (receipt.status !== 'success') {
      return NextResponse.json({ error: 'トランザクションが失敗しています' }, { status: 400 });
    }

    // 3. Transfer イベントログを検索
    const transferLogs = receipt.logs.filter((log) => {
      try {
        return log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
      } catch {
        return false;
      }
    });

    // to が merchant address であるログを探す
    const merchant = process.env.JPYC_MERCHANT_ADDRESS!.toLowerCase();
    const matchingLog = transferLogs.find((log) => {
      const to = '0x' + (log.topics[2]?.slice(26) ?? '');
      return to.toLowerCase() === merchant;
    });

    if (!matchingLog) {
      return NextResponse.json({ error: '受取アドレスが一致しません' }, { status: 400 });
    }

    // 4. 金額検証
    const transferredAmount = BigInt(matchingLog.data);
    const expectedAmount = BigInt(JPYC_PRICING[plan][period].amount) * BigInt(10 ** 18);

    if (transferredAmount < expectedAmount) {
      return NextResponse.json({ error: '送金額が不足しています' }, { status: 400 });
    }

    const fromAddress = '0x' + (matchingLog.topics[1]?.slice(26) ?? '');

    // 5. ユーザー特定（認証トークンから取得）
    const authHeader = req.headers.get('authorization');
    const { data: { user } } = await supabase.auth.getUser(authHeader?.replace('Bearer ', '') ?? '');

    if (!user) {
      return NextResponse.json({ error: '認証エラー' }, { status: 401 });
    }

    // 6. jpyc_payments に記録
    const expiryDate = getExpiryDate(period);

    const { data: payment, error: insertError } = await supabase
      .from('jpyc_payments')
      .insert({
        user_id: user.id,
        tx_hash: txHash,
        chain: Number(process.env.NEXT_PUBLIC_CHAIN_ID) === 137 ? 'Polygon' : 'Sepolia',
        from_address: fromAddress,
        to_address: merchant,
        amount: JPYC_PRICING[plan][period].amount,
        plan,
        period,
        status: 'confirmed',
        block_number: Number(receipt.blockNumber),
        verified_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: '決済記録の保存に失敗しました' }, { status: 500 });
    }

    // 7. subscriptions テーブル更新
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        payment_method: 'jpyc',
        plan,
        status: 'active',
        jpyc_tx_hash: txHash,
        jpyc_amount: JPYC_PRICING[plan][period].amount,
        jpyc_paid_at: new Date().toISOString(),
        jpyc_expires_at: expiryDate.toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Subscription update error:', updateError);
    }

    return NextResponse.json({ success: true, payment });

  } catch (err) {
    console.error('JPYC verify error:', err);
    return NextResponse.json(
      { error: 'トランザクション検証中にエラーが発生しました' },
      { status: 500 },
    );
  }
}
