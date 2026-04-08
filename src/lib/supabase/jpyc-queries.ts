// src/lib/supabase/jpyc-queries.ts
// ============================================
// JPYC関連のDB操作ヘルパー
// ============================================

import { createClient } from '@supabase/supabase-js';
import type { JpycPaymentRecord } from '@/types/jpyc';

// クライアントサイド用（anon key）
export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

/**
 * ユーザーのJPYC決済履歴を取得
 */
export async function getUserJpycPayments(userId: string): Promise<JpycPaymentRecord[]> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('jpyc_payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * ユーザーの現在のサブスク状態を取得（JPYC決済情報含む）
 */
export async function getUserSubscription(userId: string) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, payment_method, jpyc_expires_at, jpyc_amount')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * JPYC売上サマリー取得（管理者ダッシュボード用）
 */
export async function getJpycRevenueSummary(days: number = 30) {
  const supabase = createBrowserClient();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from('jpyc_revenue_summary')
    .select('*')
    .gte('date', since.toISOString())
    .order('date', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * JPYC vs Stripe の決済比率を取得
 */
export async function getPaymentMethodRatio() {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('payment_method')
    .eq('status', 'active');

  if (error) throw error;

  const total = data?.length ?? 0;
  const jpycCount = data?.filter((s) => s.payment_method === 'jpyc').length ?? 0;
  const stripeCount = total - jpycCount;

  return {
    total,
    jpyc: jpycCount,
    stripe: stripeCount,
    jpycRatio: total > 0 ? Math.round((jpycCount / total) * 100) : 0,
  };
}
