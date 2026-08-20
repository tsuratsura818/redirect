/**
 * 管理画面からのスポット入力の検証。
 * フォームは Server Action で受けるので、ここで型と範囲を確定させる。
 */

import { normalizeOpenHours, type OpenHours } from "./hours";
import { normalizeMealTimes, type MealBand } from "./meal";
import type { I18nText, Spot } from "./types";

export interface SpotInput {
  slug: string;
  name: I18nText;
  area: I18nText;
  story: I18nText;
  navi_lines: I18nText;
  lat: number;
  lng: number;
  kanji: string;
  walk_min: number | null;
  capacity_weight: number;
  congestion_level: number;
  is_collab: boolean;
  meal_times: MealBand[];
  open_hours: OpenHours | null;
  coupon: I18nText | null;
  image_url: string | null;
  map_url: string | null;
  active: boolean;
}

export type SpotInputResult =
  | { ok: true; value: SpotInput }
  | { ok: false; errors: string[] };

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const httpsOrNull = (v: string) => (v && /^https:\/\//.test(v) ? v : null);

/** ja が空なら undefined を返し、DBに空文字を入れない */
function i18n(fd: FormData, base: string): I18nText {
  const ja = str(fd, `${base}_ja`);
  const en = str(fd, `${base}_en`);
  const out: I18nText = {};
  if (ja) out.ja = ja;
  if (en) out.en = en;
  return out;
}

export function parseSpotInput(fd: FormData): SpotInputResult {
  const errors: string[] = [];

  const slug = str(fd, "slug").toLowerCase();
  if (!slug) errors.push("スラッグは必須です");
  else if (!/^[a-z0-9][a-z0-9-]{1,39}$/.test(slug))
    errors.push("スラッグは半角英小文字・数字・ハイフンで2〜40文字にしてください");

  const name = i18n(fd, "name");
  if (!name.ja) errors.push("スポット名（日本語）は必須です");

  const lat = Number(str(fd, "lat"));
  const lng = Number(str(fd, "lng"));
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) errors.push("緯度が不正です（-90〜90）");
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) errors.push("経度が不正です（-180〜180）");

  const kanji = str(fd, "kanji");
  if ([...kanji].length > 2) errors.push("スタンプの文字は1〜2文字にしてください");

  const walkRaw = str(fd, "walk_min");
  const walk_min = walkRaw === "" ? null : Number(walkRaw);
  if (walk_min !== null && (!Number.isFinite(walk_min) || walk_min < 0 || walk_min > 180))
    errors.push("徒歩分は0〜180で入力してください");

  const capacity = Number(str(fd, "capacity_weight") || "1");
  if (!Number.isFinite(capacity) || capacity < 0 || capacity > 10)
    errors.push("キャパ重みは0〜10で入力してください");

  const congestion = Number(str(fd, "congestion_level") || "1");
  if (![0, 1, 2].includes(congestion)) errors.push("混雑度は0/1/2のいずれかです");

  // 拝観・営業時間。両方空なら「終日開いている」= null
  const openFrom = str(fd, "open_from");
  const openTo = str(fd, "open_to");
  let open_hours: OpenHours | null = null;
  if (openFrom || openTo) {
    open_hours = normalizeOpenHours({ from: Number(openFrom), to: Number(openTo) });
    if (!open_hours)
      errors.push("営業時間は「開く時」<「閉まる時」で、0〜24の範囲で入力してください（両方空なら終日）");
  }

  if (errors.length) return { ok: false, errors };

  const coupon = i18n(fd, "coupon");

  return {
    ok: true,
    value: {
      slug,
      name,
      area: i18n(fd, "area"),
      story: i18n(fd, "story"),
      navi_lines: i18n(fd, "navi"),
      lat,
      lng,
      kanji,
      walk_min,
      capacity_weight: capacity,
      congestion_level: congestion,
      is_collab: fd.get("is_collab") === "on",
      // 飲食スポットのみ。チェックが1つも無ければ空配列＝寺社などの非飲食スポット
      meal_times: normalizeMealTimes(fd.getAll("meal_times")),
      open_hours,
      coupon: coupon.ja || coupon.en ? coupon : null,
      image_url: httpsOrNull(str(fd, "image_url")) ?? (str(fd, "image_url").startsWith("/") ? str(fd, "image_url") : null),
      map_url: httpsOrNull(str(fd, "map_url")),
      active: fd.get("active") === "on",
    },
  };
}

/** 既存スポットをフォームの初期値に落とす */
export function toFormValues(spot: Spot) {
  return {
    slug: spot.slug,
    name_ja: spot.name.ja ?? "",
    name_en: spot.name.en ?? "",
    area_ja: spot.area?.ja ?? "",
    area_en: spot.area?.en ?? "",
    story_ja: spot.story?.ja ?? "",
    story_en: spot.story?.en ?? "",
    navi_ja: spot.navi_lines?.ja ?? "",
    navi_en: spot.navi_lines?.en ?? "",
    coupon_ja: spot.coupon?.ja ?? "",
    coupon_en: spot.coupon?.en ?? "",
    lat: String(spot.lat),
    lng: String(spot.lng),
    kanji: spot.kanji ?? "",
    walk_min: spot.walk_min != null ? String(spot.walk_min) : "",
    capacity_weight: String(spot.capacity_weight),
    congestion_level: String(spot.congestion_level),
    image_url: spot.image_url ?? "",
    map_url: spot.map_url ?? "",
    meal_times: normalizeMealTimes(spot.meal_times),
    open_from: spot.open_hours ? String(spot.open_hours.from) : "",
    open_to: spot.open_hours ? String(spot.open_hours.to) : "",
    is_collab: spot.is_collab,
    active: spot.active,
  };
}
