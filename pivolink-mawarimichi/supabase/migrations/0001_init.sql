-- ============================================================
-- Pivolink まわりみち 0001_init.sql（冪等・RLS込み）
-- Supabase SQL Editor で実行。再実行しても壊れない構成
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- ENUM ----------
do $$ begin
  create type rule_type as enum ('random','time','congestion','context');
exception when duplicate_object then null; end $$;

do $$ begin
  create type campaign_status as enum ('draft','active','paused','ended');
exception when duplicate_object then null; end $$;

-- ---------- updated_at trigger ----------
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

-- ---------- campaigns ----------
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,                      -- 'kyoto-higashiyama'
  name jsonb not null,                            -- {"ja":"まわりみち 京都・東山","en":...}
  status campaign_status not null default 'draft',
  start_qr_token text unique not null default encode(gen_random_bytes(16),'hex'),
  start_lat double precision not null,
  start_lng double precision not null,
  stamp_target int not null default 5,
  detour_tolerance_m int not null default 220,    -- 回廊の寄り道許容
  languages text[] not null default '{ja,en}',
  cm_frequency_cap int not null default 3,        -- Nスポットに1回までCM表示
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_campaigns_updated on campaigns;
create trigger trg_campaigns_updated before update on campaigns
  for each row execute function set_updated_at();

-- ---------- goals（最終目的地の選択肢）----------
create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  slug text not null,
  name jsonb not null,
  subtitle jsonb,
  lat double precision not null,
  lng double precision not null,
  icon_char text,                                 -- スタンプ/カード表示用の一文字
  sort_order int not null default 0,
  active boolean not null default true,
  unique (campaign_id, slug)
);

-- ---------- spots（寄り道スポット）----------
create table if not exists spots (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  slug text not null,
  qr_token text unique not null default encode(gen_random_bytes(16),'hex'),
  name jsonb not null,
  area jsonb,
  story jsonb,                                    -- 多言語本文
  navi_lines jsonb,                               -- ナビキャラ台詞（キャラ差し替え前提でキー分離可）
  lat double precision not null,
  lng double precision not null,
  walk_min int,
  kanji text,                                     -- スタンプ用一文字
  capacity_weight numeric not null default 1.0,   -- 受入キャパ重み
  congestion_level int not null default 1,        -- 0=空き◎ 1=空き○ 2=混雑
  is_collab boolean not null default false,
  coupon jsonb,                                   -- コラボ特典表記
  rare_config jsonb,                              -- {"prob":0.2,"time_window":[6,10],"label":{...}}
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, slug)
);
drop trigger if exists trg_spots_updated on spots;
create trigger trg_spots_updated before update on spots
  for each row execute function set_updated_at();
create index if not exists idx_spots_campaign on spots(campaign_id) where active;

-- ---------- routing_rules ----------
create table if not exists routing_rules (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  rule_type rule_type not null,
  config jsonb not null default '{}',             -- 例 time: {"peak_hours":[11,15],"famous_penalty":0.5}
  priority int not null default 0,
  active boolean not null default true
);

-- ---------- sessions（匿名・PIIゼロ）----------
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  goal_id uuid references goals(id),
  lang text not null default 'ja',
  walked_m numeric not null default 0,
  direct_m numeric,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_sessions_campaign on sessions(campaign_id, created_at);

-- ---------- scans（スタンプ = 二重押印はDB層で防止）----------
create table if not exists scans (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  spot_id uuid not null references spots(id) on delete cascade,
  scanned_at timestamptz not null default now(),
  is_rare boolean not null default false,
  choice_shown jsonb,                             -- 提示した二択（spot slug配列）→ 提示無視率の計測
  nav_clicked boolean not null default false,
  unique (session_id, spot_id)                    -- ★二重押印防止
);
create index if not exists idx_scans_spot_time on scans(spot_id, scanned_at);

-- ---------- coupons ----------
create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  code text unique not null,
  issued_at timestamptz not null default now(),
  used_at timestamptz,
  used_shop text
);

-- ---------- sponsors / CM ----------
create table if not exists sponsors (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  name text not null,
  active boolean not null default true
);

create table if not exists cm_assets (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid not null references sponsors(id) on delete cascade,
  video_url text not null,
  duration_sec int not null default 15,
  target_spot_ids uuid[],                         -- null = 全スポット
  active boolean not null default true
);

create table if not exists cm_impressions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  cm_asset_id uuid not null references cm_assets(id) on delete cascade,
  spot_id uuid references spots(id),
  shown_at timestamptz not null default now(),
  completed boolean not null default false,       -- 完視聴
  skipped_at_sec int
);

-- ============================================================
-- RLS: 参加者からの直接アクセスは読み取り最小限。
-- 書き込みは service_role（Route Handler経由）のみを原則とする
-- ============================================================
alter table campaigns      enable row level security;
alter table goals          enable row level security;
alter table spots          enable row level security;
alter table routing_rules  enable row level security;
alter table sessions       enable row level security;
alter table scans          enable row level security;
alter table coupons        enable row level security;
alter table sponsors       enable row level security;
alter table cm_assets      enable row level security;
alter table cm_impressions enable row level security;

-- 公開読み取り: アクティブなキャンペーン・スポット・目的地のみ
drop policy if exists "public read active campaigns" on campaigns;
create policy "public read active campaigns" on campaigns
  for select using (status = 'active');

drop policy if exists "public read active spots" on spots;
create policy "public read active spots" on spots
  for select using (active);

drop policy if exists "public read active goals" on goals;
create policy "public read active goals" on goals
  for select using (active);

-- sessions/scans/coupons/cm系・routing_rules・sponsors は anon ポリシーなし
-- = service_role（サーバー側）経由のみ。クライアント直INSERTを許可しない
