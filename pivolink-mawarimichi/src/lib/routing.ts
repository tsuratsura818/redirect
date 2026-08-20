/**
 * 回廊ルーティングエンジン — このプロダクトの心臓部。
 *
 * 「目的地への回廊」の中だけで寄り道候補を二択に絞る純関数。副作用・I/O・DB参照は持たない。
 * 重みの補正値はすべて routing_rules(config JSONB) から来る。コードにマジックナンバーを置かない。
 *
 * アルゴリズム（CLAUDE.md §6）:
 *   1. 未訪問スポットを dist(候補→目的地) でスコア化
 *   2. dist(候補→目的地) < dist(現在地→目的地) + tolerance_m を回廊プールとする
 *   3. プールが2未満なら、目的地に近い順の上位3件をフォールバックプールとする
 *   4. 重み = (3 - congestion_level) × capacity_weight。ルールで乗算補正
 *   5. 重み付き非復元抽選で2件返す
 */

import { distM, type LatLng } from "./geo";
import { isClosingSoon, isOpenAt, type OpenHours } from "./hours";
import type { MealBand } from "./meal";
import { defaultRng, type Rng } from "./rng";
import type { RoutingRule, Spot } from "./types";

/** ルーティングに必要な最小限のスポット情報 */
export type RoutableSpot = Pick<
  Spot,
  "id" | "slug" | "lat" | "lng" | "capacity_weight" | "congestion_level"
> & { is_collab?: boolean; meal_times?: MealBand[] | null; open_hours?: OpenHours | null };

export interface PickChoicesInput {
  /** 現在地（スタート地点 or 直前のスポット） */
  from: LatLng;
  /** 参加者が選んだ最終目的地 */
  goal: LatLng;
  /** 候補になりうるスポット（active のみ渡すこと） */
  spots: RoutableSpot[];
  /** 訪問済みスポットID */
  visitedIds?: string[];
  /** 現在地のスポットID（未訪問扱いでも候補から外す） */
  currentSpotId?: string | null;
  /** 回廊の寄り道許容（m）。campaigns.detour_tolerance_m */
  toleranceM?: number;
  /** routing_rules。active のみ・priority 昇順で適用される */
  rules?: RoutingRule[];
  /** 時間帯ルールの評価に使う時刻（JSTの時） */
  hourJst?: number;
  /** 直前に訪れたスポットのslug（context ルール用） */
  previousSlug?: string | null;
  /**
   * PivoLink の time_of_day ルールが決めた「薦めてよい食事どき」。
   * ★渡されたらこちらが優先される（＝食べどきの判断は PivoLink が持っている）。
   *   渡されなければ hourJst から自前で判定する（PivoLink を経由しない直リンク用の退避）。
   */
  mealBandOverride?: MealBand[] | null;
  /**
   * 直近の時間窓におけるスポット別スキャン数（spot.id → 件数）。
   * congestion ルールの thresholds が「いまの混み具合」を判定するのに使う。
   * ★空（全部0）のときは全スポットに同じ倍率がかかるので、相対的な重みは変わらない。
   *   つまり参加者がいない状態では、この仕組みは何もしない。
   */
  recentScans?: Record<string, number>;
  /** 返す候補数。既定2 */
  count?: number;
  rng?: Rng;
}

export interface ScoredSpot {
  spot: RoutableSpot;
  /** 候補→目的地の距離(m) */
  distanceToGoalM: number;
  /** 現在地→候補の距離(m) */
  legM: number;
  /** 抽選重み（補正後） */
  weight: number;
}

export interface PickChoicesResult {
  choices: ScoredSpot[];
  /** 抽選対象になったプールの件数 */
  poolSize: number;
  /** 回廊プールが2未満でフォールバックした場合 true */
  fallback: boolean;
  /** 現在地→目的地の距離(m) */
  distanceNowM: number;
}

const DEFAULT_TOLERANCE_M = 220;
const FALLBACK_POOL_SIZE = 3;

/** 混雑度から出す基本重み。空いているスポットほど重い */
function baseWeight(spot: RoutableSpot): number {
  const w = (3 - spot.congestion_level) * spot.capacity_weight;
  return w > 0 ? w : 0;
}

/**
 * ルール適用。すべて「重みへの乗算」に正規化してあるので順序は結果を大きく変えないが、
 * 監査可能性のため priority 昇順で適用する。
 */
function applyRules(
  weight: number,
  spot: RoutableSpot,
  input: PickChoicesInput,
  rng: Rng,
): number {
  const rules = (input.rules ?? [])
    .filter((r) => r.active)
    .slice()
    .sort((a, b) => a.priority - b.priority);

  let w = weight;

  for (const rule of rules) {
    const cfg = rule.config ?? {};

    switch (rule.rule_type) {
      case "congestion": {
        // ① 管理画面で手で入れた混雑度に対する倍率
        //    { "multiplier_by_level": { "0": 1.5, "1": 1.0, "2": 0.5 } }
        const map = asNumberMap(cfg.multiplier_by_level);
        const m = map?.[String(spot.congestion_level)];
        if (typeof m === "number") w *= m;

        // ② スキャンログ密度による自動補正（人手を介さない本命）
        //    { "thresholds": [{ "from": 0, "multiplier": 1.2 }, ...], "per_capacity": true }
        const thresholds = Array.isArray(cfg.thresholds) ? cfg.thresholds : null;
        if (thresholds && input.recentScans) {
          const raw = input.recentScans[spot.id] ?? 0;
          // 受入余力が大きい場所は、同じ人数でも「混んでいない」とみなす
          const density =
            cfg.per_capacity === true && spot.capacity_weight > 0
              ? raw / spot.capacity_weight
              : raw;

          let mul: number | null = null;
          for (const t of thresholds) {
            if (!isRecord(t)) continue;
            const from = typeof t.from === "number" ? t.from : null;
            const multiplier = typeof t.multiplier === "number" ? t.multiplier : null;
            if (from === null || multiplier === null) continue;
            if (density >= from) mul = multiplier; // 昇順前提。最後に超えたものを採用
          }
          if (mul !== null) w *= mul;
        }
        break;
      }
      case "time": {
        const hour = input.hourJst;

        // ① 時間帯そのものに対する補正
        //    { "hours": [11,12,13,14], "multiplier_by_level": { "2": 0.4 }, "spot_multipliers": { "slug": 0.5 } }
        const hours = Array.isArray(cfg.hours) ? (cfg.hours as unknown[]).map(Number) : null;
        if (hours && typeof hour === "number" && hours.includes(hour)) {
          const byLevel = asNumberMap(cfg.multiplier_by_level);
          const lv = byLevel?.[String(spot.congestion_level)];
          if (typeof lv === "number") w *= lv;
          const bySlug = asNumberMap(cfg.spot_multipliers);
          const sm = bySlug?.[spot.slug];
          if (typeof sm === "number") w *= sm;
        }

        // ② 食べどき補正（飲食スポットのみ）
        //    { "meal_bands": { "lunch": [11,12,13,14], ... },
        //      "meal_in_band": 2.0, "meal_off_band": 0.25 }
        //    ★ meal_times を持たないスポット（寺社など）には一切かからない。
        //      飲食店だけが「その時間に食べどきか」で上下する。
        const bands = isRecord(cfg.meal_bands) ? cfg.meal_bands : null;
        const meals = spot.meal_times ?? [];
        const override = input.mealBandOverride;
        if (bands && meals.length) {
          let inBand: boolean | null = null;

          if (override && override.length) {
            // PivoLink が「いまは昼」と判断して着地させている。その判断に従う
            inBand = meals.some((band) => override.includes(band));
          } else if (typeof hour === "number") {
            inBand = meals.some((band) => {
              const hs = bands[band];
              return Array.isArray(hs) && (hs as unknown[]).map(Number).includes(hour);
            });
          }

          if (inBand !== null) {
            const mul = inBand ? cfg.meal_in_band : cfg.meal_off_band;
            if (typeof mul === "number") w *= mul;
          }
        }

        // ③ 開いている時間（拝観・営業）
        //    { "closed_multiplier": 0.05, "closing_soon_hours": 1, "closing_soon_multiplier": 0.4 }
        //    ★閉まっている場所へ送らないための制約。スポットを増やすほど
        //      「行ったら閉まっていた」事故が増えるので、分散より優先して効かせる。
        //    ★0 ではなく 0.05 なのは、回廊内の候補が2件を切ったときに
        //      フォールバックで結局出るため。「まず出ない」で十分。
        if (spot.open_hours && typeof hour === "number") {
          if (!isOpenAt(spot.open_hours, hour)) {
            const m = cfg.closed_multiplier;
            if (typeof m === "number") w *= m;
          } else {
            const buffer =
              typeof cfg.closing_soon_hours === "number" ? cfg.closing_soon_hours : 0;
            if (isClosingSoon(spot.open_hours, hour, buffer)) {
              const m = cfg.closing_soon_multiplier;
              if (typeof m === "number") w *= m;
            }
          }
        }
        break;
      }
      case "context": {
        // { "spot_multipliers": {...}, "when_previous": { "<prevSlug>": { "<slug>": 1.6 } } }
        const bySlug = asNumberMap(cfg.spot_multipliers);
        const sm = bySlug?.[spot.slug];
        if (typeof sm === "number") w *= sm;

        const whenPrev = cfg.when_previous;
        if (input.previousSlug && isRecord(whenPrev)) {
          const table = asNumberMap(whenPrev[input.previousSlug]);
          const pm = table?.[spot.slug];
          if (typeof pm === "number") w *= pm;
        }
        break;
      }
      case "random": {
        // { "jitter": 0.25 } — 同じ二択ばかり出ないよう重みを揺らす
        const jitter = typeof cfg.jitter === "number" ? cfg.jitter : 0;
        if (jitter > 0) w *= 1 + (rng() - 0.5) * 2 * jitter;
        break;
      }
    }
  }

  return w > 0 ? w : 0;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function asNumberMap(v: unknown): Record<string, number> | null {
  if (!isRecord(v)) return null;
  const out: Record<string, number> = {};
  for (const [k, val] of Object.entries(v)) {
    if (typeof val === "number") out[k] = val;
  }
  return out;
}

/** 重み付き非復元抽選 */
function weightedSampleWithoutReplacement(
  pool: ScoredSpot[],
  count: number,
  rng: Rng,
): ScoredSpot[] {
  const remaining = pool.slice();
  const picked: ScoredSpot[] = [];

  while (picked.length < count && remaining.length > 0) {
    const total = remaining.reduce((sum, s) => sum + s.weight, 0);
    let idx = 0;
    if (total <= 0) {
      // 全重み0（全スポットがルールで殺された）でも二択は必ず返す
      idx = Math.floor(rng() * remaining.length);
      if (idx >= remaining.length) idx = remaining.length - 1;
    } else {
      let r = rng() * total;
      for (let i = 0; i < remaining.length; i++) {
        r -= remaining[i].weight;
        if (r <= 0) {
          idx = i;
          break;
        }
        idx = i;
      }
    }
    picked.push(remaining[idx]);
    remaining.splice(idx, 1);
  }

  return picked;
}

/**
 * 目的地への回廊内から次の寄り道候補を抽選する。
 * 候補が足りない場合でも、返せるだけ返す（呼び出し側で 0/1 件を判定できるようにする）。
 */
export function pickChoices(input: PickChoicesInput): PickChoicesResult {
  const rng = input.rng ?? defaultRng;
  const count = input.count ?? 2;
  const tolerance = input.toleranceM ?? DEFAULT_TOLERANCE_M;
  const visited = new Set(input.visitedIds ?? []);
  if (input.currentSpotId) visited.add(input.currentSpotId);

  const distanceNowM = distM(input.from, input.goal);

  const scored: ScoredSpot[] = input.spots
    .filter((s) => !visited.has(s.id))
    .map((spot) => ({
      spot,
      distanceToGoalM: distM(spot, input.goal),
      legM: distM(input.from, spot),
      weight: 0,
    }));

  // 回廊: 目的地への距離が「現在地 + 寄り道許容」を超えないもの
  let pool = scored.filter((s) => s.distanceToGoalM < distanceNowM + tolerance);
  let fallback = false;

  if (pool.length < count) {
    fallback = true;
    pool = scored
      .slice()
      .sort((a, b) => a.distanceToGoalM - b.distanceToGoalM)
      .slice(0, Math.max(FALLBACK_POOL_SIZE, count));
  }

  for (const s of pool) {
    s.weight = applyRules(baseWeight(s.spot), s.spot, input, rng);
  }

  return {
    choices: weightedSampleWithoutReplacement(pool, count, rng),
    poolSize: pool.length,
    fallback,
    distanceNowM,
  };
}
