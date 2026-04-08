// src/app/api/jpyc/check-expiry/route.ts
// ============================================
// Vercel Cron: 毎日0時実行
// JPYC前払いの有効期限チェック
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Vercel Cron 認証
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: NextRequest) {
  // Cron認証チェック
  const authHeader = req.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date().toISOString();
    const gracePeriodDays = 3;
    const graceDate = new Date();
    graceDate.setDate(graceDate.getDate() - gracePeriodDays);

    // 1. 猶予期間を過ぎたサブスクを期限切れに
    const { data: expired, error: expiredError } = await supabase
      .from('subscriptions')
      .update({ status: 'expired' })
      .eq('payment_method', 'jpyc')
      .eq('status', 'active')
      .lt('jpyc_expires_at', graceDate.toISOString())
      .select('user_id, plan, jpyc_expires_at');

    if (expiredError) {
      console.error('Expiry update error:', expiredError);
    }

    // 2. 期限切れ間近（7日以内）のサブスクを取得 → 通知用
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + 7);

    const { data: expiringSoon, error: warningError } = await supabase
      .from('subscriptions')
      .select('user_id, plan, jpyc_expires_at')
      .eq('payment_method', 'jpyc')
      .eq('status', 'active')
      .lt('jpyc_expires_at', warningDate.toISOString())
      .gt('jpyc_expires_at', now);

    if (warningError) {
      console.error('Warning query error:', warningError);
    }

    // TODO: expiringSoon のユーザーにメール通知を送信

    return NextResponse.json({
      success: true,
      expired: expired?.length ?? 0,
      expiringSoon: expiringSoon?.length ?? 0,
      timestamp: now,
    });

  } catch (err) {
    console.error('Check expiry error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
