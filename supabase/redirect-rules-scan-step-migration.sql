-- Migration: redirect_rules に condition_type「ステップアップ（読み込み回数）」を追加
-- File: supabase/redirect-rules-scan-step-migration.sql
--
-- condition_value: {"visit": N}  -- N回目の読み込みで適用。回数はCookieで端末ごとに判定

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
  CHECK (condition_type IN ('default','schedule','device','ab_test','scheduled_switch','time_of_day','scan_step'));
