/**
 * src/data/seed.ts から Supabase 投入用の SQL を生成する。
 * シードの正は TypeScript 側1箇所だけにして、SQLとの二重管理を避ける。
 *
 *   npm run gen:seed
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { seedCampaign, seedGoals, seedRules, seedSpots } from "../src/data/seed";

const q = (v: unknown): string => {
  if (v === null || v === undefined) return "null";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return String(v);
  if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  return `'${String(v).replace(/'/g, "''")}'`;
};

const textArray = (values: readonly string[] | undefined | null): string =>
  values ? `'{${values.map((v) => `"${v}"`).join(",")}}'::text[]` : "null";

const lines: string[] = [
  "-- ============================================================",
  "-- Pivolink まわりみち 0002_seed_kyoto.sql",
  "-- ★このファイルは scripts/gen-seed-sql.ts の生成物です。直接編集しないこと。",
  "--   シードの正は src/data/seed.ts。変更したら `npm run gen:seed` で再生成する。",
  "--",
  "-- ★実在スポット名・d食堂のコラボ特典は許諾未取得の仮データ。",
  "--   対外公開・本番投入の前に許諾取得 or 差し替えを行うこと。",
  "-- ★qr_token は開発用の固定値（dev-*）。本番の看板用トークンは",
  "--   DB既定値（128bit乱数）で発行し直してから印刷入稿すること。",
  "-- ============================================================",
  "",
  "-- 表示用メタ列の追加（0001_init.sql には無い列。冪等）",
  "alter table spots     add column if not exists map_url text;",
  "alter table spots     add column if not exists image_url text;",
  "alter table campaigns add column if not exists start_label jsonb;",
  "alter table goals     add column if not exists grad text[];",
  "alter table spots     add column if not exists grad text[];",
  "alter table spots     add column if not exists meal_times text[] not null default '{}';",
  "alter table spots     add column if not exists open_hours jsonb;",
  "alter table goals     add column if not exists open_hours jsonb;",
  "",
];

lines.push("-- ---------- campaign ----------");
lines.push(`insert into campaigns (
  id, slug, name, status, start_qr_token, start_lat, start_lng, start_label,
  stamp_target, detour_tolerance_m, languages, cm_frequency_cap
) values (
  ${q(seedCampaign.id)}, ${q(seedCampaign.slug)}, ${q(seedCampaign.name)}, ${q(seedCampaign.status)}::campaign_status,
  ${q(seedCampaign.start_qr_token)}, ${seedCampaign.start_lat}, ${seedCampaign.start_lng}, ${q(seedCampaign.start_label)},
  ${seedCampaign.stamp_target}, ${seedCampaign.detour_tolerance_m}, ${textArray(seedCampaign.languages)}, ${seedCampaign.cm_frequency_cap}
)
on conflict (slug) do update set
  name = excluded.name, status = excluded.status,
  start_lat = excluded.start_lat, start_lng = excluded.start_lng, start_label = excluded.start_label,
  stamp_target = excluded.stamp_target, detour_tolerance_m = excluded.detour_tolerance_m,
  languages = excluded.languages, cm_frequency_cap = excluded.cm_frequency_cap;
`);

lines.push("-- ---------- goals ----------");
for (const g of seedGoals) {
  lines.push(`insert into goals (id, campaign_id, slug, name, subtitle, lat, lng, icon_char, open_hours, grad, sort_order, active)
values (${q(g.id)}, ${q(g.campaign_id)}, ${q(g.slug)}, ${q(g.name)}, ${q(g.subtitle)}, ${g.lat}, ${g.lng}, ${q(g.icon_char)}, ${q(g.open_hours)}, ${textArray(g.grad)}, ${g.sort_order}, ${g.active})
on conflict (campaign_id, slug) do update set
  name = excluded.name, subtitle = excluded.subtitle, lat = excluded.lat, lng = excluded.lng,
  icon_char = excluded.icon_char, open_hours = excluded.open_hours,
  grad = excluded.grad, sort_order = excluded.sort_order, active = excluded.active;
`);
}

lines.push("-- ---------- spots ----------");
for (const s of seedSpots) {
  lines.push(`insert into spots (
  id, campaign_id, slug, qr_token, name, area, story, navi_lines, lat, lng, walk_min, kanji, grad,
  capacity_weight, congestion_level, is_collab, meal_times, open_hours, coupon, rare_config, image_url, active
) values (
  ${q(s.id)}, ${q(s.campaign_id)}, ${q(s.slug)}, ${q(s.qr_token)}, ${q(s.name)}, ${q(s.area)}, ${q(s.story)}, ${q(s.navi_lines)},
  ${s.lat}, ${s.lng}, ${s.walk_min ?? "null"}, ${q(s.kanji)}, ${textArray(s.grad)},
  ${s.capacity_weight}, ${s.congestion_level}, ${s.is_collab}, ${textArray(s.meal_times ?? []) ?? "'{}'::text[]"}, ${q(s.open_hours)}, ${q(s.coupon)}, ${q(s.rare_config)}, ${q(s.image_url)}, ${s.active}
)
on conflict (campaign_id, slug) do update set
  name = excluded.name, area = excluded.area, story = excluded.story, navi_lines = excluded.navi_lines,
  lat = excluded.lat, lng = excluded.lng, walk_min = excluded.walk_min, kanji = excluded.kanji, grad = excluded.grad,
  capacity_weight = excluded.capacity_weight, congestion_level = excluded.congestion_level,
  is_collab = excluded.is_collab, meal_times = excluded.meal_times, open_hours = excluded.open_hours,
  coupon = excluded.coupon, rare_config = excluded.rare_config,
  image_url = excluded.image_url, active = excluded.active;
`);
}

lines.push("-- ---------- routing_rules ----------");
lines.push("delete from routing_rules where campaign_id = " + q(seedCampaign.id) + ";");
for (const r of seedRules) {
  lines.push(`insert into routing_rules (id, campaign_id, rule_type, config, priority, active)
values (${q(r.id)}, ${q(r.campaign_id)}, ${q(r.rule_type)}::rule_type, ${q(r.config)}, ${r.priority}, ${r.active});
`);
}

const out = resolve(process.cwd(), "supabase/migrations/0002_seed_kyoto.sql");
writeFileSync(out, lines.join("\n"), "utf-8");
console.log(`wrote ${out}`);
