-- Migration: Affiliate bank account info
-- File: supabase/affiliate-bank-migration.sql

CREATE TABLE IF NOT EXISTS affiliate_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  bank_name VARCHAR(100) NOT NULL,
  branch_name VARCHAR(100) NOT NULL,
  account_type VARCHAR(10) NOT NULL DEFAULT '普通'
    CHECK (account_type IN ('普通', '当座')),
  account_number VARCHAR(20) NOT NULL,
  account_holder VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE affiliate_bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bank_accounts_self_read" ON affiliate_bank_accounts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bank_accounts_self_insert" ON affiliate_bank_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bank_accounts_self_update" ON affiliate_bank_accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE OR REPLACE TRIGGER trg_affiliate_bank_accounts_updated_at
  BEFORE UPDATE ON affiliate_bank_accounts FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- payoutsに振込情報を追加
ALTER TABLE affiliate_payouts
  ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS branch_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS account_type VARCHAR(10),
  ADD COLUMN IF NOT EXISTS account_number VARCHAR(20),
  ADD COLUMN IF NOT EXISTS account_holder VARCHAR(100);
