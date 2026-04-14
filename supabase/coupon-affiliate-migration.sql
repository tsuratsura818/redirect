-- Migration: Coupon & Affiliate system for Pivolink
-- File: supabase/coupon-affiliate-migration.sql

-- ============================================
-- 1. Coupons table
-- ============================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  stripe_coupon_id VARCHAR(200),
  discount_percent INTEGER NOT NULL DEFAULT 20,
  affiliate_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coupons_affiliate_user_id ON coupons(affiliate_user_id);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coupons_public_read" ON coupons FOR SELECT USING (true);

-- ============================================
-- 2. Coupon usages table
-- ============================================
CREATE TABLE IF NOT EXISTS coupon_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(200),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon_id ON coupon_usages(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_user_id ON coupon_usages(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupon_usages_user_unique ON coupon_usages(user_id);

ALTER TABLE coupon_usages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coupon_usages_self_read" ON coupon_usages
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- 3. Affiliate applications table
-- ============================================
CREATE TABLE IF NOT EXISTS affiliate_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  motivation TEXT,
  community_name VARCHAR(200),
  community_url TEXT,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_applications_status ON affiliate_applications(status);

ALTER TABLE affiliate_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "affiliate_apps_self_read" ON affiliate_applications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "affiliate_apps_self_insert" ON affiliate_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 4. Affiliate payouts table
-- ============================================
CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  active_referrals INTEGER NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate ON affiliate_payouts(affiliate_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_period ON affiliate_payouts(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_status ON affiliate_payouts(status);

ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "affiliate_payouts_self_read" ON affiliate_payouts
  FOR SELECT USING (auth.uid() = affiliate_user_id);

-- ============================================
-- 5. Extend user_subscriptions
-- ============================================
ALTER TABLE user_subscriptions
  ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id),
  ADD COLUMN IF NOT EXISTS affiliate_user_id UUID REFERENCES auth.users(id);

-- ============================================
-- 6. Updated_at function + triggers
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_coupons_updated_at
  BEFORE UPDATE ON coupons FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_affiliate_applications_updated_at
  BEFORE UPDATE ON affiliate_applications FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_affiliate_payouts_updated_at
  BEFORE UPDATE ON affiliate_payouts FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
