import { redirect } from "next/navigation";

import { getStore } from "@/lib/store";

/** ルートは既定キャンペーンのスタートQRへ流す（サイネージのQRと同じ着地点） */
export default async function Home() {
  const slug = process.env.NEXT_PUBLIC_DEFAULT_CAMPAIGN ?? "kyoto-higashiyama";
  const campaign = await getStore().getCampaignBySlug(slug);
  if (!campaign) redirect("/admin");
  redirect(`/s/${campaign.start_qr_token}`);
}
