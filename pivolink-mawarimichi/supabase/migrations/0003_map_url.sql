-- ============================================================
-- 0003_map_url.sql — スポットごとの外部デジタルマップURL
--
-- 区間ナビの遷移先を、スポット単位で MapPenguin 等に差し替えるための列。
-- ★ここに入れてよいのは「その1地点だけを開くURL」。
--   全スポットが載った回遊マップを入れると、次の行き先が一覧で見えてしまい、
--   回廊ルーティング＝分散の仕組みが無効になる（CLAUDE.md §9-1）。
-- ============================================================

alter table spots add column if not exists map_url text;

-- https 以外を弾く（QRの遷移先を任意スキームにされないように）
do $$ begin
  alter table spots add constraint spots_map_url_https
    check (map_url is null or map_url like 'https://%');
exception when duplicate_object then null; end $$;
