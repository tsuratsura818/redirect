/** 座標・距離まわりのユーティリティ（モックアップ distM() と同一式） */

export type LatLng = { lat: number; lng: number };

const EARTH_R = 6371000;

/**
 * 等距円筒近似での2点間距離（m）。
 * 東山〜京都駅の数km圏なら Haversine との誤差は無視できる。
 */
export function distM(a: LatLng, b: LatLng): number {
  const r = Math.PI / 180;
  const x = (b.lng - a.lng) * r * Math.cos(((a.lat + b.lat) / 2) * r);
  const y = (b.lat - a.lat) * r;
  return Math.sqrt(x * x + y * y) * EARTH_R;
}

/** 1,000m未満は10m丸め、以上は km 表記 */
export function fmtM(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${Math.round(m / 10) * 10}m`;
}

/** 徒歩分数のざっくり換算（80m/分） */
export function walkMinutes(m: number): number {
  return Math.max(1, Math.ceil(m / 80));
}
