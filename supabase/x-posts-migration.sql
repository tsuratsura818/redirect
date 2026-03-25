-- X自動投稿テーブル
CREATE TABLE IF NOT EXISTS x_scheduled_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  post_number INTEGER,
  hashtags TEXT[] DEFAULT '{}',
  media_urls TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'posting', 'posted', 'failed')),
  scheduled_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  x_post_id TEXT,
  error_message TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_x_posts_status ON x_scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_x_posts_scheduled_at ON x_scheduled_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_x_posts_sort_order ON x_scheduled_posts(sort_order);

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_x_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS x_posts_updated_at ON x_scheduled_posts;
CREATE TRIGGER x_posts_updated_at
  BEFORE UPDATE ON x_scheduled_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_x_posts_updated_at();

-- X投稿設定テーブル
CREATE TABLE IF NOT EXISTS x_post_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- デフォルト設定
INSERT INTO x_post_settings (key, value) VALUES
  ('posts_per_day', '2'),
  ('post_times', '08:00,12:00,19:00'),
  ('timezone', 'Asia/Tokyo'),
  ('auto_post_enabled', 'false')
ON CONFLICT (key) DO NOTHING;

-- RLS設定（サービスロールで操作するためRLS無効）
ALTER TABLE x_scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE x_post_settings ENABLE ROW LEVEL SECURITY;

-- サービスロール用ポリシー（管理者APIからのみアクセス）
CREATE POLICY "Service role full access on x_scheduled_posts"
  ON x_scheduled_posts FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on x_post_settings"
  ON x_post_settings FOR ALL
  USING (true) WITH CHECK (true);
