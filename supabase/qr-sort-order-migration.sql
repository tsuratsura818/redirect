-- Migration: qr_codes に並べ替え用 sort_order を追加
-- File: supabase/qr-sort-order-migration.sql

ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

-- 既存QRに現在の表示順（ユーザーごと・作成日降順）で初期値を設定
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
  FROM qr_codes
)
UPDATE qr_codes q SET sort_order = o.rn FROM ordered o WHERE q.id = o.id;

CREATE INDEX IF NOT EXISTS idx_qr_codes_sort_order ON qr_codes(user_id, sort_order);

COMMENT ON COLUMN qr_codes.sort_order IS 'QR一覧の表示順（小さいほど上）。手動ドラッグで並べ替え';
