/**
 * 目的地（ゴール）の入力検証。
 * ★目的地は参加者が自分で選ぶもの＝体験の起点。座標を間違えると回廊そのものが崩れる。
 */

import { normalizeOpenHours, type OpenHours } from "./hours";
import type { Goal, I18nText } from "./types";

export interface GoalInput {
  slug: string;
  name: I18nText;
  subtitle: I18nText;
  lat: number;
  lng: number;
  icon_char: string;
  open_hours: OpenHours | null;
  sort_order: number;
  active: boolean;
}

export type GoalInputResult = { ok: true; value: GoalInput } | { ok: false; errors: string[] };

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

function i18n(fd: FormData, base: string): I18nText {
  const out: I18nText = {};
  const ja = str(fd, `${base}_ja`);
  const en = str(fd, `${base}_en`);
  if (ja) out.ja = ja;
  if (en) out.en = en;
  return out;
}

export function parseGoalInput(fd: FormData): GoalInputResult {
  const errors: string[] = [];

  const slug = str(fd, "slug").toLowerCase();
  if (!slug) errors.push("スラッグは必須です");
  else if (!/^[a-z0-9][a-z0-9-]{1,39}$/.test(slug))
    errors.push("スラッグは半角英小文字・数字・ハイフンで2〜40文字にしてください");

  const name = i18n(fd, "name");
  if (!name.ja) errors.push("目的地名（日本語）は必須です");

  const lat = Number(str(fd, "lat"));
  const lng = Number(str(fd, "lng"));
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) errors.push("緯度が不正です（-90〜90）");
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) errors.push("経度が不正です（-180〜180）");

  const icon = str(fd, "icon_char");
  if ([...icon].length > 2) errors.push("アイコン文字は1〜2文字にしてください");

  const from = str(fd, "open_from");
  const to = str(fd, "open_to");
  let open_hours: OpenHours | null = null;
  if (from || to) {
    open_hours = normalizeOpenHours({ from: Number(from), to: Number(to) });
    if (!open_hours) errors.push("拝観時間は「開く時」<「閉まる時」で入力してください（両方空なら終日）");
  }

  const sortRaw = str(fd, "sort_order");
  const sort_order = sortRaw === "" ? 0 : Number(sortRaw);
  if (!Number.isFinite(sort_order)) errors.push("並び順は数値で入力してください");

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      slug,
      name,
      subtitle: i18n(fd, "subtitle"),
      lat,
      lng,
      icon_char: icon,
      open_hours,
      sort_order,
      active: fd.get("active") === "on",
    },
  };
}

export function goalToFormValues(goal: Goal) {
  return {
    slug: goal.slug,
    name_ja: goal.name.ja ?? "",
    name_en: goal.name.en ?? "",
    subtitle_ja: goal.subtitle?.ja ?? "",
    subtitle_en: goal.subtitle?.en ?? "",
    lat: String(goal.lat),
    lng: String(goal.lng),
    icon_char: goal.icon_char ?? "",
    open_from: goal.open_hours ? String(goal.open_hours.from) : "",
    open_to: goal.open_hours ? String(goal.open_hours.to) : "",
    sort_order: String(goal.sort_order),
    active: goal.active,
  };
}
