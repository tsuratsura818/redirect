/**
 * セットアップ確認。
 *
 * ★第三者が PivoLink とまわりみちを受け取って自分で始めるための入口。
 *   「何が足りていて、何が足りないか」を1画面で分かるようにする。
 *   ここに書いていない手順を必要としない状態を保つこと（スクリプトを前提にしない）。
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

import Link from "next/link";
import { redirect } from "next/navigation";

import { isAdmin } from "@/lib/admin";
import { pivolinkConfigured, redirectOrigin } from "@/lib/pivolink-admin";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

interface Check {
  name: string;
  ok: boolean;
  detail: string;
  how: string;
}

export default async function SetupPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const store = getStore();
  const slug = process.env.NEXT_PUBLIC_DEFAULT_CAMPAIGN ?? "kyoto-higashiyama";
  const campaign = await store.getCampaignBySlug(slug);
  const goals = campaign ? await store.listGoals(campaign.id, { includeInactive: true }) : [];
  const spots = campaign ? await store.listSpots(campaign.id, { includeInactive: true }) : [];

  const checks: Check[] = [
    {
      name: "データベース（Supabase）",
      ok: store.kind === "supabase",
      detail:
        store.kind === "supabase"
          ? "接続できています"
          : `${store.kind} モードで動いています。保存しても消えます`,
      how: "NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定し、下のSQLを Supabase の SQL Editor で実行してください",
    },
    {
      name: "アプリのURL",
      ok: Boolean(process.env.NEXT_PUBLIC_APP_URL),
      detail: process.env.NEXT_PUBLIC_APP_URL ?? "未設定",
      how: "NEXT_PUBLIC_APP_URL に本番URL（https://…）を設定してください。PivoLink の遷移先の組み立てに使います",
    },
    {
      name: "管理画面のパスワード",
      ok: Boolean(process.env.ADMIN_PASSWORD),
      detail: process.env.ADMIN_PASSWORD ? "設定済み" : "未設定",
      how: "ADMIN_PASSWORD を設定してください。未設定の本番は常に拒否されます（fail-closed）",
    },
    {
      name: "QRトークンの署名鍵",
      ok: Boolean(process.env.QR_TOKEN_SECRET),
      detail: process.env.QR_TOKEN_SECRET ? "設定済み" : "未設定",
      how: "QR_TOKEN_SECRET にランダムな文字列を設定してください。匿名セッションcookieの署名に使います",
    },
    {
      name: "PivoLink との接続",
      ok: pivolinkConfigured(),
      detail: pivolinkConfigured()
        ? `${redirectOrigin()} に接続できています`
        : "未設定。QRの登録とルール生成ができません",
      how: "PIVOLINK_SUPABASE_URL / PIVOLINK_SUPABASE_SERVICE_ROLE_KEY / PIVOLINK_OWNER_EMAIL / PIVOLINK_REDIRECT_ORIGIN を設定してください",
    },
    {
      name: "スポンサーCMの入口",
      ok: Boolean(process.env.MAWARIMICHI_CM_URL),
      detail: process.env.MAWARIMICHI_CM_URL ?? "未設定（CMは出ません）",
      how: "MAWARIMICHI_CM_URL に PivoLink のCM入口URLを設定してください。CMを使わないなら未設定のままで構いません",
    },
    {
      name: "目的地",
      ok: goals.length > 0,
      detail: `${goals.length}件`,
      how: "「目的地」の画面から1件以上追加してください。0件だと参加者が先へ進めません",
    },
    {
      name: "寄り道スポット",
      ok: spots.length >= (campaign?.stamp_target ?? 5),
      detail: `${spots.length}件（寄り道の数は${campaign?.stamp_target ?? 5}）`,
      how: "ダッシュボードの「スポットを追加」から、寄り道の数より多く登録してください",
    },
    {
      name: "開催期間",
      ok: Boolean(campaign?.starts_at || campaign?.ends_at),
      detail:
        campaign?.starts_at || campaign?.ends_at
          ? "設定済み（PivoLinkが自動で切り替えます）"
          : "未設定（常時公開）",
      how: "「キャンペーン設定」の画面から開始・終了日時を入れてください。任意です",
    },
  ];

  const ng = checks.filter((c) => !c.ok);

  // 初回セットアップ用SQL。ファイルが読めない環境（Edge等）では手順だけ出す
  let sql = "";
  try {
    sql = await readFile(
      path.join(process.cwd(), "supabase/migrations/ALL-IN-ONE.sql"),
      "utf-8",
    );
  } catch {
    sql = "";
  }

  return (
    <main className="min-h-dvh bg-neutral-100 p-6 text-neutral-900">
      <div className="mx-auto max-w-3xl space-y-5">
        <header>
          <Link href="/admin" className="text-xs text-neutral-500 underline">
            ← ダッシュボードへ
          </Link>
          <h1 className="mt-2 text-xl font-semibold">セットアップ</h1>
          <p className="mt-1 text-xs text-neutral-500">
            PivoLink とまわりみちだけで運用を始めるための確認です。
            スクリプトを実行しなくても、この画面と各管理画面だけで完結します。
          </p>
        </header>

        <section className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">状態</h2>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                ng.length ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {ng.length ? `${ng.length}件 未完了` : "すべて完了"}
            </span>
          </div>
          <ul className="mt-4 divide-y divide-neutral-100">
            {checks.map((c) => (
              <li key={c.name} className="py-3">
                <div className="flex items-baseline gap-2 text-sm">
                  <span className={c.ok ? "text-emerald-600" : "text-amber-600"}>
                    {c.ok ? "✓" : "!"}
                  </span>
                  <span className="font-semibold">{c.name}</span>
                  <span className="ml-auto break-all text-[11px] text-neutral-500">{c.detail}</span>
                </div>
                {!c.ok ? (
                  <p className="mt-1 pl-5 text-[11px] leading-relaxed text-neutral-600">{c.how}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold">手順</h2>
          <ol className="mt-3 space-y-3 text-xs leading-relaxed text-neutral-700">
            <li>
              <b>1. Supabase を用意する。</b>プロジェクトを作り、下のSQLを SQL Editor に貼って実行します。
              何度実行しても壊れません。
            </li>
            <li>
              <b>2. 環境変数を入れる。</b>上の一覧で「未完了」のものを設定します。
            </li>
            <li>
              <b>3. PivoLink にログインしておく。</b>QRとルールはまわりみち側から自動で作られますが、
              微調整とアナリティクスは{" "}
              <a href={`${redirectOrigin()}/dashboard/qr`} target="_blank" rel="noreferrer" className="underline">
                PivoLinkのダッシュボード
              </a>{" "}
              で行います。
            </li>
            <li>
              <b>4. <Link href="/admin/campaign" className="underline">キャンペーン設定</Link></b>{" "}
              でスタート地点・寄り道の数・開催期間を入れて保存。
              保存した時点でスタートQRと期間ルールが PivoLink に作られます。
            </li>
            <li>
              <b>5. <Link href="/admin/goals" className="underline">目的地</Link></b> を登録。
            </li>
            <li>
              <b>6. <Link href="/admin/spots/new" className="underline">寄り道スポット</Link></b> を登録。
              保存するたびに PivoLink のQRと時間帯ルール・A/Bテストが作られます。
            </li>
            <li>
              <b>7. QR画像を出して現地に貼る。</b>各スポットの編集画面からダウンロードできます。
              焼かれるのは PivoLink の <code>/r/</code> URLなので、あとから遷移先を変えられます。
            </li>
          </ol>
        </section>

        {sql ? (
          <section className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold">初回セットアップSQL</h2>
            <p className={"mt-1 text-[11px] text-neutral-500"}>
              Supabase の SQL Editor に貼り付けて実行してください（冪等）。
            </p>
            <textarea
              readOnly
              value={sql}
              rows={14}
              className="mt-3 w-full rounded-lg border border-neutral-300 bg-neutral-50 p-3 font-mono text-[10px] leading-relaxed"
            />
          </section>
        ) : null}
      </div>
    </main>
  );
}
