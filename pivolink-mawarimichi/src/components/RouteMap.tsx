/**
 * 今日の道のりを描く簡易マップ。
 *
 * 外部の地図SDKは使わない（Phase 1では不要・CLAUDE.md §2）。
 * 目的はナビゲーションではなく、「最短ルート」と「実際に歩いた道のり」を
 * 重ねて見せて、まわりみち率という数字を絵で理解してもらうこと。
 *
 * ★道中では使わない。到着後とスタンプ帳（＝すでに歩いた分）だけに出す。
 *   これから行く場所を地図で見せると、参加者が先回りできてしまい分散が壊れる（§9-1）。
 */

import type { Lang } from "@/lib/types";
import type { LatLng } from "@/lib/geo";

export interface RoutePoint extends LatLng {
  label: string;
  rare?: boolean;
}

const W = 320;
const H = 200;
const PAD = 26;

/** 等距円筒近似で緯度経度を平面に落とす（distM と同じ考え方） */
function project(points: LatLng[]) {
  const latAvg = points.reduce((a, p) => a + p.lat, 0) / points.length;
  const k = Math.cos((latAvg * Math.PI) / 180);
  const xs = points.map((p) => p.lng * k);
  const ys = points.map((p) => p.lat);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  // 縦横の縮尺を揃える（地図の形が歪まないように）
  const spanX = Math.max(maxX - minX, 1e-9);
  const spanY = Math.max(maxY - minY, 1e-9);
  const scale = Math.min((W - PAD * 2) / spanX, (H - PAD * 2) / spanY);
  const offX = (W - spanX * scale) / 2;
  const offY = (H - spanY * scale) / 2;

  return (p: LatLng) => ({
    x: offX + (p.lng * k - minX) * scale,
    y: H - (offY + (p.lat - minY) * scale), // SVGは下向きが正
  });
}

export function RouteMap({
  start,
  goal,
  points,
  startLabel,
  goalLabel,
  shortestLabel,
  walkedLabel,
  lang = "ja",
}: {
  start: LatLng;
  goal: LatLng;
  points: RoutePoint[];
  startLabel: string;
  goalLabel: string;
  shortestLabel: string;
  walkedLabel: string;
  lang?: Lang;
}) {
  const all = [start, ...points, goal];
  const to = project(all);
  const s = to(start);
  const g = to(goal);
  const ps = points.map(to);
  const walked = [s, ...ps, g];
  const path = walked.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  // ★代替テキストも言語で切り替える。ここが日本語固定だと、EN の利用者に
  //   スクリーンリーダーで日本語が読み上げられる（実際に固定になっていた）
  const alt =
    lang === "en"
      ? `Today's road. The line you walked from the start via ${points.map((p) => p.label).join(", ")} to ${goalLabel}, overlaid with the straight shortest line from the start to ${goalLabel}.`
      : `今日の道のり。スタート地点から${points.map((p) => p.label).join("、")}を経て${goalLabel}まで歩いた線と、` +
        `スタートから${goalLabel}への最短の直線を重ねた地図。`;

  return (
    <figure className="route-map">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={alt}>
        {/* 最短ルート（歩かなかった道） */}
        <line
          x1={s.x} y1={s.y} x2={g.x} y2={g.y}
          stroke="#857D6E" strokeWidth="1.5" strokeDasharray="4 4" opacity=".8"
        />
        {/* 実際に歩いた道のり */}
        <path d={path} fill="none" stroke="#C8553D" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />

        {/* 立ち寄ったスポット */}
        {ps.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="7" fill={points[i].rare ? "#C9A227" : "#C8553D"} />
            <text x={p.x} y={p.y + 3.2} textAnchor="middle" fontSize="8" fill="#fff" fontFamily="monospace">
              {i + 1}
            </text>
          </g>
        ))}

        {/* スタートと目的地 */}
        <circle cx={s.x} cy={s.y} r="5" fill="#2A2620" />
        <text x={s.x} y={s.y - 10} textAnchor="middle" fontSize="9" fill="#2A2620">
          {startLabel}
        </text>
        <rect x={g.x - 6} y={g.y - 6} width="12" height="12" rx="2" fill="#2A2620" />
        <text x={g.x} y={g.y - 12} textAnchor="middle" fontSize="9" fill="#2A2620">
          {goalLabel}
        </text>
      </svg>
      <figcaption>
        <span className="rm-key rm-walked">{walkedLabel}</span>
        <span className="rm-key rm-short">{shortestLabel}</span>
      </figcaption>
    </figure>
  );
}
