/**
 * 営業時間・拝観時間。
 *
 * 「食べどき」(meal.ts) が“向いている時間”なら、こちらは“開いている時間”。
 * 分けている理由: ランチの店は夜も開いているが夜に薦める店ではない、
 * 逆に24時間入れる神社は「向き不向きは無いが常に開いている」。同じ軸にすると両方が壊れる。
 *
 * ★これが無いと、17時に閉まる記念館へ19時に人を送る。
 *   分散のためにルートを散らすほど「閉まっていた」事故が増えるので、
 *   スポットを増やす前にこの制約を入れておく必要がある。
 * ★日をまたぐ営業（23時→翌2時など）は Phase 1 では扱わない。
 *   実証実験の対象時間帯（7〜22時）に閉店が収まるため。必要になったら to > 24 で表現する。
 */

import type { Lang } from "./types";

export interface OpenHours {
  /** 開く「時」(JST, 0-23) */
  from: number;
  /** 閉まる「時」(JST)。この時刻ちょうどには、もう閉まっている扱い */
  to: number;
}

/** 未知の形を捨てて OpenHours に正規化する（DB・フォームからの入力用） */
export function normalizeOpenHours(input: unknown): OpenHours | null {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return null;
  const rec = input as Record<string, unknown>;
  const from = Number(rec.from);
  const to = Number(rec.to);
  if (!Number.isFinite(from) || !Number.isFinite(to)) return null;
  if (from < 0 || from > 23 || to < 1 || to > 24 || to <= from) return null;
  return { from: Math.round(from), to: Math.round(to) };
}

/** null（＝終日開いている屋外の社・通りなど）は常に true */
export function isOpenAt(hours: OpenHours | null | undefined, hour: number): boolean {
  if (!hours) return true;
  return hour >= hours.from && hour < hours.to;
}

/** 閉まる buffer 時間前に入っているか（着く頃には閉まっている、を防ぐ） */
export function isClosingSoon(
  hours: OpenHours | null | undefined,
  hour: number,
  bufferHours = 1,
): boolean {
  if (!hours || bufferHours <= 0) return false;
  return isOpenAt(hours, hour) && hour >= hours.to - bufferHours;
}

export function hoursLabel(hours: OpenHours | null | undefined, lang: Lang): string {
  if (!hours) return lang === "en" ? "Open all day" : "終日";
  return `${hours.from}:00–${hours.to}:00`;
}

/** 「本日は終了しました」「まもなく閉まります」— 参加者に出す一言 */
export function hoursNotice(
  hours: OpenHours | null | undefined,
  hour: number,
  lang: Lang,
): { text: string; level: "closed" | "soon" } | null {
  if (!hours) return null;
  if (!isOpenAt(hours, hour)) {
    return {
      level: "closed",
      text:
        lang === "en"
          ? `Closed now (${hoursLabel(hours, lang)})`
          : `いまは閉まっています（${hoursLabel(hours, lang)}）`,
    };
  }
  if (isClosingSoon(hours, hour)) {
    return {
      level: "soon",
      text: lang === "en" ? `Closing at ${hours.to}:00` : `${hours.to}:00に閉まります`,
    };
  }
  return null;
}
