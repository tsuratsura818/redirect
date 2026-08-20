/** モックアップの SVG（foxSVG / qrSVG / stampSVG）を移植したもの */

import type { Spot } from "@/lib/types";

/**
 * ナビゲーター「ルル」。
 * ★キャラクター画像は権利者の素材。差し替え・撤去できるよう、参照は必ずこの2つの
 *   コンポーネント経由にしておく（画面側に直接パスを書かない）。
 * ★next/image は使わない。素材が透過WebPで、変形もせずそのまま出すだけなので
 *   最適化の余地が無く、CSPと相性の悪い最適化エンドポイントを増やす意味がない。
 */
export function NaviFace({ size = 48, src = "/navi/ruru-face.webp" }: { size?: number; src?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      width={size}
      height={size}
      alt="ナビゲーターのルル"
      // ★モバイルではこの48pxの画像がLCP要素になる（実測4.1秒）。
      //   小さいのに最後に取りに行くので遅い。優先度を上げて先に取らせる。
      fetchPriority="high"
      style={{ display: "block", inlineSize: size, blockSize: size, objectFit: "contain" }}
    />
  );
}

/** スタート画面のヒーローに立たせる全身。装飾なので alt は空にして読み上げから外す */
export function NaviStanding({ height = 200, src = "/navi/ruru-standing.webp" }: { height?: number; src?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden="true"
      fetchPriority="high"
      style={{ display: "block", blockSize: height, inlineSize: "auto", margin: "0 auto" }}
    />
  );
}

export function FoxIcon({ size = 48 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} role="img" aria-label="navigator">
      <polygon points="14,8 26,20 10,24" fill="#C8553D" />
      <polygon points="50,8 38,20 54,24" fill="#C8553D" />
      <circle cx="32" cy="36" r="20" fill="#E8965A" />
      <ellipse cx="32" cy="44" rx="11" ry="8" fill="#F7F2E8" />
      <circle cx="25" cy="33" r="2.6" fill="#2A2620" />
      <circle cx="39" cy="33" r="2.6" fill="#2A2620" />
      <polygon points="32,38 29,41 35,41" fill="#2A2620" />
    </svg>
  );
}


/** 装飾用のダミーQR（実物のQRは管理画面から発行する） */
/**
 * スタート画面の印。
 *
 * ★以前はQRを模した market を出していたが、参加者はここへ「QRを読んで」来る。
 *   その画面にもう1枚QRらしきものがあると、読み取ろうとして混乱する
 *   （実際に読めない飾りなので、試して失敗する）。
 *   読み取れる形に見えない朱印風の印に置き換えた。
 */
export function StartSeal({ char = "巡" }: { char?: string }) {
  return (
    <svg viewBox="0 0 70 70" role="img" aria-label="まわりみち">
      <circle cx="35" cy="35" r="32" fill="none" stroke="#C8553D" strokeWidth="3" />
      <circle
        cx="35"
        cy="35"
        r="26"
        fill="none"
        stroke="#C8553D"
        strokeWidth="2.5"
        strokeDasharray="3 2.4"
      />
      <text
        x="35"
        y="46"
        textAnchor="middle"
        fontFamily="'Hiragino Mincho ProN','Yu Mincho',serif"
        fontSize="28"
        fill="#C8553D"
      >
        {char}
      </text>
    </svg>
  );
}

export function StampMark({
  spot,
  rare,
  size = 104,
}: {
  spot: Pick<Spot, "kanji">;
  rare: boolean;
  size?: number;
}) {
  const c = rare ? "#DDA82E" : "#C8553D"; // 金は新パレットの --kin に合わせた
  return (
    <svg viewBox="0 0 100 100" width={size}>
      <circle cx="50" cy="50" r="46" fill="none" stroke={c} strokeWidth="4" strokeDasharray="4 3" />
      <circle cx="50" cy="50" r="38" fill="none" stroke={c} strokeWidth="1.6" />
      <text
        x="50"
        y="60"
        textAnchor="middle"
        fontFamily="'Hiragino Mincho ProN','Yu Mincho',serif"
        fontSize="34"
        fill={c}
      >
        {spot.kanji}
      </text>
      {/*
        ★内円(r=38)の内側に収める。以前は fontSize=7 / letterSpacing=2 / y=80 で
          文字幅が内円をはみ出し、外周の点線リングと重なって読めなくなっていた。
          y=74 のとき使える半幅は √(38²−24²)≒29.5（＝全幅59）。それに収まる大きさにしている。
      */}
      <text
        x="50"
        y="74"
        textAnchor="middle"
        fontFamily="monospace"
        fontSize="5.4"
        letterSpacing="1.1"
        fill={c}
        opacity="0.85"
      >
        MAWARIMICHI
      </text>
      {rare ? (
        <text x="50" y="26" textAnchor="middle" fontSize="12" fill={c}>
          ★
        </text>
      ) : null}
    </svg>
  );
}

export function gradient(pair: [string, string] | undefined) {
  const [a, b] = pair ?? ["#4A3B30", "#857D6E"];
  return `linear-gradient(140deg, ${a}, ${b})`;
}
