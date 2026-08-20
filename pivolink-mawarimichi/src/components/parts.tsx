import { gradient, NaviFace } from "@/components/graphics";
import { hoursNotice } from "@/lib/hours";
import { ui } from "@/lib/i18n";
import { mealNowLabel, mealSummary, type MealBandHours } from "@/lib/meal";
import { BAND_LABEL, type PivolinkContext } from "@/lib/pivolink";
import type { ScoredSpot } from "@/lib/routing";
import { tx, type Goal, type Lang, type Spot } from "@/lib/types";

/**
 * 飲食スポットの「食べどき」表示。
 * いま食べどきなら朱、そうでなければ何時向きの店かを控えめに出す。
 * 寺社（meal_times が空）には何も出ない。
 */
export function MealTag({
  spot,
  lang,
  hour,
  bands,
}: {
  spot: Pick<Spot, "meal_times" | "open_hours">;
  lang: Lang;
  hour: number;
  bands: MealBandHours;
}) {
  // 開閉の情報が先。閉まっている場所は「ランチにおすすめ」より先に伝える必要がある
  const notice = hoursNotice(spot.open_hours, hour, lang);
  const now = spot.meal_times?.length
    ? mealNowLabel(spot.meal_times, hour, bands, lang)
    : "";
  const summary = spot.meal_times?.length ? mealSummary(spot.meal_times, lang) : "";

  if (!notice && !now && !summary) return null;

  return (
    <span className="meal-tags">
      {notice ? <span className={`meal-tag ${notice.level}`}>{notice.text}</span> : null}
      {now ? <span className="meal-tag now">{now}</span> : summary ? (
        <span className="meal-tag">{summary}</span>
      ) : null}
    </span>
  );
}

export function GoalBar({
  goal,
  lang,
  remainingM,
  progressPct,
}: {
  goal: Goal;
  lang: Lang;
  remainingM: number;
  progressPct: number;
}) {
  const t = ui(lang);
  return (
    <div className="goal-bar">
      <div className="t">{t.goalBarT}</div>
      <div className="d">{t.goalBarD(tx(goal.name, lang), remainingM)}</div>
      <div className="m">{t.goalBarM(remainingM)}</div>
      <div className="track">
        <i style={{ inlineSize: `${progressPct}%` }} />
      </div>
    </div>
  );
}

/** ナビゲーターの発話。チャット（アイコン＋吹き出し）で出す */
export function NaviCard({
  lang,
  text,
  size = 48,
  name,
  faceUrl,
}: {
  lang: Lang;
  text: string;
  size?: number;
  /** キャンペーンで差し替えたナビゲーター名。無ければ既定 */
  name?: string;
  faceUrl?: string;
}) {
  const t = ui(lang);
  return (
    <div className="navi-card">
      <div className="navi-face">
        <NaviFace size={size} src={faceUrl} />
      </div>
      <div className="navi-body">
        <div className="navi-name">{name || t.naviName}</div>
        <div className="navi-bubble">
          <p className="navi-text">{text}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * この二択が PivoLink のどのルールで決まったかを開示する。
 * ★デモとしての本体はここ。「毎回違う行き先」を作っているのが PivoLink であることを、
 *   参加者にも、企画を見る側にも、画面上で示す。
 *   PivoLink のダッシュボードでルールを止めると、この行は実際に消える。
 */
export function PivolinkTrace({ ctx, lang }: { ctx: PivolinkContext; lang: Lang }) {
  if (!ctx.active) return null;
  const parts: string[] = [];
  if (ctx.band)
    parts.push(
      lang === "ja"
        ? `時間帯:${BAND_LABEL[ctx.band].ja}`
        : `time:${BAND_LABEL[ctx.band].en}`,
    );
  if (ctx.pick) parts.push(lang === "ja" ? `A/B:${ctx.pick}` : `A/B:${ctx.pick}`);
  if (ctx.visit && ctx.visit > 1)
    parts.push(lang === "ja" ? `${ctx.visit}回目` : `visit ${ctx.visit}`);

  return (
    <p className="pv-trace">
      <b>PivoLink</b>
      {lang === "ja" ? "のルールで選ばれました" : " rules chose this"}
      {parts.length ? ` — ${parts.join(" / ")}` : null}
    </p>
  );
}

/** 二択の提示。カードは「その寄り道へ向かう」画面へのリンク */
export function ChoiceList({
  choices,
  lang,
  hrefFor,
  hour,
  mealBands,
  pivolink,
}: {
  choices: { scored: ScoredSpot; spot: Spot }[];
  lang: Lang;
  hrefFor: (spot: Spot) => string;
  hour: number;
  mealBands: MealBandHours;
  pivolink: PivolinkContext;
}) {
  const t = ui(lang);
  const quiet = choices.filter((c) => c.spot.congestion_level === 0).length;

  return (
    <>
      <div className="routing-note">
        <div className="t">{t.routingT}</div>
        <p>{t.routing(quiet)}</p>
        <PivolinkTrace ctx={pivolink} lang={lang} />
      </div>
      <p style={{ margin: "0.4rem 1.2rem 0.5rem", fontSize: ".8rem", fontWeight: 600 }}>
        {t.choiceT}
      </p>
      <div className="choice-wrap">
        {choices.map(({ spot, scored }) => (
          <a key={spot.id} className="choice" href={hrefFor(spot)}>
            <div
              className={`thumb${spot.image_url ? " has-photo" : ""}`}
              style={
                spot.image_url
                  ? { backgroundImage: `url(${spot.image_url})` }
                  : { background: gradient(spot.grad) }
              }
            >
              {spot.image_url ? null : spot.kanji}
            </div>
            <div>
              <div className="cn">{tx(spot.name, lang)}</div>
              <MealTag spot={spot} lang={lang} hour={hour} bands={mealBands} />
              <div className="ci">
                {tx(spot.area, lang)} ・ {t.walk}
                {spot.walk_min ?? Math.max(1, Math.round(scored.legM / 80))}
                {t.min} ・ {t.cong[spot.congestion_level] ?? t.cong[1]}
              </div>
            </div>
            <div className="cg">
              <b>→</b>
              <span>GO</span>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
