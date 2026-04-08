-- Migration: Add JPYC payment support to Pivolink
-- File: supabase/migrations/20260407_add_jpyc_payment.sql
-- Description: Extends subscriptions table and creates jpyc_payments log

-- ============================================
-- 1. Extend subscriptions table
-- ============================================
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'stripe'
    CHECK (payment_method IN ('stripe', 'jpyc')),
  ADD COLUMN IF NOT EXISTS jpyc_tx_hash TEXT,
  ADD COLUMN IF NOT EXISTS jpyc_amount BIGINT,
  ADD COLUMN IF NOT EXISTS jpyc_paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS jpyc_expires_at TIMESTAMPTZ;

COMMENT ON COLUMN subscriptions.payment_method IS 'stripe or jpyc';
COMMENT ON COLUMN subscriptions.jpyc_tx_hash IS 'Latest JPYC payment tx hash';
COMMENT ON COLUMN subscriptions.jpyc_amount IS 'Amount in JPYC (1 JPYC = 1 JPY)';
COMMENT ON COLUMN subscriptions.jpyc_expires_at IS 'Prepaid period expiry date';

CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_method
  ON subscriptions (payment_method);
CREATE INDEX IF NOT EXISTS idx_subscriptions_jpyc_expires_at
  ON subscriptions (jpyc_expires_at)
  WHERE payment_method = 'jpyc';

-- ============================================
-- 2. JPYC payments log table
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

CREATE INDEX IF NOT EXISTS idx_jpyc_payments_user_id
  ON jpyc_payments (user_id);
CREATE INDEX IF NOT EXISTS idx_jpyc_payments_status
  ON jpyc_payments (status);
CREATE INDEX IF NOT EXISTS idx_jpyc_payments_created_at
  ON jpyc_payments (created_at DESC);

-- ============================================
-- 3. Updated_at trigger
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

-- Users can read their own payments
CREATE POLICY jpyc_payments_select_own ON jpyc_payments
  FOR SELECT USING (auth.uid() = user_id);

-- Insert via service role only (API route)
CREATE POLICY jpyc_payments_insert_service ON jpyc_payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- No direct update/delete from client
-- Admin operations via service_role key in API routes

-- ============================================
-- 5. JPYC revenue summary view (admin dashboard)
-- ============================================
CREATE OR REPLACE VIEW jpyc_revenue_summary AS
SELECT
  date_trunc('day', created_at) AS date,
  plan,
  period,
  COUNT(*) AS tx_count,
  SUM(amount) AS total_jpyc,
  SUM(amount) AS total_jpy  -- 1 JPYC = 1 JPY
FROM jpyc_payments
WHERE status = 'confirmed'
GROUP BY date_trunc('day', created_at), plan, period
ORDER BY date DESC;

COMMENT ON VIEW jpyc_revenue_summary IS 'Daily JPYC revenue aggregation for admin dashboard';
