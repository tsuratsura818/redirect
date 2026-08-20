/**
 * 実験終了後のお礼。
 * ★この画面へ振り替えているのは PivoLink の scheduled_switch（予約切替）ルール。
 *   終了日時を過ぎた瞬間、全QRの行き先がここに切り替わる。
 *   現地の看板を回収しに行かなくても、体験だけを終わらせられる。
 */
import { VisitorShell } from "@/components/VisitorShell";
import { branding } from "@/lib/branding";
import { getStore } from "@/lib/store";
import { NaviCard } from "@/components/parts";
import { NaviStanding } from "@/components/graphics";

export const dynamic = "force-dynamic";

export default async function FinishedPage() {
  const campaign = await getStore().getCampaignBySlug(
    process.env.NEXT_PUBLIC_DEFAULT_CAMPAIGN ?? "kyoto-higashiyama",
  );
  const brand = branding(campaign, "ja");
  return (
    <VisitorShell lang="ja" languages={["ja"]} stampCount={0} demo={false} returnTo="/finished">
      <div className="fade-in">
        <div className="start-hero">
          <div className="start-loc">MAWARIMICHI — CLOSED</div>
          <h1>
            この道は、
            <br />
            いったん閉じました。
          </h1>
          <p className="tag">
            まわりみち 京都・東山にお付き合いいただき、ありがとうございました。
            あなたが歩いた道は、あなたにしか歩けない一本でした。
          </p>
          <NaviStanding height={150} src={brand.standingUrl} />
        </div>

        <NaviCard
          lang="ja"
          name={brand.navigatorName}
          faceUrl={brand.faceUrl}
          text="おつかれさまでした。今回の道はここまでです。またどこかの町で、別の道をご用意してお待ちしてますね〜"
        />

        <div className="hours-warn">
          <div className="t">この画面について</div>
          <p>
            終了の切り替えは PivoLink の「予約切替」ルールで行っています。
            現地に設置したQRやサイネージはそのままで、期日を過ぎた時点から全員がこの画面に着きます。
            貼り替え・回収の手配が要りません。
          </p>
        </div>
      </div>
    </VisitorShell>
  );
}
