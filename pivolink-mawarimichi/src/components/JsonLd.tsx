/**
 * 構造化データ（seo-aeo §2 / CLAUDE.md §6）。
 * 参加者ページは TouristAttraction + BreadcrumbList を出す。
 */

import { tx, type Campaign, type Lang, type Spot } from "@/lib/types";

export function SpotJsonLd({
  spot,
  campaign,
  lang,
  origin,
}: {
  spot: Spot;
  campaign: Campaign;
  lang: Lang;
  origin: string;
}) {
  const name = tx(spot.name, lang);
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristAttraction",
        name,
        description: tx(spot.story, lang),
        geo: {
          "@type": "GeoCoordinates",
          latitude: spot.lat,
          longitude: spot.lng,
        },
        isAccessibleForFree: true,
        touristType: "まわりみち参加者",
        url: `${origin}/s/${spot.qr_token}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: tx(campaign.name, lang),
            item: `${origin}/s/${campaign.start_qr_token}`,
          },
          { "@type": "ListItem", position: 2, name },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
