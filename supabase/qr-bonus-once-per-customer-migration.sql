-- Migration: QRログインボーナスを「1顧客1回のみ」に変更
-- File: supabase/qr-bonus-once-per-customer-migration.sql
-- 従来の (shop, customer, claim_date) ユニーク制約（1日1回）を
-- (shop, customer) ユニーク制約（永久に1回のみ）へ変更する

ALTER TABLE qr_bonus_claims DROP CONSTRAINT IF EXISTS uq_qr_bonus_claims_daily;

-- 同一顧客の重複行があれば最古の1件を残して削除（制約追加を安全にするため）
DELETE FROM qr_bonus_claims a
  USING qr_bonus_claims b
  WHERE a.shop_domain = b.shop_domain
    AND a.shopify_customer_id = b.shopify_customer_id
    AND a.created_at > b.created_at;

ALTER TABLE qr_bonus_claims
  ADD CONSTRAINT uq_qr_bonus_claims_customer UNIQUE (shop_domain, shopify_customer_id);
