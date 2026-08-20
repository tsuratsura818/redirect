-- Migration: クッションページにクーポンコード表示機能を追加
-- File: supabase/cushion-coupon-migration.sql
-- Supabase SQL Editor で実行する

ALTER TABLE cushion_pages
  ADD COLUMN IF NOT EXISTS coupon_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(100),
  ADD COLUMN IF NOT EXISTS coupon_note TEXT;

COMMENT ON COLUMN cushion_pages.coupon_enabled IS 'クーポンコードを表示するか';
COMMENT ON COLUMN cushion_pages.coupon_code IS 'ECサイト発行の固定クーポンコード';
COMMENT ON COLUMN cushion_pages.coupon_note IS 'クーポンの注記（有効期限・利用条件など、改行可）';
