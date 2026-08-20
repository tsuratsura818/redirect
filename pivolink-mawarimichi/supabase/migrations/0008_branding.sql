-- ============================================================
-- 0008_branding.sql — 見た目と語り口をDBに出す
--
-- ★これが無いと「京都モデル専用アプリ」から出られない。
--   見出し・タグライン・ナビゲーターの名前と台詞・画像・朱印の文字が
--   コード(i18n.tsx)に直書きで、別の街や別のキャラクターで動かせなかった。
--   第三者に PivoLink とまわりみちを渡す前提では、ここも管理画面から変えられる必要がある。
--
-- ★どちらも空(null)なら、コード側の既定文言にフォールバックする。
--   既存キャンペーンは何もしなくてもこれまでどおり動く。
-- ============================================================

-- {"title": {"ja":"...","en":"..."}, "tagline": {...}, "seal": "巡"}
alter table campaigns add column if not exists hero jsonb;

-- {"name": {...}, "intro": {...}, "outro": {...}, "note": {...},
--  "face_url": "/navi/ruru-face.webp", "standing_url": "/navi/ruru-standing.webp"}
alter table campaigns add column if not exists navigator jsonb;

comment on column campaigns.hero      is 'スタート画面の見出し・タグライン・朱印の文字。null ならコード既定';
comment on column campaigns.navigator is 'ナビゲーターの名前・台詞・画像URL。null ならコード既定';
