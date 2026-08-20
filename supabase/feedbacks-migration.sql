-- Migration: フィードバック投稿テーブル
-- File: supabase/feedbacks-migration.sql
-- api/feedback・api/admin/feedbacks が参照するテーブル

CREATE TABLE IF NOT EXISTS feedbacks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'improvement',
  title       VARCHAR(200) NOT NULL,
  body        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open',
  admin_note  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedbacks_user_id ON feedbacks (user_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks (created_at DESC);

-- 読み書きはサーバ(service_role)のAPIルート経由のみ。公開ポリシーは作らない。
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
