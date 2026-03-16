import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // セキュリティヘッダー
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
      ],
    },
    {
      // リダイレクトエンドポイントはキャッシュしない
      source: "/r/:slug*",
      headers: [
        { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
      ],
    },
  ],
  // 本番ビルドの最適化
  poweredByHeader: false,
};

export default nextConfig;
