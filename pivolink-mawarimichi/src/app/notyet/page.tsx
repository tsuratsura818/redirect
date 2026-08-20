/**
 * 実験開始前の案内。
 * ★この画面へ振り替えているのは PivoLink の schedule ルール。
 *   アプリが日付を見て出し分けているのではなく、リダイレクトの時点で行き先が違う。
 *   看板・チラシのQRは刷ったまま、開始日まで自動でこちらに着く。
 */
import { VisitorShell } from "@/components/VisitorShell";
import { branding } from "@/lib/branding";
import { getStore } from "@/lib/store";
import { NaviCard } from "@/components/parts";
import { NaviStanding } from "@/components/graphics";

export const dynamic = "force-dynamic";

export default async function NotYetPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const campaign = await getStore().getCampaignBySlug(
    process.env.NEXT_PUBLIC_DEFAULT_CAMPAIGN ?? "kyoto-higashiyama",
  );
  const brand = branding(campaign, "ja");
  return (
    <VisitorShell lang="ja" languages={["ja"]} stampCount={0} demo={false} returnTo="/notyet">
      <div className="fade-in">
        <div className="start-hero">
          <div className="start-loc">MAWARIMICHI — COMING SOON</div>
          <h1>
            まだ、始まっていません。
          </h1>
          <p className="tag">
            この道は、開催期間に入るとひらきます。同じQRのまま、その日から歩けるようになります。
          </p>
          <NaviStanding height={150} src={brand.standingUrl} />
        </div>

        <NaviCard
          lang="ja"
          name={brand.navigatorName}
          faceUrl={brand.faceUrl}
          text="来てくれはったのに、ごめんなさい。まだ準備の途中なんです。開催が始まったら、このQRがそのまま道の入口になりますから、また読みにきてくださいね〜"
        />

        <div className="hours-warn">
          <div className="t">この画面について</div>
          <p>
            開催期間の管理は PivoLink の「期間指定」ルールで行っています。
            看板やチラシに刷ったQRは一切貼り替えず、開始日を過ぎると自動で本編に切り替わります。
            {from ? `（${from}）` : null}
          </p>
        </div>
      </div>
    </VisitorShell>
  );
}
