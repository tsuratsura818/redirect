/**
 * キャンペーン設定の入力検証。
 * ★開催期間は「まわりみち側の記録」で、実際の切り替えは PivoLink のルールが行う。
 *   保存時に PivoLink 側も作り直すので、日付を2箇所に手入力しない。
 */

import type { Campaign, I18nText } from "./types";

export interface CampaignInput {
  name: I18nText;
  start_label: I18nText;
  start_lat: number;
  start_lng: number;
  stamp_target: number;
  detour_tolerance_m: number;
  cm_frequency_cap: number;
  /** JSTの "YYYY-MM-DDTHH:mm" を ISO(UTC) にしたもの。空なら null */
  starts_at: string | null;
  ends_at: string | null;
  /** 見出し・タグライン・朱印。空欄はキーごと落とす（＝既定にフォールバック） */
  hero: Record<string, unknown> | null;
  /** ナビゲーターの名前・台詞・画像 */
  navigator: Record<string, unknown> | null;
}

export type CampaignInputResult =
  | { ok: true; value: CampaignInput }
  | { ok: false; errors: string[] };

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

/** datetime-local はタイムゾーンを持たない。JSTとして解釈する（★UTCで解釈すると9時間ズレる） */
export function jstLocalToIso(local: string): string | null {
  if (!local) return null;
  const d = new Date(`${local.length === 16 ? local : `${local}:00`}:00+09:00`.replace(/:00:00\+/, ":00+"));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** ISO → datetime-local（JST）。フォームの初期値用 */
export function isoToJstLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(d);
  return p.replace(" ", "T");
}

/** ja/en を集めて I18nText にする。両方空なら undefined を返し、キーごと落とす */
function optionalI18n(fd: FormData, base: string): I18nText | undefined {
  const ja = String(fd.get(`${base}_ja`) ?? "").trim();
  const en = String(fd.get(`${base}_en`) ?? "").trim();
  if (!ja && !en) return undefined;
  const out: I18nText = {};
  if (ja) out.ja = ja;
  if (en) out.en = en;
  return out;
}

/**
 * 自サイトの相対パスか https だけ通す。
 * ★管理者が入れる値でも javascript: 等は弾く（画面にそのまま出るため）
 */
function safeUrl(v: string): string | undefined {
  const s = v.trim();
  if (!s) return undefined;
  return /^\/[^/]/.test(s) || /^https:\/\//.test(s) ? s : undefined;
}

/** 値のあるキーだけ残す。全部空なら null（＝コード側の既定を使う） */
function compact(obj: Record<string, unknown>): Record<string, unknown> | null {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = v;
  return Object.keys(out).length ? out : null;
}

export function parseCampaignInput(fd: FormData): CampaignInputResult {
  const errors: string[] = [];

  const name: I18nText = {};
  if (str(fd, "name_ja")) name.ja = str(fd, "name_ja");
  if (str(fd, "name_en")) name.en = str(fd, "name_en");
  if (!name.ja) errors.push("キャンペーン名（日本語）は必須です");

  const start_label: I18nText = {};
  if (str(fd, "start_label_ja")) start_label.ja = str(fd, "start_label_ja");
  if (str(fd, "start_label_en")) start_label.en = str(fd, "start_label_en");

  const start_lat = Number(str(fd, "start_lat"));
  const start_lng = Number(str(fd, "start_lng"));
  if (!Number.isFinite(start_lat) || start_lat < -90 || start_lat > 90)
    errors.push("スタート地点の緯度が不正です");
  if (!Number.isFinite(start_lng) || start_lng < -180 || start_lng > 180)
    errors.push("スタート地点の経度が不正です");

  const stamp_target = Number(str(fd, "stamp_target") || "5");
  if (!Number.isInteger(stamp_target) || stamp_target < 1 || stamp_target > 12)
    errors.push("寄り道の数は1〜12で入力してください");

  const detour_tolerance_m = Number(str(fd, "detour_tolerance_m") || "220");
  if (!Number.isFinite(detour_tolerance_m) || detour_tolerance_m < 0 || detour_tolerance_m > 5000)
    errors.push("寄り道の許容距離は0〜5000mで入力してください");

  const cm_frequency_cap = Number(str(fd, "cm_frequency_cap") || "3");
  if (!Number.isInteger(cm_frequency_cap) || cm_frequency_cap < 0 || cm_frequency_cap > 20)
    errors.push("CMの頻度は0〜20で入力してください");

  const startsRaw = str(fd, "starts_at");
  const endsRaw = str(fd, "ends_at");
  const starts_at = startsRaw ? jstLocalToIso(startsRaw) : null;
  const ends_at = endsRaw ? jstLocalToIso(endsRaw) : null;
  if (startsRaw && !starts_at) errors.push("開始日時の形式が不正です");
  if (endsRaw && !ends_at) errors.push("終了日時の形式が不正です");
  if (starts_at && ends_at && new Date(ends_at) <= new Date(starts_at))
    errors.push("終了日時は開始日時より後にしてください");

  const seal = str(fd, "hero_seal");
  if ([...seal].length > 2) errors.push("印の文字は1〜2文字にしてください");

  for (const k of ["navi_face_url", "navi_standing_url", "hero_og_image_url"]) {
    const raw = str(fd, k);
    if (raw && !safeUrl(raw))
      errors.push("画像URLは / で始まる相対パスか https:// で入力してください");
  }

  if (errors.length) return { ok: false, errors };

  const hero = compact({
    title: optionalI18n(fd, "hero_title"),
    tagline: optionalI18n(fd, "hero_tagline"),
    seal: seal || undefined,
    og_image_url: safeUrl(str(fd, "hero_og_image_url")),
  });

  const navigator = compact({
    name: optionalI18n(fd, "navi_name"),
    intro: optionalI18n(fd, "navi_intro"),
    outro: optionalI18n(fd, "navi_outro"),
    note: optionalI18n(fd, "navi_note"),
    face_url: safeUrl(str(fd, "navi_face_url")),
    standing_url: safeUrl(str(fd, "navi_standing_url")),
  });

  return {
    ok: true,
    value: {
      name, start_label, start_lat, start_lng,
      stamp_target, detour_tolerance_m, cm_frequency_cap,
      starts_at, ends_at, hero, navigator,
    },
  };
}

export function campaignToFormValues(c: Campaign) {
  return {
    name_ja: c.name.ja ?? "",
    name_en: c.name.en ?? "",
    start_label_ja: c.start_label?.ja ?? "",
    start_label_en: c.start_label?.en ?? "",
    start_lat: String(c.start_lat),
    start_lng: String(c.start_lng),
    stamp_target: String(c.stamp_target),
    detour_tolerance_m: String(c.detour_tolerance_m),
    cm_frequency_cap: String(c.cm_frequency_cap),
    starts_at: isoToJstLocal(c.starts_at),
    ends_at: isoToJstLocal(c.ends_at),
  };
}
