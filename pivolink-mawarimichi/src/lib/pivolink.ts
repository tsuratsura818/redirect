/**
 * PivoLink から渡ってくる「行き先の判断結果」を受け取る層。
 *
 * ★このプロジェクトの前提: 「毎回行き先が変わる」を実現しているのは PivoLink 本体である。
 *   まわりみちアプリが自前で時刻を見て分岐するのではなく、
 *   PivoLink の redirect_rules が行き先URLを決め、その判断結果をクエリで受け取る。
 *
 *   QR（固定） → https://redirect.tsuratsura.com/r/mawarimichi-<spot>
 *              → PivoLink が redirect_rules を評価
 *                  time_of_day → いまの時間帯       → ?band=day
 *                  ab_test     → 重み付きランダム   → ?pick=b
 *                  scan_step   → 端末ごとの読込回数 → ?visit=2
 *              → https://mawarimichi.vercel.app/s/<token>?band=day&pick=b&visit=2
 *
 *   つまり PivoLink のダッシュボードでルールを止めれば、まわりみちの体験も実際に変わる。
 *   「PivoLinkで作った」ではなく「PivoLinkが動かしている」状態にするための境界がここ。
 *
 * ★ただし “閉まっている場所へ送らない” 判定だけは、この層に依存しない。
 *   URLは共有・ブックマークされうるので、古い band を信じると閉館後の寺へ人を送る。
 *   安全側の判定（open_hours）は常にサーバー時刻で行う（lib/hours.ts）。
 */

import type { MealBand } from "./meal";

/** PivoLink の time_of_day ルールが返す時間帯。ルール名ではなく体験上の呼び名 */
export type PivolinkBand = "morning" | "day" | "evening";

const BANDS: PivolinkBand[] = ["morning", "day", "evening"];

export interface PivolinkContext {
  /** time_of_day ルールが選んだ時間帯。null = ルール未設定 or 未到達 */
  band: PivolinkBand | null;
  /** ab_test ルールが振り分けた枝。二択の抽選シードに混ざる */
  pick: string | null;
  /** scan_step ルールが数えた、この端末での読み込み回数 */
  visit: number | null;
  /**
   * time_of_day ルールが「営業時間外」と判断して、閉店案内へ振り替えた。
   * ★これは PivoLink が行き先そのものを変えている（アプリが時刻を見て出し分けていない）。
   *   ルールを止めれば、閉店中でも通常の画面に着く。
   */
  closed: boolean;
  /** 1つでも PivoLink 由来の値が来ているか（＝PivoLink経由で着地した） */
  active: boolean;
}

export const EMPTY_PIVOLINK: PivolinkContext = {
  band: null,
  pick: null,
  visit: null,
  closed: false,
  active: false,
};

/**
 * 帯 → その帯で薦めてよい食事どき。
 * PivoLink の time_of_day は1つのQRにつき3つまでなので、
 * 4つある食べどき（朝/昼/おやつ/夕）を3帯に畳んでいる。
 */
export const BAND_MEALS: Record<PivolinkBand, MealBand[]> = {
  morning: ["morning"],
  day: ["lunch", "snack"],
  evening: ["dinner"],
};

/** 画面に出す、判断の出どころ */
export const BAND_LABEL: Record<PivolinkBand, { ja: string; en: string }> = {
  morning: { ja: "朝", en: "morning" },
  day: { ja: "昼", en: "daytime" },
  evening: { ja: "夕", en: "evening" },
};

/**
 * クエリを検証して文脈にする。
 * ★外から自由に付けられる値なので、必ずここで狭める。
 *   pick を無検証で通すと、任意文字列で抽選シードを操作されて
 *   「同じ二択を出し続ける」ことができてしまう。
 */
export function readPivolink(params: {
  band?: string;
  pick?: string;
  visit?: string;
  closed?: string;
}): PivolinkContext {
  const band = BANDS.includes(params.band as PivolinkBand)
    ? (params.band as PivolinkBand)
    : null;

  // 英小数字1〜8文字だけ。A/Bテストの枝名として十分で、シードの操作余地を絞れる
  const pick = params.pick && /^[a-z0-9]{1,8}$/.test(params.pick) ? params.pick : null;

  const visitRaw = Number(params.visit);
  const visit =
    Number.isInteger(visitRaw) && visitRaw >= 1 && visitRaw <= 99 ? visitRaw : null;

  const closed = params.closed === "1";

  return {
    band,
    pick,
    visit,
    closed,
    active: band !== null || pick !== null || visit !== null || closed,
  };
}

/**
 * Server Action をまたいで PivoLink の判断を運ぶための文字列（"band=day&pick=b"）。
 * ★これが無いと、目的地を選んだ瞬間に PivoLink の判断が消える。
 *   実際に「開示が出ない・pickが効かない」状態を作ってしまった。
 *   往復する画面では必ずフォームの hidden に載せて持ち回ること。
 */
export function packQuery(ctx: PivolinkContext): string {
  const p = new URLSearchParams();
  if (ctx.band) p.set("band", ctx.band);
  if (ctx.pick) p.set("pick", ctx.pick);
  if (ctx.visit) p.set("visit", String(ctx.visit));
  return p.toString();
}

/**
 * hidden から戻ってきた文字列を、検証したうえでクエリに戻す。
 * ★外から任意の文字列が入る経路なので、必ず readPivolink を通してから組み直す
 *   （そのまま redirect に渡すとオープンリダイレクトの余地ができる）。
 */
export function unpackQuery(raw: string): string {
  const p = new URLSearchParams(raw ?? "");
  return packQuery(
    readPivolink({
      band: p.get("band") ?? undefined,
      pick: p.get("pick") ?? undefined,
      visit: p.get("visit") ?? undefined,
    }),
  );
}

/** 抽選シードに混ぜる文字列。PivoLink が振り直せば二択も変わる */
export function pickSuffix(ctx: PivolinkContext): string {
  return ctx.pick ? `#${ctx.pick}` : "";
}

/**
 * 次の画面へ引き継ぐクエリ（アプリ内遷移で PivoLink の判断を落とさない）。
 * ★closed は引き継がない。「いま着いたこのスポットが閉まっている」という判断であって、
 *   次に向かう別のスポットには関係がないため。次のスポットの開閉は、
 *   その場のQRを読んだときに PivoLink があらためて判断する。
 */
export function carryQuery(ctx: PivolinkContext): string {
  const p = new URLSearchParams();
  if (ctx.band) p.set("band", ctx.band);
  if (ctx.pick) p.set("pick", ctx.pick);
  if (ctx.visit) p.set("visit", String(ctx.visit));
  const s = p.toString();
  return s ? `&${s}` : "";
}
