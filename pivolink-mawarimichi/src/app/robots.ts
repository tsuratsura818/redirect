import type { MetadataRoute } from "next";

/**
 * AIクローラーを明示的に許可する（seo-aeo §2）。
 * 参加者のセッション画面（/book /arrival）と管理画面はクロール対象外。
 */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL;

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/book", "/arrival"] },
      { userAgent: ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"], allow: "/" },
    ],
    ...(base ? { host: base, sitemap: `${base}/sitemap.xml` } : {}),
  };
}
