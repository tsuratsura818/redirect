/**
 * Supabase 接続の確認。.env.local の値を読むだけで、値そのものは表示しない。
 *
 *   node scripts/check-supabase.mjs
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf-8").split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()])
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("❌ .env.local に NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY がありません");
  process.exit(1);
}
console.log("接続先 ref:", url.match(/https:\/\/([a-z0-9]+)\./)?.[1] ?? "(不明)");

const db = createClient(url, key, { auth: { persistSession: false } });
let ng = 0;
const check = (label, ok, detail = "") => {
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) ng++;
};

for (const t of ["campaigns", "goals", "spots", "routing_rules", "sessions", "scans", "coupons"]) {
  const { count, error } = await db.from(t).select("id", { count: "exact", head: true });
  check(`テーブル ${t}`, !error, error ? error.message.slice(0, 60) : `${count ?? 0}件`);
}

const { data: campaign } = await db.from("campaigns").select("slug,name,stamp_target").eq("slug", "kyoto-higashiyama").maybeSingle();
check("キャンペーン kyoto-higashiyama", Boolean(campaign), campaign ? `スタンプ${campaign.stamp_target}個` : "未投入");

const { count: spotCount } = await db.from("spots").select("id", { count: "exact", head: true });
check("スポット8件", spotCount === 8, `${spotCount ?? 0}件`);

const { count: goalCount } = await db.from("goals").select("id", { count: "exact", head: true });
check("目的地3件", goalCount === 3, `${goalCount ?? 0}件`);

const { data: img } = await db.from("spots").select("slug,image_url,map_url").limit(1).maybeSingle();
check("追加列 image_url / map_url", img !== null && "image_url" in img && "map_url" in img);

console.log(ng ? `\n❌ ${ng}件 未完了。ALL-IN-ONE.sql を SQL Editor で実行してください` : "\n✅ Supabase 準備完了");
process.exit(ng ? 1 : 0);
