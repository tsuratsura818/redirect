/**
 * QR発行（F11）。サイネージ・看板の入稿用。
 *
 * ★未確定事項（CLAUDE.md §9）: QRトークンのURLスキームは、印刷入稿前に確定させること。
 *   印刷後はトークンを変更できない（遷移先だけがサーバー側で可変）。
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { isAdmin } from "@/lib/admin";
import { getStore } from "@/lib/store";
import { tx } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminQrPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const store = getStore();
  const slug = process.env.NEXT_PUBLIC_DEFAULT_CAMPAIGN ?? "kyoto-higashiyama";
  const campaign = await store.getCampaignBySlug(slug);
  if (!campaign) redirect("/admin");

  const spots = await store.listSpots(campaign.id, { includeInactive: true });

  const h = await headers();
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host") ?? "localhost:3000"}`;

  const items = [
    { label: `START — ${tx(campaign.start_label, "ja")}`, token: campaign.start_qr_token, kind: "スタート" },
    ...spots.map((s) => ({ label: tx(s.name, "ja"), token: s.qr_token, kind: s.active ? "スポット" : "スポット(非公開)" })),
  ];

  return (
    <main className="min-h-dvh bg-neutral-100 p-6 text-neutral-900">
      <div className="mx-auto max-w-4xl space-y-5">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">QR発行</h1>
          <a href="/admin" className="text-xs underline">
            ダッシュボードへ
          </a>
        </header>

        <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
          ★印刷入稿前にURLスキームを確定させてください。QRは <code>{origin}/s/&lt;token&gt;</code>{" "}
          を指します。印刷後はトークンを変更できません（変えられるのは遷移先の中身だけです）。
          本番ドメインが決まっていない場合は <code>NEXT_PUBLIC_APP_URL</code> を設定してから発行します。
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => {
            const url = `${origin}/s/${item.token}`;
            return (
              <div key={item.token} className="flex gap-3 rounded-xl bg-white p-4 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/admin/qr/${item.token}`}
                  alt={`${item.label} のQRコード`}
                  width={112}
                  height={112}
                  className="h-28 w-28 shrink-0"
                />
                <div className="min-w-0 text-xs">
                  <div className="text-[10px] uppercase tracking-wider text-neutral-400">
                    {item.kind}
                  </div>
                  <div className="font-semibold">{item.label}</div>
                  <div className="mt-1 break-all text-neutral-500">{url}</div>
                  <a
                    className="mt-2 inline-block font-semibold underline"
                    href={`/admin/qr/${item.token}?download=1`}
                    download
                  >
                    PNGをダウンロード
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
