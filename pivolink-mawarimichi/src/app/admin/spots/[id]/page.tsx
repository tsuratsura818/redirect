import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { deleteSpotAction, saveSpotAction } from "@/app/admin/spots/actions";
import { SpotForm } from "@/components/SpotForm";
import { isAdmin } from "@/lib/admin";
import { getQrStatus } from "@/lib/pivolink-admin";
import { getStore } from "@/lib/store";
import { tx } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditSpotPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const { error } = await searchParams;

  const store = getStore();
  const spot = await store.getSpot(id);
  if (!spot) notFound();

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const pv = await getQrStatus(spot.slug);

  return (
    <main className="min-h-dvh bg-neutral-100 p-6 text-neutral-900">
      <div className="mx-auto max-w-3xl space-y-5">
        <header>
          <Link href="/admin" className="text-xs text-neutral-500 underline">
            ← ダッシュボードへ
          </Link>
          <h1 className="mt-2 text-xl font-semibold">{tx(spot.name, "ja")}</h1>
          <p className="mt-1 text-xs text-neutral-500">
            スラッグ <code>{spot.slug}</code> ／ QRトークン <code>{spot.qr_token}</code>
          </p>
        </header>

        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">現地に貼るQR（PivoLink）</h2>
            {pv.registered ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                PivoLink 登録済み
              </span>
            ) : (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-800">
                PivoLink 未登録
              </span>
            )}
          </div>

          <p className="mt-2 text-xs leading-relaxed text-neutral-600">
            <b>看板・シールに焼くのはこのURLです。</b>アプリの直URLを刷ると、時間帯・A/Bテスト・
            開催期間・スポンサーCMがすべて素通りになり、しかも<b>後から遷移先を変えられません</b>
            （＝刷り直しになります）。
          </p>

          <p className="mt-3 break-all rounded-lg bg-neutral-900 p-3 font-mono text-xs text-white">
            {pv.redirectUrl}
          </p>
          <p className="mt-1 break-all text-[11px] text-neutral-400">
            PivoLinkが指している先: <code>{pv.destination ?? `${origin}/s/${spot.qr_token}`}</code>
          </p>

          {!pv.configured ? (
            <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
              PivoLink の接続情報（<code>PIVOLINK_SUPABASE_URL</code> ほか）が未設定のため、
              この画面からは登録できません。env を入れるか、
              <code>_create-mawarimichi-rules.mjs</code> を手で実行してください。
            </p>
          ) : !pv.registered ? (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-800">
              <b>まだPivoLinkにQRがありません。</b>このスポットは現地QRから開けず、
              時間帯もA/Bテストも効きません。下の「変更を保存」を押すと自動で登録されます。
            </p>
          ) : null}

          {pv.error ? (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-800">
              PivoLink を読めませんでした: {pv.error}
            </p>
          ) : null}

          {pv.rules.length ? (
            <div className="mt-4">
              <div className="text-xs font-semibold text-neutral-700">
                PivoLink 側のルール（{pv.rules.length}件）
              </div>
              <ul className="mt-2 space-y-1">
                {pv.rules.map((r, i) => (
                  <li key={i} className="flex flex-wrap items-baseline gap-2 text-[11px]">
                    <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-neutral-600">
                      {r.type}
                    </span>
                    <span className="text-neutral-700">{r.name}</span>
                    <span className="break-all text-neutral-400">
                      → {r.destination.replace(/^https?:\/\/[^/]+/, "")}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-neutral-500">
                ★<b>営業時間を変えて保存すると、この時間帯ルールも自動で作り直されます。</b>
                手でスクリプトを回す必要はありません。
              </p>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            <a
              href={`/admin/qr/${spot.qr_token}?download=1`}
              className="rounded-lg bg-neutral-900 px-4 py-2 font-semibold text-white"
            >
              QR画像をダウンロード
            </a>
            <a href={`/admin/qr/${spot.qr_token}`} target="_blank" rel="noreferrer" className="underline text-neutral-600">
              画像を開く
            </a>
            {pv.dashboardUrl ? (
              <a href={pv.dashboardUrl} target="_blank" rel="noreferrer" className="underline text-neutral-600">
                PivoLinkのダッシュボードで編集 ↗
              </a>
            ) : null}
          </div>
        </section>

        {store.kind !== "supabase" ? (
          <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">
            DB未接続（{store.kind}モード）のため、変更しても保存されません。
          </p>
        ) : null}
        {error ? <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p> : null}

        <SpotForm action={saveSpotAction} spot={spot} submitLabel="変更を保存" />

        <section className="rounded-xl border border-red-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-red-700">削除</h2>
          <p className="mt-1 text-xs text-neutral-600">
            <b>スキャン履歴があるスポットは削除できません</b>（実績が消えるため）。
            運用から外したいだけなら、上の「公開する」を外してください。
          </p>
          <form action={deleteSpotAction} className="mt-3">
            <input type="hidden" name="spotId" value={spot.id} />
            <button type="submit" className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700">
              このスポットを削除
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
