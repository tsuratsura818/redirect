/**
 * 回廊ルーティングのシミュレータ。
 * ルール設定を変えたときに「分散」と「ルートの多様性」がどう動くかを実測するための道具。
 *
 *   npm run sim
 *   npm run sim -- --hour 13 --runs 1000 --seeds 5
 */

import { seedCampaign, seedGoals, seedRules, seedSpots } from "../src/data/seed";
import { distM } from "../src/lib/geo";
import { seededRng } from "../src/lib/rng";
import { pickChoices, type RoutableSpot } from "../src/lib/routing";
import type { RoutingRule } from "../src/lib/types";

const args = process.argv.slice(2);
const argOf = (name: string, def: number) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? Number(args[i + 1]) : def;
};

const RUNS = argOf("runs", 1000);
const SEEDS = argOf("seeds", 5);
const HOUR = argOf("hour", 13);

const SPOTS: RoutableSpot[] = seedSpots.map((s) => ({
  id: s.id,
  slug: s.slug,
  lat: s.lat,
  lng: s.lng,
  capacity_weight: s.capacity_weight,
  congestion_level: s.congestion_level,
  meal_times: s.meal_times ?? [],
  open_hours: s.open_hours ?? null,
}));
const START = { lat: seedCampaign.start_lat, lng: seedCampaign.start_lng };

function simulate(goal: { lat: number; lng: number }, rules: RoutingRule[], seed: number) {
  const rng = seededRng(seed);
  const routes = new Set<string>();
  const rates: number[] = [];
  const visits = new Map<string, number>();
  let broken = 0;

  for (let i = 0; i < RUNS; i++) {
    let from = START;
    let currentSpotId: string | null = null;
    let previousSlug: string | null = null;
    const visited: string[] = [];
    const route: string[] = [];
    let walked = 0;

    for (let step = 0; step < seedCampaign.stamp_target; step++) {
      const res = pickChoices({
        from,
        goal,
        spots: SPOTS,
        visitedIds: visited,
        currentSpotId,
        toleranceM: seedCampaign.detour_tolerance_m,
        rules,
        hourJst: HOUR,
        previousSlug,
        rng,
      });
      if (res.choices.length !== 2) broken++;
      if (res.choices.length === 0) break;

      const taken = res.choices[Math.floor(rng() * res.choices.length)];
      walked += taken.legM;
      visited.push(taken.spot.id);
      route.push(taken.spot.slug);
      visits.set(taken.spot.slug, (visits.get(taken.spot.slug) ?? 0) + 1);
      previousSlug = taken.spot.slug;
      currentSpotId = taken.spot.id;
      from = { lat: taken.spot.lat, lng: taken.spot.lng };
    }

    walked += distM(from, goal);
    routes.add(route.join(">"));
    rates.push((walked / distM(START, goal)) * 100);
  }

  rates.sort((a, b) => a - b);
  return {
    unique: routes.size,
    broken,
    median: Math.round(rates[Math.floor(rates.length / 2)]),
    visits,
  };
}

console.log(`runs=${RUNS} seeds=${SEEDS} hour=${HOUR}\n`);

/** --norules で「ルール無し（基本重みのみ）」の上限値を見る。--jitter / --peak で設定を試す */
const jitterOverride = args.includes("--jitter") ? argOf("jitter", 0) : null;
const peakOverride = args.includes("--peak") ? argOf("peak", 0) : null;
const RULES = args.includes("--norules")
  ? []
  : seedRules.map((r) => {
      if (r.rule_type === "random" && jitterOverride !== null)
        return { ...r, config: { ...r.config, jitter: jitterOverride } };
      if (r.rule_type === "time" && peakOverride !== null)
        return { ...r, config: { ...r.config, multiplier_by_level: { "2": peakOverride } } };
      return r;
    });
if (RULES.length === 0) console.log("(routing_rules 無効: 基本重みのみ)\n");

/**
 * --meals: 時間帯を1時間ずつ動かして、飲食スポットが二択にどれだけ出るかを見る。
 * 「朝に居酒屋が出ていないか」「昼に食堂が出ているか」を数字で確認するためのモード。
 */
if (args.includes("--meals")) {
  const FOOD = seedSpots.filter((s) => s.meal_times?.length || s.open_hours);
  const goal = seedGoals[0];
  console.log(`飲食スポットの提示シェア（${goal.name.ja} 行き・時刻別）
`);
  console.log(
    "時刻  " + FOOD.map((f) => `${f.slug.slice(0, 10).padStart(10)}`).join(" ") + "   飲食計",
  );
  for (let h = 7; h <= 21; h++) {
    const hourRules = RULES;
    const rng = seededRng(4242);
    const shown = new Map<string, number>();
    let total = 0;
    for (let i = 0; i < 800; i++) {
      let from = START;
      let currentSpotId: string | null = null;
      const visited: string[] = [];
      for (let step = 0; step < seedCampaign.stamp_target; step++) {
        const res = pickChoices({
          from, goal: { lat: goal.lat, lng: goal.lng }, spots: SPOTS,
          visitedIds: visited, currentSpotId,
          toleranceM: seedCampaign.detour_tolerance_m,
          rules: hourRules, hourJst: h, rng,
        });
        if (!res.choices.length) break;
        for (const c of res.choices) {
          shown.set(c.spot.slug, (shown.get(c.spot.slug) ?? 0) + 1);
          total++;
        }
        const taken = res.choices[Math.floor(rng() * res.choices.length)];
        visited.push(taken.spot.id);
        currentSpotId = taken.spot.id;
        from = { lat: taken.spot.lat, lng: taken.spot.lng };
      }
    }
    const cells = FOOD.map((f) => {
      const pct = ((shown.get(f.slug) ?? 0) / total) * 100;
      return `${pct.toFixed(1).padStart(9)}%`;
    });
    const foodTotal = FOOD.reduce((a, f) => a + (shown.get(f.slug) ?? 0), 0);
    console.log(
      `${String(h).padStart(2)}時  ${cells.join(" ")}   ${((foodTotal / total) * 100).toFixed(1)}%`,
    );
  }
  console.log("");
  process.exit(0);
}

for (const goal of seedGoals) {
  const results = Array.from({ length: SEEDS }, (_, i) => simulate(goal, RULES, 1000 + i * 7919));
  const uniques = results.map((r) => r.unique);
  const brokens = results.reduce((a, r) => a + r.broken, 0);
  const medians = results.map((r) => r.median);

  console.log(
    `${(goal.name.ja ?? goal.slug).padEnd(6)} ` +
      `unique=${Math.min(...uniques)}〜${Math.max(...uniques)}  ` +
      `broken=${brokens}  ` +
      `detour=${Math.min(...medians)}〜${Math.max(...medians)}%`,
  );

  // 分散の偏り（1スポットに集中していないか）
  const total = Array.from(results[0].visits.values()).reduce((a, b) => a + b, 0);
  const share = Array.from(results[0].visits.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([slug, n]) => `${slug}:${((n / total) * 100).toFixed(1)}%`)
    .join("  ");
  console.log(`       ${share}\n`);
}
