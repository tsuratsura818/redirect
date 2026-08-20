/**
 * 目的地（ゴール）の管理。
 * ★参加者が最初に選ぶのがここ。目的地が無いとキャンペーンは成立しない。
 *   第三者が自分の町で始めるとき、最初に触る画面になる。
 */

import Link from "next/link";
import { redirect } from "next/navigation";

import { deleteGoalAction, saveGoalAction } from "@/app/admin/goals/actions";
import { isAdmin } from "@/lib/admin";
import { goalToFormValues } from "@/lib/goal-input";
import { hoursLabel } from "@/lib/hours";
import { getStore } from "@/lib/store";
import { tx, type Goal } from "@/lib/types";

export const dynamic = "force-dynamic";

const label = "block text-xs font-semibold text-neutral-700";
const input = "mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm";
const help = "mt-1 text-[11px] text-neutral-500";

const EMPTY = {
  slug: "", name_ja: "", name_en: "", subtitle_ja: "", subtitle_en: "",
  lat: "", lng: "", icon_char: "", open_from: "", open_to: "",
  sort_order: "0", active: true,
};

export default async function GoalsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string; edit?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { ok, error, edit } = await searchParams;

  const store = getStore();
  const slug = process.env.NEXT_PUBLIC_DEFAULT_CAMPAIGN ?? "kyoto-higashiyama";
  const campaign = await store.getCampaignBySlug(slug);
  if (!campaign) redirect("/admin?error=campaign");

  const goals = await store.listGoals(campaign.id, { includeInactive: true });
  const editing: Goal | undefined = goals.find((g) => g.id === edit);
  const v = editing ? goalToFormValues(editing) : EMPTY;

  return (
    <main className="min-h-dvh bg-neutral-100 p-6 text-neutral-900">
      <div className="mx-auto max-w-3xl space-y-5">
        <header>
          <Link href="/admin" className="text-xs text-neutral-500 underline">
            ← ダッシュボードへ
          </Link>
          <h1 className="mt-2 text-xl font-semibold">目的地</h1>
          <p className="mt-1 text-xs leading-relaxed text-neutral-500">
            参加者が最初に選ぶ「最後に行きたい場所」です。ここからの距離で回廊が決まるので、
            <b>座標がずれると全スポットの出方が変わります</b>。
            <br />
            目的地には現地QRを作りません（読ませるのはスタートと寄り道スポットだけ。
            目的地へは最終区間のナビで案内します）。
          </p>
        </header>

        {ok ? <p className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">{ok}</p> : null}
        {error ? <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p> : null}
        {store.kind !== "supabase" ? (
          <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">
            DB未接続（{store.kind}モード）のため、変更しても保存されません。
          </p>
        ) : null}

        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold">登録済み（{goals.length}件）</h2>
          {goals.length ? (
            <ul className="mt-3 divide-y divide-neutral-100">
              {goals.map((g) => (
                <li key={g.id} className="flex flex-wrap items-center gap-3 py-2.5 text-xs">
                  <span
                    className="grid size-8 place-items-center rounded-lg font-semibold text-white"
                    style={{ background: `linear-gradient(140deg, ${g.grad?.[0] ?? "#3A5E4A"}, ${g.grad?.[1] ?? "#7BA05B"})` }}
                  >
                    {g.icon_char}
                  </span>
                  <span>
                    <span className="font-semibold">{tx(g.name, "ja")}</span>
                    <span className="ml-2 text-neutral-400">{g.slug}</span>
                    <br />
                    <span className="text-neutral-500">
                      {g.lat.toFixed(4)}, {g.lng.toFixed(4)} ／ {hoursLabel(g.open_hours, "ja")}
                    </span>
                  </span>
                  {!g.active ? <span className="text-red-600">非公開</span> : null}
                  <Link href={`/admin/goals?edit=${g.id}`} className="ml-auto underline text-neutral-600">
                    編集
                  </Link>
                  <form action={deleteGoalAction}>
                    <input type="hidden" name="goalId" value={g.id} />
                    <button type="submit" className="text-red-600 underline">削除</button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">
              <b>目的地がありません。</b>1件も無いと参加者は先へ進めません。
            </p>
          )}
        </section>

        <form action={saveGoalAction} className="space-y-5">
          {editing ? <input type="hidden" name="goalId" value={editing.id} /> : null}

          <section className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold">
              {editing ? `編集：${tx(editing.name, "ja")}` : "目的地を追加"}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label} htmlFor="name_ja">目的地名（日本語）★必須</label>
                <input id="name_ja" name="name_ja" defaultValue={v.name_ja} required className={input} />
              </div>
              <div>
                <label className={label} htmlFor="name_en">目的地名（英語）</label>
                <input id="name_en" name="name_en" defaultValue={v.name_en} className={input} />
              </div>
              <div>
                <label className={label} htmlFor="slug">スラッグ ★必須</label>
                <input id="slug" name="slug" defaultValue={v.slug} required pattern="[a-z0-9][a-z0-9\-]{1,39}" className={input} />
                <p className={help}>半角英小文字・数字・ハイフン</p>
              </div>
              <div>
                <label className={label} htmlFor="icon_char">アイコン文字（1〜2字）</label>
                <input id="icon_char" name="icon_char" defaultValue={v.icon_char} maxLength={2} className={input} />
                <p className={help}>カードの左に出ます（例: 清 / 八 / 錦）</p>
              </div>
              <div>
                <label className={label} htmlFor="subtitle_ja">ひとこと（日本語）</label>
                <input id="subtitle_ja" name="subtitle_ja" defaultValue={v.subtitle_ja} className={input} />
                <p className={help}>例: 定番へ、定番じゃない道から</p>
              </div>
              <div>
                <label className={label} htmlFor="subtitle_en">ひとこと（英語）</label>
                <input id="subtitle_en" name="subtitle_en" defaultValue={v.subtitle_en} className={input} />
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold">場所と拝観時間</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label className={label} htmlFor="lat">緯度 ★必須</label>
                <input id="lat" name="lat" defaultValue={v.lat} required inputMode="decimal" placeholder="34.9949" className={input} />
              </div>
              <div>
                <label className={label} htmlFor="lng">経度 ★必須</label>
                <input id="lng" name="lng" defaultValue={v.lng} required inputMode="decimal" placeholder="135.7850" className={input} />
              </div>
              <div>
                <label className={label} htmlFor="sort_order">並び順</label>
                <input id="sort_order" name="sort_order" type="number" defaultValue={v.sort_order} className={input} />
              </div>
              <div>
                <label className={label} htmlFor="open_from">拝観 開始（時）</label>
                <input id="open_from" name="open_from" type="number" min="0" max="23" defaultValue={v.open_from} className={input} placeholder="6" />
              </div>
              <div>
                <label className={label} htmlFor="open_to">拝観 終了（時）</label>
                <input id="open_to" name="open_to" type="number" min="1" max="24" defaultValue={v.open_to} className={input} placeholder="18" />
              </div>
              <p className={`${help} sm:pt-6`}>
                両方空なら終日。終了後は目的地選択の画面で「本日の拝観は終了しています」と出ます
              </p>
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" defaultChecked={v.active} />
              公開する（外すと参加者に出ません）
            </label>
          </section>

          <div className="flex items-center gap-3">
            <button type="submit" className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white">
              {editing ? "変更を保存" : "目的地を追加"}
            </button>
            {editing ? (
              <Link href="/admin/goals" className="text-sm text-neutral-500 underline">
                新規追加にもどる
              </Link>
            ) : null}
          </div>
        </form>
      </div>
    </main>
  );
}
