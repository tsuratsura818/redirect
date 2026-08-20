-- Migration: QRログインボーナス 重複防止テーブル
-- File: supabase/qr-bonus-migration.sql
-- Supabase SQL Editor で実行する

CREATE TABLE IF NOT EXISTS qr_bonus_claims (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_domain          VARCHAR(255) NOT NULL,
  shopify_customer_id  BIGINT       NOT NULL,
  claim_date           DATE         NOT NULL,                       -- JST日付
  qr_code_id           UUID REFERENCES qr_codes(id) ON DELETE SET NULL,
  points               INTEGER,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
  -- 1顧客あたり1日1回（ストア単位）を原子的に保証
  CONSTRAINT uq_qr_bonus_claims_daily UNIQUE (shop_domain, shopify_customer_id, claim_date)
);

CREATE INDEX IF NOT EXISTS idx_qr_bonus_claims_lookup
  ON qr_bonus_claims (shop_domain, shopify_customer_id, claim_date);

-- 書き込み/読み取りはサーバ(service_role)のみ。公開ポリシーは作成しない。
ALTER TABLE qr_bonus_claims ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE qr_bonus_claims IS 'QRログインボーナスの付与記録（重複防止 + 履歴）';
COMMENT ON COLUMN qr_bonus_claims.claim_date IS 'JST基準の付与日。(shop,customer,date) でユニーク';
