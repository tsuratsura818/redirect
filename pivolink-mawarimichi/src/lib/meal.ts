/**
 * 「食べどき」の帯（ミールバンド）。
 *
 * 飲食店は寺社と違って“開いている時間”がある。朝10時に居酒屋を提示しても意味がないし、
 * 12時に食堂を出せる状態にしておかないと、まわりみちが昼食の邪魔になる。
 * そこでスポットに「どの食事どきに向いているか」を持たせ、時間帯ルールで重みを動かす。
 *
 * ★時刻→帯の対応（何時をランチとみなすか）は routing_rules(config) 側に置く。
 *   ここの DEFAULT_MEAL_BANDS は「ルールが無いときのUI表示用」のフォールバックであって、
 *   ルーティングの判断には使わない（エンジンにマジックナンバーを置かないため）。
 */

import type { Lang, RoutingRule, Spot } from "./types";

export type MealBand = "morning" | "lunch" | "snack" | "dinner";

export const MEAL_BANDS: MealBand[] = ["morning", "lunch", "snack", "dinner"];

/** 帯 → その帯とみなす「時」の配列 */
export type MealBandHours = Partial<Record<MealBand, number[]>>;

/** ルールが取れないときの表示用フォールバック。seed.ts の meal ルールと同じ値にしておく */
export const DEFAULT_MEAL_BANDS: MealBandHours = {
  morning: [7, 8, 9, 10],
  lunch: [11, 12, 13, 14],
  snack: [14, 15, 16, 17],
  dinner: [17, 18, 19, 20, 21],
};

const LABELS: Record<MealBand, Record<"ja" | "en", string>> = {
  morning: { ja: "朝ごはん", en: "Breakfast" },
  lunch: { ja: "ランチ", en: "Lunch" },
  snack: { ja: "おやつ", en: "Snack" },
  dinner: { ja: "夕ごはん", en: "Dinner" },
};

export function mealLabel(band: MealBand, lang: Lang): string {
  return LABELS[band][lang === "en" ? "en" : "ja"];
}

/** 「ランチにおすすめ」のような、スポットの性格を表す一言（時刻に関係なく出せる） */
export function mealSummary(bands: MealBand[] | null | undefined, lang: Lang): string {
  if (!bands?.length) return "";
  const names = bands.map((b) => mealLabel(b, lang));
  return lang === "en"
    ? `Good for ${names.join(" / ").toLowerCase()}`
    : `${names.join("・")}におすすめ`;
}

/** 「いま、ランチどき」— 現在時刻が帯に入っているときだけ出すバッジ文言 */
export function mealNowLabel(
  bands: MealBand[] | null | undefined,
  hour: number,
  hours: MealBandHours,
  lang: Lang,
): string {
  const active = activeMeals(bands, hour, hours);
  if (!active.length) return "";
  const name = mealLabel(active[0], lang);
  return lang === "en" ? `${name} time — now` : `いま、${name}どき`;
}

/** スポットが持つ帯のうち、いま該当しているものを返す */
export function activeMeals(
  bands: MealBand[] | null | undefined,
  hour: number,
  hours: MealBandHours,
): MealBand[] {
  if (!bands?.length) return [];
  return bands.filter((b) => (hours[b] ?? []).includes(hour));
}

/**
 * routing_rules から時刻→帯の対応を取り出す。
 * meal_bands を持つ time ルールが正。無ければ表示用フォールバックを返す。
 */
export function mealBandsFromRules(rules: RoutingRule[] | undefined): MealBandHours {
  for (const rule of rules ?? []) {
    if (!rule.active || rule.rule_type !== "time") continue;
    const raw = rule.config?.meal_bands;
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) continue;

    const out: MealBandHours = {};
    for (const band of MEAL_BANDS) {
      const hours = (raw as Record<string, unknown>)[band];
      if (Array.isArray(hours)) out[band] = hours.map(Number).filter(Number.isFinite);
    }
    if (Object.keys(out).length) return out;
  }
  return DEFAULT_MEAL_BANDS;
}

/** 未知の値を捨てて MealBand[] に正規化する（DB・フォームからの入力用） */
export function normalizeMealTimes(input: unknown): MealBand[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const out: MealBand[] = [];
  for (const v of input) {
    const s = String(v);
    if (!seen.has(s) && (MEAL_BANDS as string[]).includes(s)) {
      seen.add(s);
      out.push(s as MealBand);
    }
  }
  // 帯の順序を固定して表示のブレをなくす
  return MEAL_BANDS.filter((b) => out.includes(b));
}

/** 飲食スポットかどうか（＝食事どきを1つ以上持つ） */
export function isFoodSpot(spot: Pick<Spot, "meal_times">): boolean {
  return Boolean(spot.meal_times?.length);
}
