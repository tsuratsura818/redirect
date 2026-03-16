-- QR Redirect Manager - Database Schema
-- Run this in Supabase SQL Editor

-- QRコード管理テーブル
CREATE TABLE qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  default_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  fallback_url TEXT,
  scan_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_qr_codes_slug ON qr_codes(slug);
CREATE INDEX idx_qr_codes_user_id ON qr_codes(user_id);

-- リダイレクトルールテーブル
CREATE TABLE redirect_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  destination_url TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  condition_type VARCHAR(20) NOT NULL DEFAULT 'default'
    CHECK (condition_type IN ('default', 'schedule', 'device', 'ab_test')),
  -- schedule: {"start_at": "ISO", "end_at": "ISO"}
  -- device: {"device": "ios" | "android" | "desktop"}
  -- ab_test: {"weight": 50}
  condition_value JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_redirect_rules_qr_code_id ON redirect_rules(qr_code_id);

-- スキャンログテーブル
CREATE TABLE scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  redirect_rule_id UUID REFERENCES redirect_rules(id) ON DELETE SET NULL,
  destination_url TEXT NOT NULL,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_hash VARCHAR(64),
  user_agent TEXT,
  device_type VARCHAR(20),
  os VARCHAR(50),
  browser VARCHAR(50),
  country VARCHAR(100),
  city VARCHAR(100),
  referer TEXT
);

CREATE INDEX idx_scan_logs_qr_code_id ON scan_logs(qr_code_id);
CREATE INDEX idx_scan_logs_scanned_at ON scan_logs(scanned_at);

-- 変更履歴テーブル
CREATE TABLE redirect_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  changes JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_redirect_history_qr_code_id ON redirect_history(qr_code_id);

-- クッションページテーブル
CREATE TABLE cushion_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE UNIQUE,
  title VARCHAR(200) NOT NULL DEFAULT 'リダイレクト中...',
  message TEXT,
  button_text VARCHAR(100) DEFAULT '続ける',
  background_color VARCHAR(7) DEFAULT '#ffffff',
  text_color VARCHAR(7) DEFAULT '#000000',
  accent_color VARCHAR(7) DEFAULT '#3b82f6',
  logo_url TEXT,
  display_seconds INTEGER NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- scan_count を自動更新するトリガー
CREATE OR REPLACE FUNCTION increment_scan_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE qr_codes SET scan_count = scan_count + 1 WHERE id = NEW.qr_code_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_scan_count
  AFTER INSERT ON scan_logs
  FOR EACH ROW
  EXECUTE FUNCTION increment_scan_count();

-- updated_at を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_qr_codes_updated_at
  BEFORE UPDATE ON qr_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_redirect_rules_updated_at
  BEFORE UPDATE ON redirect_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_cushion_pages_updated_at
  BEFORE UPDATE ON cushion_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS (Row Level Security)
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE redirect_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE redirect_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE cushion_pages ENABLE ROW LEVEL SECURITY;

-- QRコードの読み取りは誰でも可（リダイレクト用）
CREATE POLICY "qr_codes_public_read" ON qr_codes
  FOR SELECT USING (true);

CREATE POLICY "qr_codes_owner_all" ON qr_codes
  FOR ALL USING (auth.uid() = user_id);

-- リダイレクトルールの読み取りは誰でも可
CREATE POLICY "redirect_rules_public_read" ON redirect_rules
  FOR SELECT USING (true);

CREATE POLICY "redirect_rules_owner_all" ON redirect_rules
  FOR ALL USING (
    qr_code_id IN (SELECT id FROM qr_codes WHERE user_id = auth.uid())
  );

-- スキャンログは誰でも挿入可、オーナーのみ読み取り
CREATE POLICY "scan_logs_public_insert" ON scan_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "scan_logs_owner_read" ON scan_logs
  FOR SELECT USING (
    qr_code_id IN (SELECT id FROM qr_codes WHERE user_id = auth.uid())
  );

-- 変更履歴はオーナーのみ
CREATE POLICY "redirect_history_owner_all" ON redirect_history
  FOR ALL USING (
    qr_code_id IN (SELECT id FROM qr_codes WHERE user_id = auth.uid())
  );

-- クッションページは読み取り公開、変更はオーナーのみ
CREATE POLICY "cushion_pages_public_read" ON cushion_pages
  FOR SELECT USING (true);

CREATE POLICY "cushion_pages_owner_all" ON cushion_pages
  FOR ALL USING (
    qr_code_id IN (SELECT id FROM qr_codes WHERE user_id = auth.uid())
  );
