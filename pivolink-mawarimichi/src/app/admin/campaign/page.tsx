/**
 * キャンペーン設定・開催期間・スタートQR・スポンサーCM枠。
 *
 * ★この画面の存在理由は「第三者に渡せること」。
 *   PivoLink とまわりみちを渡せば、スクリプトを一度も叩かずに運用を始められる状態にする。
 */

import Link from "next/link";
import { redirect } from "next/navigation";

import {
  deleteSponsorAction,
  rebuildStartQrAction,
  saveCampaignAction,
  saveSponsorAction,
} from "@/app/admin/campaign/actions";
import { isAdmin } from "@/lib/admin";
import { BRANDING_DEFAULTS, brandingFormValues } from "@/lib/branding";
import { campaignToFormValues } from "@/lib/campaign-input";
import { getQrStatus, pivolinkConfigured, redirectOrigin } from "@/lib/pivolink-admin";
import { cmEntryUrl, listSponsors, EMPTY_SPONSOR, type Sponsor } from "@/lib/pivolink-campaign";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

const label = "block text-xs font-semibold text-neutral-700";
const input = "mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm";
const help = "mt-1 text-[11px] text-neutral-500";
const card = "rounded-xl bg-white p-5 shadow-sm";

export default async function CampaignPage({
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

  const v = campaignToFormValues(campaign);
  const bv = brandingFormValues(campaign);
  const configured = pivolinkConfigured();
  const startQr = configured ? await getQrStatus("start") : null;
  const sponsors = configured ? await listSponsors() : [];
  const editing: Sponsor =
    sponsors.find((s) => s.key === edit) ?? { ...EMPTY_SPONSOR, key: edit ?? "" };

  return (
    <main className="min-h-dvh bg-neutral-100 p-6 text-neutral-900">
      <div className="mx-auto max-w-3xl space-y-5">
        <header>
          <Link href="/admin" className="text-xs text-neutral-500 underline">
            ← ダッシュボードへ
          </Link>
          <h1 className="mt-2 text-xl font-semibold">キャンペーン設定</h1>
          <p className="mt-1 text-xs text-neutral-500">
            ここで保存すると、PivoLink 側の<b>開催期間ルールとスタートQR</b>も同時に作り直されます。
            スクリプトを叩く必要はありません。
          </p>
        </header>

        {ok ? <p className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">{ok}</p> : null}
        {error ? <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p> : null}
        {!configured ? (
          <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
            PivoLink の接続情報が未設定です。<Link href="/admin/setup" className="underline">セットアップ</Link>
            を先に済ませてください。
          </p>
        ) : null}

        {/* ---------------- 基本設定 + 開催期間 ---------------- */}
        <form action={saveCampaignAction} className="space-y-5">
          <section className={card}>
            <h2 className="text-sm font-semibold">基本</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label} htmlFor="name_ja">キャンペーン名（日本語）★必須</label>
                <input id="name_ja" name="name_ja" defaultValue={v.name_ja} required className={input} />
              </div>
              <div>
                <label className={label} htmlFor="name_en">キャンペーン名（英語）</label>
                <input id="name_en" name="name_en" defaultValue={v.name_en} className={input} />
              </div>
              <div>
                <label className={label} htmlFor="start_label_ja">スタート地点の名前（日本語）</label>
                <input id="start_label_ja" name="start_label_ja" defaultValue={v.start_label_ja} className={input} />
                <p className={help}>サイネージの設置場所。例: 京都駅ビル 観光案内所</p>
              </div>
              <div>
                <label className={label} htmlFor="start_label_en">スタート地点の名前（英語）</label>
                <input id="start_label_en" name="start_label_en" defaultValue={v.start_label_en} className={input} />
              </div>
            </div>
          </section>

          <section className={card}>
            <h2 className="text-sm font-semibold">スタート地点 ★回廊の起点</h2>
            <p className="mt-1 text-xs text-neutral-500">
              ここからの距離で「目的地に近づいているか」を判定します。ずれると全スポットの出方が変わります。
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label className={label} htmlFor="start_lat">緯度 ★必須</label>
                <input id="start_lat" name="start_lat" defaultValue={v.start_lat} required inputMode="decimal" className={input} />
              </div>
              <div>
                <label className={label} htmlFor="start_lng">経度 ★必須</label>
                <input id="start_lng" name="start_lng" defaultValue={v.start_lng} required inputMode="decimal" className={input} />
              </div>
              <div>
                <label className={label} htmlFor="stamp_target">寄り道の数</label>
                <input id="stamp_target" name="stamp_target" type="number" min="1" max="12" defaultValue={v.stamp_target} className={input} />
                <p className={help}>この数だけ「開いている場所」が要ります</p>
              </div>
              <div>
                <label className={label} htmlFor="detour_tolerance_m">寄り道の許容距離（m）</label>
                <input id="detour_tolerance_m" name="detour_tolerance_m" type="number" min="0" max="5000" defaultValue={v.detour_tolerance_m} className={input} />
                <p className={help}>大きいほど遠回りを許す。既定220m</p>
              </div>
              <div>
                <label className={label} htmlFor="cm_frequency_cap">CMの頻度（スタンプN個ごと）</label>
                <input id="cm_frequency_cap" name="cm_frequency_cap" type="number" min="0" max="20" defaultValue={v.cm_frequency_cap} className={input} />
                <p className={help}>0でCMなし。1個目には出しません</p>
              </div>
            </div>
          </section>

          <section className={card}>
            <h2 className="text-sm font-semibold">開催期間 ★PivoLinkが自動で切り替えます</h2>
            <p className="mt-1 text-xs leading-relaxed text-neutral-600">
              <b>現地の看板・チラシを一度も触らずに</b>、開始日に体験がひらき、終了日に閉じます。
              開始前は「まだ始まっていません」、終了後は「お礼」の画面へ、
              PivoLink の<b>期間指定</b>と<b>予約切替</b>ルールが全QRを振り替えます。
              <br />
              両方空にすると期間ルールを外して常時公開になります。
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label} htmlFor="starts_at">開始日時（JST）</label>
                <input id="starts_at" name="starts_at" type="datetime-local" defaultValue={v.starts_at} className={input} />
              </div>
              <div>
                <label className={label} htmlFor="ends_at">終了日時（JST）</label>
                <input id="ends_at" name="ends_at" type="datetime-local" defaultValue={v.ends_at} className={input} />
              </div>
            </div>
          </section>


          <section className={card}>
            <h2 className="text-sm font-semibold">見た目と語り口 ★別の街で動かすところ</h2>
            <p className="mt-1 text-xs leading-relaxed text-neutral-600">
              スタート画面の見出しと、ナビゲーターの名前・台詞・画像を差し替えられます。
              <b>空欄にすると既定（京都モデル）の文言に戻ります</b>ので、変えたいところだけ入れてください。
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={label} htmlFor="hero_title_ja">見出し（日本語）</label>
                <textarea id="hero_title_ja" name="hero_title_ja" defaultValue={bv.hero_title_ja} rows={2} className={input} placeholder="目的地は、あなたが決める。&#10;道のりは、京都が決める。" />
                <p className={help}>改行するとそのまま2行で出ます</p>
              </div>
              <div className="sm:col-span-2">
                <label className={label} htmlFor="hero_title_en">見出し（英語）</label>
                <textarea id="hero_title_en" name="hero_title_en" defaultValue={bv.hero_title_en} rows={2} className={input} />
              </div>
              <div className="sm:col-span-2">
                <label className={label} htmlFor="hero_tagline_ja">見出しの下の説明（日本語）</label>
                <textarea id="hero_tagline_ja" name="hero_tagline_ja" defaultValue={bv.hero_tagline_ja} rows={2} className={input} />
              </div>
              <div className="sm:col-span-2">
                <label className={label} htmlFor="hero_tagline_en">見出しの下の説明（英語）</label>
                <textarea id="hero_tagline_en" name="hero_tagline_en" defaultValue={bv.hero_tagline_en} rows={2} className={input} />
              </div>
              <div className="sm:col-span-2">
                <label className={label} htmlFor="hero_og_image_url">SNSに貼ったときの画像URL</label>
                <input id="hero_og_image_url" name="hero_og_image_url" defaultValue={bv.hero_og_image_url} className={input} placeholder={BRANDING_DEFAULTS.og} />
                <p className={help}>1200×630。LINEやSNSにURLを貼ったときのサムネイルです</p>
              </div>
              <div>
                <label className={label} htmlFor="hero_seal">印の文字（1〜2字）</label>
                <input id="hero_seal" name="hero_seal" defaultValue={bv.hero_seal} maxLength={2} className={input} placeholder={BRANDING_DEFAULTS.seal} />
                <p className={help}>スタート画面の朱印に入ります。空欄なら「{BRANDING_DEFAULTS.seal}」</p>
              </div>
            </div>

            <div className="mt-6 border-t border-neutral-200 pt-5">
              <h3 className="text-xs font-semibold">ナビゲーター</h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={label} htmlFor="navi_name_ja">名前（日本語）</label>
                  <input id="navi_name_ja" name="navi_name_ja" defaultValue={bv.navi_name_ja} className={input} placeholder="案内役・ルル" />
                </div>
                <div>
                  <label className={label} htmlFor="navi_name_en">名前（英語）</label>
                  <input id="navi_name_en" name="navi_name_en" defaultValue={bv.navi_name_en} className={input} placeholder="Ruru, your guide" />
                </div>
                <div className="sm:col-span-2">
                  <label className={label} htmlFor="navi_intro_ja">はじめの一言（日本語）</label>
                  <textarea id="navi_intro_ja" name="navi_intro_ja" defaultValue={bv.navi_intro_ja} rows={3} className={input} />
                  <p className={help}>目的地を選ぶ前に出ます</p>
                </div>
                <div className="sm:col-span-2">
                  <label className={label} htmlFor="navi_intro_en">はじめの一言（英語）</label>
                  <textarea id="navi_intro_en" name="navi_intro_en" defaultValue={bv.navi_intro_en} rows={3} className={input} />
                </div>
                <div className="sm:col-span-2">
                  <label className={label} htmlFor="navi_outro_ja">到着したときの一言（日本語）</label>
                  <textarea id="navi_outro_ja" name="navi_outro_ja" defaultValue={bv.navi_outro_ja} rows={3} className={input} />
                </div>
                <div className="sm:col-span-2">
                  <label className={label} htmlFor="navi_outro_en">到着したときの一言（英語）</label>
                  <textarea id="navi_outro_en" name="navi_outro_en" defaultValue={bv.navi_outro_en} rows={3} className={input} />
                </div>
                <div className="sm:col-span-2">
                  <label className={label} htmlFor="navi_note_ja">キャラクターについての注記（日本語）</label>
                  <input id="navi_note_ja" name="navi_note_ja" defaultValue={bv.navi_note_ja} className={input} />
                  <p className={help}>スタート画面の一番下の小さい文字。権利表記などに使えます</p>
                </div>
                <div className="sm:col-span-2">
                  <label className={label} htmlFor="navi_note_en">キャラクターについての注記（英語）</label>
                  <input id="navi_note_en" name="navi_note_en" defaultValue={bv.navi_note_en} className={input} />
                </div>

                <div>
                  <label className={label} htmlFor="navi_face_url">顔アイコンのURL</label>
                  <input id="navi_face_url" name="navi_face_url" defaultValue={bv.navi_face_url} className={input} placeholder={BRANDING_DEFAULTS.face} />
                  <p className={help}>正方形の透過画像。チャットの吹き出しの横に出ます</p>
                </div>
                <div>
                  <label className={label} htmlFor="navi_standing_url">立ち絵のURL</label>
                  <input id="navi_standing_url" name="navi_standing_url" defaultValue={bv.navi_standing_url} className={input} placeholder={BRANDING_DEFAULTS.standing} />
                  <p className={help}>縦長の透過画像。スタート画面に立ちます</p>
                </div>
                <div className="sm:col-span-2 flex flex-wrap items-center gap-4 rounded-lg bg-neutral-50 p-3">
                  <span className="text-[11px] text-neutral-500">いま出ている画像：</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bv.navi_face_url || BRANDING_DEFAULTS.face} alt="顔アイコン" width={48} height={48} className="rounded-full border border-neutral-300 bg-white" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bv.navi_standing_url || BRANDING_DEFAULTS.standing} alt="立ち絵" height={90} className="h-[90px] w-auto" />
                  <p className="text-[11px] text-neutral-500">
                    ★<b>画像はアップロードできません。</b><code>public/navi/</code> に置いたファイルの相対パスか、
                    https のURLを入れてください
                  </p>
                </div>
              </div>
            </div>
          </section>

          <button type="submit" className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white">
            設定を保存して PivoLink に反映
          </button>
        </form>

        {/* ---------------- スタートQR ---------------- */}
        <section className={card}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">スタートQR（キャンペーンの入口）</h2>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                startQr?.registered ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
              }`}
            >
              {startQr?.registered ? "PivoLink 登録済み" : "PivoLink 未登録"}
            </span>
          </div>
          <p className="mt-2 break-all rounded-lg bg-neutral-900 p-3 font-mono text-xs text-white">
            {`${redirectOrigin()}/r/mawarimichi-start`}
          </p>
          <p className={help}>
            観光案内所などに置くサイネージ用。<b>このURLをQRにしてください。</b>
            朝・夕は時間帯ルールで顔が変わり、昼はA/Bテストで毎回違う道になります。
          </p>
          {startQr?.rules.length ? (
            <ul className="mt-3 space-y-1">
              {startQr.rules.map((r, i) => (
                <li key={i} className="flex flex-wrap items-baseline gap-2 text-[11px]">
                  <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-neutral-600">{r.type}</span>
                  <span className="text-neutral-700">{r.name}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            <form action={rebuildStartQrAction}>
              <button type="submit" className="rounded-lg border border-neutral-300 px-4 py-2 font-semibold">
                スタートQRのルールを作り直す
              </button>
            </form>
            <a href={`/admin/qr/${campaign.start_qr_token}?download=1`} className="rounded-lg bg-neutral-900 px-4 py-2 font-semibold text-white">
              QR画像をダウンロード
            </a>
            {startQr?.dashboardUrl ? (
              <a href={startQr.dashboardUrl} target="_blank" rel="noreferrer" className="underline text-neutral-600">
                PivoLinkのダッシュボードで編集 ↗
              </a>
            ) : null}
          </div>
        </section>

        {/* ---------------- スポンサーCM枠 ---------------- */}
        <section className={card}>
          <h2 className="text-sm font-semibold">スポンサーCM枠</h2>
          <p className="mt-1 text-xs leading-relaxed text-neutral-600">
            広告そのものは <b>PivoLink のクッションページ</b>です。ここで作った枠に、
            PivoLink の<b>A/Bテスト</b>が均等に振り分けます。表示回数は PivoLink のアナリティクスに乗ります。
            <br />
            出るのは<b>スタンプ獲得の直後だけ</b>（1個目には出しません）。
            目的地選択前やスポット閲覧前には絶対に挟みません。
          </p>
          <p className="mt-3 break-all rounded-lg bg-neutral-50 p-2 font-mono text-[11px] text-neutral-600">
            入口URL（env <code>MAWARIMICHI_CM_URL</code> に設定）: {cmEntryUrl()}
          </p>

          {sponsors.length ? (
            <ul className="mt-4 divide-y divide-neutral-100">
              {sponsors.map((s) => (
                <li key={s.key} className="flex flex-wrap items-center gap-3 py-2 text-xs">
                  <span
                    className="inline-block size-5 rounded"
                    style={{ background: s.background, border: `2px solid ${s.accent}` }}
                  />
                  <span className="font-semibold">{s.name || s.key}</span>
                  <span className="text-neutral-500">「{s.title}」{s.seconds}秒</span>
                  {s.couponCode ? (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-amber-800">{s.couponCode}</span>
                  ) : null}
                  {!s.active ? <span className="text-red-600">停止中</span> : null}
                  <Link href={`/admin/campaign?edit=${s.key}`} className="ml-auto underline text-neutral-600">
                    編集
                  </Link>
                  <form action={deleteSponsorAction}>
                    <input type="hidden" name="key" value={s.key} />
                    <button type="submit" className="text-red-600 underline">削除</button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-lg bg-neutral-50 p-3 text-xs text-neutral-600">
              CM枠がありません。枠が0件のあいだはCMを挟みません。
            </p>
          )}

          <form action={saveSponsorAction} className="mt-5 space-y-4 rounded-xl border border-neutral-200 p-4">
            <h3 className="text-xs font-semibold">{edit ? `CM枠を編集：${edit}` : "CM枠を追加"}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label} htmlFor="key">枠ID ★必須</label>
                <input id="key" name="key" defaultValue={editing.key} required readOnly={Boolean(edit)} className={input} placeholder="a" />
                <p className={help}>半角英小文字・数字。後から変えないこと</p>
              </div>
              <div>
                <label className={label} htmlFor="name">スポンサー名</label>
                <input id="name" name="name" defaultValue={editing.name} className={input} />
              </div>
              <div className="sm:col-span-2">
                <label className={label} htmlFor="title">見出し</label>
                <input id="title" name="title" defaultValue={editing.title} className={input} />
              </div>
              <div className="sm:col-span-2">
                <label className={label} htmlFor="message">本文</label>
                <textarea id="message" name="message" defaultValue={editing.message} rows={4} className={input} />
                <p className={help}>改行できます。広告表記が必要な場合はここに明記してください</p>
              </div>
              <div>
                <label className={label} htmlFor="buttonText">ボタンの文言</label>
                <input id="buttonText" name="buttonText" defaultValue={editing.buttonText} className={input} />
              </div>
              <div>
                <label className={label} htmlFor="seconds">表示秒数</label>
                <input id="seconds" name="seconds" type="number" min="0" max="60" defaultValue={editing.seconds} className={input} />
                <p className={help}>この秒数が過ぎるとスキップできます</p>
              </div>
              <div>
                <label className={label} htmlFor="background">背景色</label>
                <input id="background" name="background" type="color" defaultValue={editing.background} className="mt-1 h-10 w-full rounded-lg border border-neutral-300" />
              </div>
              <div>
                <label className={label} htmlFor="textColor">文字色</label>
                <input id="textColor" name="textColor" type="color" defaultValue={editing.textColor} className="mt-1 h-10 w-full rounded-lg border border-neutral-300" />
              </div>
              <div>
                <label className={label} htmlFor="accent">アクセント色</label>
                <input id="accent" name="accent" type="color" defaultValue={editing.accent} className="mt-1 h-10 w-full rounded-lg border border-neutral-300" />
              </div>
              <div>
                <label className={label} htmlFor="couponCode">クーポンコード（任意）</label>
                <input id="couponCode" name="couponCode" defaultValue={editing.couponCode} className={input} />
              </div>
              <div className="sm:col-span-2">
                <label className={label} htmlFor="couponNote">クーポンの注記</label>
                <input id="couponNote" name="couponNote" defaultValue={editing.couponNote} className={input} />
              </div>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" name="active" defaultChecked={editing.active} />
                この枠を配信する
              </label>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white">
                {edit ? "この枠を保存" : "枠を追加"}
              </button>
              {edit ? (
                <Link href="/admin/campaign" className="text-sm text-neutral-500 underline">
                  新規追加にもどる
                </Link>
              ) : null}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
