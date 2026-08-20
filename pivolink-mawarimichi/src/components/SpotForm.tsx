/**
 * スポットの追加・編集フォーム（管理画面）。
 * 新規と編集で同じ形を使う。緯度経度はルーティングの根幹なので必須。
 */

import { MEAL_BANDS, mealLabel } from "@/lib/meal";
import { toFormValues } from "@/lib/spot-input";
import type { Spot } from "@/lib/types";

const CONGESTION = ["0 — 空き ◎", "1 — 空き ○", "2 — やや混雑"];

/** 食べどきの時間帯。routing_rules の meal_bands と揃えた表示用ラベル */
const MEAL_HOURS: Record<string, string> = {
  morning: "7〜10時",
  lunch: "11〜14時",
  snack: "14〜17時",
  dinner: "17〜21時",
};

const EMPTY = {
  slug: "",
  name_ja: "", name_en: "",
  area_ja: "", area_en: "",
  story_ja: "", story_en: "",
  navi_ja: "", navi_en: "",
  coupon_ja: "", coupon_en: "",
  lat: "", lng: "",
  kanji: "",
  walk_min: "",
  capacity_weight: "1",
  congestion_level: "1",
  image_url: "",
  map_url: "",
  meal_times: [] as string[],
  open_from: "",
  open_to: "",
  is_collab: false,
  active: true,
};

const label = "block text-xs font-semibold text-neutral-700";
const input = "mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm";
const help = "mt-1 text-[11px] text-neutral-500";

export function SpotForm({
  action,
  spot,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  spot?: Spot;
  submitLabel: string;
}) {
  const v = spot ? toFormValues(spot) : EMPTY;

  return (
    <form action={action} className="space-y-6" id="spot-form">
      {spot ? <input type="hidden" name="spotId" value={spot.id} /> : null}

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold">基本</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="name_ja">スポット名（日本語）★必須</label>
            <input id="name_ja" name="name_ja" defaultValue={v.name_ja} required className={input} />
          </div>
          <div>
            <label className={label} htmlFor="name_en">スポット名（英語）</label>
            <input id="name_en" name="name_en" defaultValue={v.name_en} className={input} />
          </div>
          <div>
            <label className={label} htmlFor="slug">スラッグ ★必須</label>
            <input id="slug" name="slug" defaultValue={v.slug} required pattern="[a-z0-9][a-z0-9\-]{1,39}" className={input} />
            <p className={help}>半角英小文字・数字・ハイフン。QRのURLに使われるので後から変えないこと</p>
          </div>
          <div>
            <label className={label} htmlFor="kanji">スタンプの文字（1〜2字）</label>
            <input id="kanji" name="kanji" defaultValue={v.kanji} maxLength={2} className={input} />
            <p className={help}>朱印風スタンプの中央に入ります（例: 空 / 庭 / 縁）</p>
          </div>
          <div>
            <label className={label} htmlFor="area_ja">エリア表記（日本語）</label>
            <input id="area_ja" name="area_ja" defaultValue={v.area_ja} className={input} />
            <p className={help}>例: 東山・清水寺から徒歩10分</p>
          </div>
          <div>
            <label className={label} htmlFor="area_en">エリア表記（英語）</label>
            <input id="area_en" name="area_en" defaultValue={v.area_en} className={input} />
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold">場所 ★ルーティングの根幹</h2>
        <p className="mt-1 text-xs text-neutral-500">
          緯度・経度から「目的地への回廊」に入るかどうかを判定します。ここが間違っていると、
          そのスポットは二択に出ないか、逆に遠すぎる場所へ誘導してしまいます。
          Googleマップで地点を右クリック → 座標をコピー、で取れます。
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={label} htmlFor="lat">緯度 ★必須</label>
            <input id="lat" name="lat" defaultValue={v.lat} required inputMode="decimal" placeholder="34.9970" className={input} />
          </div>
          <div>
            <label className={label} htmlFor="lng">経度 ★必須</label>
            <input id="lng" name="lng" defaultValue={v.lng} required inputMode="decimal" placeholder="135.7721" className={input} />
          </div>
          <div>
            <label className={label} htmlFor="walk_min">徒歩分（任意）</label>
            <input id="walk_min" name="walk_min" defaultValue={v.walk_min} inputMode="numeric" className={input} />
            <p className={help}>空なら距離から自動計算</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold">読ませる中身</h2>
        <p className="mt-1 text-xs text-neutral-500">
          地図ではなく「そこに立ち止まる理由」を渡す部分です。ここが弱いと提示無視率が上がります。
        </p>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={label} htmlFor="story_ja">物語（日本語）</label>
            <textarea id="story_ja" name="story_ja" defaultValue={v.story_ja} rows={4} className={input} />
          </div>
          <div>
            <label className={label} htmlFor="story_en">物語（英語）</label>
            <textarea id="story_en" name="story_en" defaultValue={v.story_en} rows={3} className={input} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="navi_ja">ナビキャラの一言（日本語）</label>
              <textarea id="navi_ja" name="navi_ja" defaultValue={v.navi_ja} rows={3} className={input} />
            </div>
            <div>
              <label className={label} htmlFor="navi_en">ナビキャラの一言（英語）</label>
              <textarea id="navi_en" name="navi_en" defaultValue={v.navi_en} rows={3} className={input} />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold">写真・地図</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="image_url">写真URL</label>
            <input id="image_url" name="image_url" defaultValue={v.image_url} className={input} placeholder="/spots/xxx.webp または https://..." />
            <p className={help}>空なら色面＋スタンプ文字で表示されます（現地写真が入るまでの状態）</p>
          </div>
          <div>
            <label className={label} htmlFor="map_url">デジタルマップURL</label>
            <input id="map_url" name="map_url" type="url" defaultValue={v.map_url} className={input} placeholder="https://..." />
            <p className={help}>
              ★<b>その1地点だけを開くURL</b>に限ります。全スポットが載った回遊マップを入れると、
              次の行き先が一覧で見えてしまい分散の仕組みが無効になります
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold">開いている時間 ★事故が起きやすい所</h2>
        <p className="mt-1 text-xs text-neutral-500">
          この時間の外では、このスポットは<b>ほぼ提示されなくなります</b>（重み0.05倍）。
          さらに<b>閉まる1時間前からは0.4倍</b>に下げます — 次のスポットまで徒歩5〜12分かかるので、
          「向かっている途中で閉まる」のを防ぐためです。
          <br />
          <b>終日入れる場所（屋外の社・通り・商店街）は両方とも空</b>にしてください。
          ここを間違えると、分散のために送った先が閉まっているという、
          最短ルートより悪い体験になります。
        </p>
        <div className="mt-4 flex items-end gap-3">
          <div>
            <label className={label} htmlFor="open_from">開く（時）</label>
            <input id="open_from" name="open_from" defaultValue={v.open_from} type="number" min="0" max="23" className={`${input} w-28`} placeholder="9" />
          </div>
          <span className="pb-2 text-sm text-neutral-400">〜</span>
          <div>
            <label className={label} htmlFor="open_to">閉まる（時）</label>
            <input id="open_to" name="open_to" defaultValue={v.open_to} type="number" min="1" max="24" className={`${input} w-28`} placeholder="17" />
          </div>
          <p className="pb-2 text-[11px] text-neutral-500">
            例: 9〜17 なら 9:00〜17:00。17:00 ちょうどはもう閉まっている扱いです
          </p>
        </div>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold">食べどき（飲食スポットのみ）</h2>
        <p className="mt-1 text-xs text-neutral-500">
          チェックした時間帯だけ、この店が二択に出やすくなります（重み2.0倍）。
          <b>時間帯の外では0.25倍に下がる</b>ので、朝に居酒屋、夜に喫茶店を提示してしまう事故を防げます。
          <br />
          寺社・記念館など飲食店でない場所は、<b>すべて空のまま</b>にしてください。1つでもチェックすると
          「時間帯で出方が変わる場所」として扱われます。
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          {MEAL_BANDS.map((band) => (
            <label key={band} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="meal_times"
                value={band}
                defaultChecked={v.meal_times.includes(band)}
              />
              {mealLabel(band, "ja")}
              <span className="text-xs text-neutral-400">{MEAL_HOURS[band]}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold">抽選と公開</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="capacity_weight">キャパ重み</label>
            <input id="capacity_weight" name="capacity_weight" defaultValue={v.capacity_weight} type="number" step="0.1" min="0" max="10" className={input} />
            <p className={help}>
              <b>1時間に無理なく受け入れられる人数 ÷ 3</b> が目安です。<br />
              路地奥の小さな社・個人店（2〜3人）= <b>0.5〜1.0</b><br />
              中規模の寺の境内・庭園（5〜10人）= <b>1.5〜2.0</b><br />
              大きな境内・商店街（20人〜）= <b>2.5〜3.0</b><br />
              3.0を超えても効果は頭打ちです（実測: 8倍にしても出現率は2倍弱）。
              迷ったら 1.0 のままで構いません。
            </p>
          </div>
          <div>
            <label className={label} htmlFor="congestion_level">混雑度</label>
            <select id="congestion_level" name="congestion_level" defaultValue={v.congestion_level} className={input}>
              {CONGESTION.map((c, i) => (
                <option key={i} value={i}>{c}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" defaultChecked={v.active} />
              公開する（外すと抽選に出ません。QRを読んでも表示されません）
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_collab" defaultChecked={v.is_collab} />
              コラボスポット（特典を表示する）
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label} htmlFor="coupon_ja">特典の表記（日本語）</label>
                <input id="coupon_ja" name="coupon_ja" defaultValue={v.coupon_ja} className={input} />
              </div>
              <div>
                <label className={label} htmlFor="coupon_en">特典の表記（英語）</label>
                <input id="coupon_en" name="coupon_en" defaultValue={v.coupon_en} className={input} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button type="submit" className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white">
          {submitLabel}
        </button>
        <a href="/admin" className="text-sm text-neutral-500 underline">キャンセル</a>
      </div>
    </form>
  );
}
