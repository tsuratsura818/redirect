/**
 * ナビのディープリンク。
 *
 * ★制約（CLAUDE.md §9-1）: ナビは常に「現在地→次の1スポット」の区間のみ。
 *   目的地の座標を渡してよいのは最終区間（スタンプが揃ったあと）だけ。
 *   全行程ナビを付けると参加者がスポットを飛ばして直行し、分散＝プロダクトの存在意義が崩壊する。
 *
 * ★外部デジタルマップ（MapPenguin 等）に差し替えられるようにしてある。
 *   ただし「全スポットが載った回遊マップ」をそのまま出してはいけない。
 *   参加者が次の行き先を一覧で見られた時点で、回廊ルーティングは無意味になる。
 *   連携するのは必ず「1地点だけを開くURL」であること。
 */

import type { LatLng } from "./geo";

export type NavProvider = "google" | "apple" | "custom";

function isIos(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return /iPhone|iPad|iPod/i.test(userAgent);
}

/**
 * 外部マップのURLテンプレート。env で差し替える。
 * 使えるプレースホルダ: {lat} {lng} {slug} {name}
 * 例: MAP_NAV_URL_TEMPLATE=https://maps.smartpr.jp/<map-id>/?lat={lat}&lng={lng}&goal=1
 */
function customTemplate(): string | null {
  const t = process.env.MAP_NAV_URL_TEMPLATE;
  return t && t.includes("{lat}") && t.includes("{lng}") ? t : null;
}

export interface NavTarget extends LatLng {
  slug?: string;
  name?: string;
  /** そのスポットに登録された外部マップのURL（管理画面で1件ずつ登録する） */
  mapUrl?: string | null;
}

function fillTemplate(template: string, dest: NavTarget): string {
  return template
    .replaceAll("{lat}", String(dest.lat))
    .replaceAll("{lng}", String(dest.lng))
    .replaceAll("{slug}", encodeURIComponent(dest.slug ?? ""))
    .replaceAll("{name}", encodeURIComponent(dest.name ?? ""));
}

/**
 * 徒歩ルートのディープリンク。
 * MAP_NAV_URL_TEMPLATE が設定されていれば外部デジタルマップへ、
 * 無ければ iOS は Apple マップ、それ以外は Google マップへ飛ばす。
 */
export function walkingDirectionsUrl(dest: NavTarget, userAgent: string | null): string {
  // 優先順: そのスポットに登録された個別URL → env のテンプレート → 標準の地図アプリ
  if (dest.mapUrl && /^https:\/\//.test(dest.mapUrl)) return dest.mapUrl;

  const template = customTemplate();
  if (template) return fillTemplate(template, dest);

  const { lat, lng } = dest;
  return isIos(userAgent)
    ? `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=w`
    : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
}

/** いまどのナビを使っているか（管理画面・レポートでの表示用） */
export function activeNavProvider(userAgent: string | null, mapUrl?: string | null): NavProvider {
  if (mapUrl) return "custom";
  if (customTemplate()) return "custom";
  return isIos(userAgent) ? "apple" : "google";
}
