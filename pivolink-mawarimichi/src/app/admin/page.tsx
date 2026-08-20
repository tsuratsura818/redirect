/**
 * 管理ダッシュボード（F11/F12）。
 * スポットの重み調整・公開停止と、回遊レポート（分散状況・提示無視率・ナビ利用率）。
 */

import Link from "next/link";
import { redirect } from "next/navigation";

import { adminLogoutAction, updateSpotAction } from "@/app/admin/actions";
import { isAdmin } from "@/lib/admin";
import { hoursLabel } from "@/lib/hours";
import { mealLabel } from "@/lib/meal";
import { getStore } from "@/lib/store";
import { tx } from "@/lib/types";

export const dynamic = "force-dynamic";

const CONGESTION_LABEL = ["空き ◎", "空き ○", "やや混雑"];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string; created?: string; deleted?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { saved, error, created, deleted } = await searchParams;

  const store = getStore();
  const slug = process.env.NEXT_PUBLIC_DEFAULT_CAMPAIGN ?? "kyoto-higashiyama";
  const campaign = await store.getCampaignBySlug(slug);
  if (!campaign) {
    return (
      <main className="p-8">
        <p className="text-sm text-red-700">キャンペーン「{slug}」が見つかりません。</p>
      </main>
    );
  }

  const [spots, report, recentScans] = await Promise.all([
    store.listSpots(campaign.id, { includeInactive: true }),
    store.getReport(campaign.id),
    store.getRecentScanCounts(campaign.id, 60),
  ]);

  return (
    <main className="min-h-dvh bg-neutral-100 p-6 text-neutral-900">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold">{tx(campaign.name, "ja")}</h1>
          <nav className="mt-3 flex flex-wrap gap-2 text-xs">
            <Link href="/admin/campaign" className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 font-semibold">
              キャンペーン設定・開催期間・CM枠
            </Link>
            <Link href="/admin/goals" className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 font-semibold">
              目的地
            </Link>
            <Link href="/admin/spots/new" className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 font-semibold">
              スポットを追加
            </Link>
            <Link href="/admin/setup" className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 font-semibold">
              セットアップ確認
            </Link>
          </nav>
            <p className="text-xs text-neutral-500">
              {campaign.slug} ／ スタンプ {campaign.stamp_target}個 ／ 回廊許容{" "}
              {campaign.detour_tolerance_m}m ／ データ層: {store.kind}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/qr" className="text-xs font-semibold underline">
              QR発行
            </Link>
            <form action={adminLogoutAction}>
              <button className="text-xs text-neutral-500 underline" type="submit">
                ログアウト
              </button>
            </form>
          </div>
        </header>

        {store.kind === "cookie" ? (
          <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            DB未接続（cookieモード）で動いています。参加者の進行状況は各端末に保存されるため、
            <b>この画面では回遊レポートを集計できません</b>。スポットの重み変更も保存されません。
            分散状況を数字で見る段階になったら Supabase を接続してください。
          </p>
        ) : null}
        {store.kind === "memory" ? (
          <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            Supabase 未接続のため、データはこのサーバーのメモリ上にのみ保持されています（再起動で消えます）。
            .env.local に NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY を設定すると本番DBに切り替わります。
          </p>
        ) : null}
        {created ? (
          <p className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">
            スポット「{created}」を追加しました。<b>現地用のQRは「QR発行」から出してください。</b>
          </p>
        ) : null}
        {deleted ? (
          <p className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">削除しました。</p>
        ) : null}
        {saved ? (
          <p className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">
            保存しました。次の抽選から反映されます。
          </p>
        ) : null}
        {error ? (
          <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">入力値が不正です。</p>
        ) : null}

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="セッション" value={String(report.sessions)} />
          <Stat label="完走" value={String(report.completedSessions)} />
          <Stat label="スタンプ総数" value={String(report.totalScans)} />
          <Stat
            label="まわりみち率(中央値)"
            value={report.detourRateMedian !== null ? `${report.detourRateMedian}%` : "—"}
          />
        </section>

        <section className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-sm font-semibold">スポット — 重み調整と分散状況</h2>
            <Link
              href="/admin/spots/new"
              className="shrink-0 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white"
            >
              ＋ スポットを追加
            </Link>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            重み = (3 − 混雑度) × キャパ重み。ここを変えると次の抽選から即時反映されます。
            提示無視率 = 二択に出したのに選ばれなかった割合。
            デジタルマップURLを入れると、その1地点の区間ナビだけがそのURLに切り替わります（空ならGoogle／Appleマップ）。
          </p>
          <p className="mt-2 rounded-lg bg-neutral-50 p-2 text-xs text-neutral-600">
            <b>混雑は自動連動しています。</b>直近60分のスキャン数を受入キャパで割った密度で判定し、
            混み始めたスポットは自動で二択に出にくくなります（密度3で0.75倍／6で0.45倍／10で0.2倍）。
            <b>混雑度の欄は手で触らなくて構いません</b> — 構造的にいつも混む場所だけ2にしておく用途です。
            <br />
            キャパ重みは<b>「1時間に無理なく受け入れられる人数 ÷ 3」</b>が目安（小さな社=1.0／大きな境内=3.0）。
            詳しくは <code>docs/capacity-guide.md</code>。
          </p>
          <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
            <b>この画面とPivoLinkの関係</b> — PivoLinkは「どのURLに着地させるか」（時間帯・A/B・読込回数・
            開催期間）を決め、<b>この画面は「着地したあと、どのスポットが二択に出やすいか」</b>を決めます。
            重みの掛け算で最終的な出やすさが決まるので、どちらか片方だけでは結果が変わりません。
            <br />
            ★<b>営業時間を変えたら、PivoLink側のルールを作り直してください。</b>
            営業時間外の振り替えはPivoLinkのルールで行っているため、ここを直すだけでは追従しません。
            <code>node _create-mawarimichi-rules.mjs --dest &lt;本番URL&gt;</code>
            （この画面の値を読んで生成されます）
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[840px] text-left text-xs">
              <thead className="text-neutral-500">
                <tr className="border-b border-neutral-200">
                  <th className="py-2">スポット</th>
                  <th className="py-2" colSpan={3}>
                    キャパ重み ／ 混雑度 ／ 公開
                  </th>
                  <th className="py-2 text-right">直近60分</th>
                  <th className="py-2 text-right">スタンプ</th>
                  <th className="py-2 text-right">提示</th>
                  <th className="py-2 text-right">提示無視率</th>
                  <th className="py-2 text-right">ナビ</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {spots.map((spot) => {
                  const row = report.spots.find((r) => r.spot.id === spot.id);
                  const shown = row?.shown ?? 0;
                  const taken = row?.taken ?? 0;
                  const ignoreRate = shown > 0 ? Math.round(((shown - taken) / shown) * 100) : null;

                  return (
                    <tr key={spot.id} className="border-b border-neutral-100 align-middle">
                      <td className="py-2">
                        <div className="font-semibold">{tx(spot.name, "ja")}</div>
                        <div className="text-[10px] text-neutral-400">{spot.slug}</div>
                        <div className="mt-0.5 text-[10px] text-neutral-500">
                          🕘 {hoursLabel(spot.open_hours, "ja")}
                        </div>
                        {spot.meal_times?.length ? (
                          <div className="mt-0.5 text-[10px] text-amber-700">
                            🍚 {spot.meal_times.map((b) => mealLabel(b, "ja")).join("・")}
                          </div>
                        ) : null}
                      </td>
                      {/* キャパ重み・混雑度・公開 の3列を1つのフォームで束ねる */}
                      <td colSpan={3} className="py-2">
                        <form
                          action={updateSpotAction}
                          className="flex items-center gap-2"
                          id={`spot-${spot.id}`}
                        >
                          <input type="hidden" name="spotId" value={spot.id} />
                          <input
                            type="number"
                            name="capacityWeight"
                            step="0.1"
                            min="0"
                            max="10"
                            defaultValue={String(spot.capacity_weight)}
                            className="w-20 rounded border border-neutral-300 px-2 py-1"
                          />
                          <select
                            name="congestionLevel"
                            defaultValue={String(spot.congestion_level)}
                            className="rounded border border-neutral-300 px-2 py-1"
                          >
                            {CONGESTION_LABEL.map((label, i) => (
                              <option key={i} value={i}>
                                {i} — {label}
                              </option>
                            ))}
                          </select>
                          <label className="flex items-center gap-1">
                            <input type="checkbox" name="active" defaultChecked={spot.active} />
                            公開
                          </label>
                          <input
                            type="url"
                            name="mapUrl"
                            defaultValue={spot.map_url ?? ""}
                            placeholder="デジタルマップURL（任意・https://）"
                            className="min-w-0 flex-1 rounded border border-neutral-300 px-2 py-1"
                          />
                        </form>
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        {(() => {
                          const live = recentScans[spot.id] ?? 0;
                          const density = spot.capacity_weight > 0 ? live / Number(spot.capacity_weight) : live;
                          const damp = density >= 10 ? "0.2×" : density >= 6 ? "0.45×" : density >= 3 ? "0.75×" : null;
                          return (
                            <span className={damp ? "font-semibold text-amber-700" : "text-neutral-400"}>
                              {live}
                              {damp ? <span className="ml-1 text-[10px]">{damp}</span> : null}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="py-2 text-right tabular-nums">{row?.scans ?? 0}</td>
                      <td className="py-2 text-right tabular-nums">{shown}</td>
                      <td className="py-2 text-right tabular-nums">
                        {ignoreRate !== null ? `${ignoreRate}%` : "—"}
                      </td>
                      <td className="py-2 text-right tabular-nums">{row?.navClicks ?? 0}</td>
                      <td className="py-2 text-right whitespace-nowrap">
                        <button
                          form={`spot-${spot.id}`}
                          type="submit"
                          className="rounded bg-neutral-900 px-3 py-1 font-semibold text-white"
                        >
                          保存
                        </button>
                        <Link
                          href={`/admin/spots/${spot.id}`}
                          className="ml-2 underline"
                        >
                          編集
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold">目的地の選ばれ方</h2>
            <ul className="mt-3 space-y-1 text-xs">
              {report.goals.map(({ goal, sessions }) => (
                <li key={goal.id} className="flex justify-between">
                  <span>{tx(goal.name, "ja")}</span>
                  <span className="tabular-nums">{sessions}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-neutral-500">
              ナビ利用率: {Math.round(report.navClickRate * 100)}%
            </p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold">直近のルート</h2>
            <ol className="mt-3 space-y-2 text-xs">
              {report.recentRoutes.length ? (
                report.recentRoutes.map((route) => (
                  <li key={route.sessionId}>
                    <span className="text-neutral-400">
                      {route.completedAt ? "完走" : "進行中"} ／ {route.goal}：
                    </span>
                    {route.spots.join(" → ") || "—"}
                  </li>
                ))
              ) : (
                <li className="text-neutral-400">まだ記録がありません</li>
              )}
            </ol>
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="text-lg font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-neutral-500">{label}</div>
    </div>
  );
}
