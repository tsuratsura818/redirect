-- Migration: Add JPYC payment support to Pivolink
-- File: supabase/jpyc-payment-migration.sql
-- Description: user_subscriptions に JPYC 用カラムを追加 + jpyc_payments ログ作成
-- 注: 旧版は存在しない `subscriptions` テーブルを参照していたため `user_subscriptions` に修正済み

-- ============================================
-- 1. user_subscriptions テーブルを拡張
-- ============================================
ALTER TABLE user_subscriptions
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'stripe'
    CHECK (payment_method IN ('stripe', 'jpyc')),
  ADD COLUMN IF NOT EXISTS jpyc_tx_hash TEXT,
  ADD COLUMN IF NOT EXISTS jpyc_amount BIGINT,
  ADD COLUMN IF NOT EXISTS jpyc_paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS jpyc_expires_at TIMESTAMPTZ;

COMMENT ON COLUMN user_subscriptions.payment_method IS 'stripe or jpyc';
COMMENT ON COLUMN user_subscriptions.jpyc_tx_hash IS 'Latest JPYC payment tx hash';
COMMENT ON COLUMN user_subscriptions.jpyc_amount IS 'Amount in JPYC (1 JPYC = 1 JPY)';
COMMENT ON COLUMN user_subscriptions.jpyc_expires_at IS 'Prepaid period expiry date';

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_payment_method
  ON user_subscriptions (payment_method);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_jpyc_expires_at
  ON user_subscriptions (jpyc_expires_at)
  WHERE payment_method = 'jpyc';

-- status に 'expired'（JPYC期限切れ）を許可
DO $$
DECLARE cn text;
BEGIN
  SELECT conname INTO cn FROM pg_constraint
   WHERE conrelid = 'user_subscriptions'::regclass AND contype = 'c'
     AND pg_get_constraintdef(oid) ILIKE '%status%';
  IF cn IS NOT NULL THEN
    EXECUTE 'ALTER TABLE user_subscriptions DROP CONSTRAINT ' || quote_ident(cn);
  END IF;
END $$;
ALTER TABLE user_subscriptions
  ADD CONSTRAINT user_subscriptions_status_check
  CHECK (status IN ('active', 'canceled', 'past_due', 'expired'));

-- ============================================
-- 2. JPYC payments ログテーブル
-- ============================================
CREATE TABLE IF NOT EXISTS jpyc_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tx_hash TEXT UNIQUE NOT NULL,
  chain TEXT NOT NULL DEFAULT 'polygon',
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount BIGINT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('pro', 'business')),
  period TEXT NOT NULL CHECK (period IN ('1m', '3m', '12m')),
  status TEXT NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('pending', 'confirmed', 'failed', 'refunded')),
  block_number BIGINT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE jpyc_payments IS 'JPYC payment transaction log';

CREATE INDEX IF NOT EXISTS idx_jpyc_payments_user_id ON jpyc_payments (user_id);
CREATE INDEX IF NOT EXISTS idx_jpyc_payments_status ON jpyc_payments (status);
CREATE INDEX IF NOT EXISTS idx_jpyc_payments_created_at ON jpyc_payments (created_at DESC);

-- ============================================
-- 3. updated_at トリガー
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_jpyc_payments_updated_at ON jpyc_payments;
CREATE TRIGGER trg_jpyc_payments_updated_at
  BEFORE UPDATE ON jpyc_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. Row Level Security
-- ============================================
ALTER TABLE jpyc_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS jpyc_payments_select_own ON jpyc_payments;
CREATE POLICY jpyc_payments_select_own ON jpyc_payments
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT/UPDATE/DELETE はサーバ(service_role)のAPIルート経由のみ。公開ポリシーは作らない。

-- ============================================
-- 5. JPYC revenue summary view（管理ダッシュボード）
-- ============================================
CREATE OR REPLACE VIEW jpyc_revenue_summary AS
SELECT
  date_trunc('day', created_at) AS date,
  plan,
  period,
  COUNT(*) AS tx_count,
  SUM(amount) AS total_jpyc,
  SUM(amount) AS total_jpy
FROM jpyc_payments
WHERE status = 'confirmed'
GROUP BY date_trunc('day', created_at), plan, period
ORDER BY date DESC;

COMMENT ON VIEW jpyc_revenue_summary IS 'Daily JPYC revenue aggregation for admin dashboard';
