-- ============================================================
-- 0007_campaign_period.sql — 実証実験の開催期間
--
-- ★ここは「まわりみち側の記録」で、実際の切り替えは PivoLink の
--   schedule / scheduled_switch ルールが行う。
--   管理画面で期間を保存すると、PivoLink 側のルールも作り直される。
--   同じ日付を2箇所に手で入れさせないための持ち方。
-- ============================================================

alter table campaigns add column if not exists starts_at timestamptz;
alter table campaigns add column if not exists ends_at   timestamptz;

do $$ begin
  alter table campaigns add constraint campaigns_period_order
    check (starts_at is null or ends_at is null or ends_at > starts_at);
exception when duplicate_object then null; end $$;
