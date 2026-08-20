/**
 * スタンプ判定。★レア判定は必ずサーバー側で行う（クライアントに確率を渡さない）。
 */

import { defaultRng, type Rng } from "./rng";
import { hourJst } from "./time";
import type { RareConfig, Spot } from "./types";

/** レアスタンプの抽選。時間帯条件を満たすと確率が上がる */
export function rollRare(spot: Pick<Spot, "rare_config">, now: Date = new Date(), rng: Rng = defaultRng): boolean {
  const cfg: RareConfig | null | undefined = spot.rare_config;
  if (!cfg) return false;

  let prob = cfg.prob ?? 0;

  if (cfg.time_window) {
    const [from, to] = cfg.time_window;
    const h = hourJst(now);
    const inWindow = from <= to ? h >= from && h < to : h >= from || h < to;
    if (inWindow && typeof cfg.prob_in_window === "number") prob = cfg.prob_in_window;
  }

  return rng() < prob;
}

/** クーポンコード。推測されにくく、口頭・目視で伝えられる長さに寄せる */
export function generateCouponCode(rng: Rng = defaultRng): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 0/O, 1/I を除外
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(rng() * alphabet.length)];
  }
  return `MAWARI-${code}`;
}
