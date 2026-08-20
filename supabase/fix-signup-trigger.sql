-- Fix: "Database error saving new user" on signup
--
-- 原因仮説（最有力）:
--   handle_new_user() が SECURITY DEFINER で実行されるが search_path 未設定のため、
--   public.user_profiles / public.user_subscriptions の解決に失敗してトリガーが死ぬ。
--   トリガーが死ぬと auth.users の INSERT 全体がロールバックされ、
--   GoTrue は generic な "Database error saving new user" を返す。
--
-- 修正:
--   1) search_path を明示
--   2) 各 INSERT を個別の BEGIN/EXCEPTION で囲み、副次テーブルの失敗で signup 全体を止めない
--   3) ON CONFLICT DO NOTHING で再実行に対して冪等に
--
-- 適用: Supabase ダッシュボード > SQL Editor に丸ごと貼って Run

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  BEGIN
    INSERT INTO public.user_profiles (id, display_name)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: user_profiles insert failed: %', SQLERRM;
  END;

  BEGIN
    INSERT INTO public.user_subscriptions (user_id, plan)
    VALUES (NEW.id, 'free')
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: user_subscriptions insert failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- トリガー再作成（OR REPLACE 不可なので DROP→CREATE）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 動作確認用: 実行後に↓を別途流してエラーが出なければOK
-- DO $$
-- DECLARE
--   v_id uuid := gen_random_uuid();
-- BEGIN
--   INSERT INTO public.user_profiles (id, display_name) VALUES (v_id, 'test');
--   INSERT INTO public.user_subscriptions (user_id, plan) VALUES (v_id, 'free');
--   DELETE FROM public.user_subscriptions WHERE user_id = v_id;
--   DELETE FROM public.user_profiles WHERE id = v_id;
--   RAISE NOTICE 'OK';
-- END$$;
