-- ============================================================
-- 0006_open_hours.sql — 拝観・営業時間
--
-- 「食べどき」(0005) が“向いている時間”なら、こちらは“開いている時間”。
-- 分散のためにルートを散らすほど「行ったら閉まっていた」事故は増える。
-- 閉館先へ送るくらいなら最短ルートのほうがマシなので、分散より優先して効かせる
-- （routing_rules の priority 10 = 最優先）。
--
-- 形式: {"from": 9, "to": 17}  — JSTの「時」。to ちょうどには閉まっている扱い。
--       null = 終日開いている（屋外の社・通り・商店街など）
-- ★日をまたぐ営業は Phase 1 では扱わない（実証実験は7〜22時に収まる）。
-- ============================================================

alter table spots add column if not exists open_hours jsonb;
alter table goals add column if not exists open_hours jsonb;

-- from/to が欠けた形・逆転した形を弾く（無言で「常に閉まっている」扱いになるのを防ぐ）
do $$ begin
  alter table spots add constraint spots_open_hours_shape check (
    open_hours is null or (
      jsonb_typeof(open_hours->'from') = 'number' and
      jsonb_typeof(open_hours->'to')   = 'number' and
      (open_hours->>'from')::numeric >= 0  and (open_hours->>'from')::numeric <= 23 and
      (open_hours->>'to')::numeric   >= 1  and (open_hours->>'to')::numeric   <= 24 and
      (open_hours->>'to')::numeric > (open_hours->>'from')::numeric
    )
  );
exception when duplicate_object then null; end $$;

do $$ begin
  alter table goals add constraint goals_open_hours_shape check (
    open_hours is null or (
      jsonb_typeof(open_hours->'from') = 'number' and
      jsonb_typeof(open_hours->'to')   = 'number' and
      (open_hours->>'to')::numeric > (open_hours->>'from')::numeric
    )
  );
exception when duplicate_object then null; end $$;
