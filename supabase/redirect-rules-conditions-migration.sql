-- Migration: redirect_rules に condition_type「予約切替」「時間帯」を追加
-- File: supabase/redirect-rules-conditions-migration.sql
--
-- condition_value の形式:
--   scheduled_switch: {"switch_at": "ISO日時"}                  -- この日時以降そのURLへ恒久切替
--   time_of_day:      {"start_time": "HH:MM", "end_time": "HH:MM"} -- JST時刻。end<startで日跨ぎ

DO $$
DECLARE cname text;
BEGIN
  SELECT conname INTO cname
  FROM pg_constraint
  WHERE conrelid = 'redirect_rules'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%condition_type%';
  IF cname IS NOT NULL THEN
    EXECUTE 'ALTER TABLE redirect_rules DROP CONSTRAINT ' || quote_ident(cname);
  END IF;
END $$;

ALTER TABLE redirect_rules
  ADD CONSTRAINT redirect_rules_condition_type_check
  CHECK (condition_type IN ('default','schedule','device','ab_test','scheduled_switch','time_of_day'));
