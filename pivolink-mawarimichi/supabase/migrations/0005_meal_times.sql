-- ============================================================
-- 0005_meal_times.sql — 飲食スポットの「食べどき」
--
-- 寺社と違って、飲食店には開いている時間がある。
-- 朝10時に居酒屋を提示しても意味がなく、12時に食堂が出せないと
-- まわりみちが昼食の邪魔になる。そこでスポットに帯（morning/lunch/snack/dinner）を持たせる。
--
-- ★時刻→帯の対応（何時をランチとみなすか）はここには置かない。
--   routing_rules の time ルール config.meal_bands が正。
--   店舗事情で変わる値をコードにもスキーマにも埋めないため。
-- ★空配列 = 飲食スポットではない。寺社・記念館は空のまま。
-- ============================================================

alter table spots add column if not exists meal_times text[] not null default '{}';

-- 知らない帯が入ると重みの計算に出てこないだけで無言に効かなくなるので、DB側で弾く
do $$ begin
  alter table spots add constraint spots_meal_times_known
    check (meal_times <@ array['morning','lunch','snack','dinner']::text[]);
exception when duplicate_object then null; end $$;
