import type { Metadata, Viewport } from "next";

import "./globals.css";

const TITLE = "まわりみち KYOTO｜PivoLink";
const DESCRIPTION =
  "まわりみちは、目的地までの道中を分散設計する動的QR周遊サービスです。行き先はあなたが選び、そこまでの寄り道を京都が選びます。";

/**
 * ★OGPは必須。参加者は道中でLINEに貼るし、自治体もURLをそのまま共有する。
 *   無いとタイトルも画像も出ない真っ白なリンクになり、それだけで信用を落とす。
 * ★metadataBase を入れないと og:image が相対パスのまま出て、
 *   多くのクローラーが解決できない（Nextが警告を出す）。
 */
export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL)
    : undefined,
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "まわりみち KYOTO",
    title: TITLE,
    description: DESCRIPTION,
    locale: "ja_JP",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "まわりみち KYOTO — 目的地は、あなたが決める。道のりは、京都が決める。",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1E1A17",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        {/*
          ★ルルの画像はモバイルのLCP要素。HTMLの後ろの方に出るので発見が遅れる。
            preload で先に取りに行かせる（Lighthouse の LCP request discovery 対策）。
        */}
        <link rel="preload" as="image" href="/navi/ruru-face.webp" type="image/webp" />
        <link rel="preload" as="image" href="/navi/ruru-standing.webp" type="image/webp" />
      </head>
      <body>{children}</body>
    </html>
  );
}
