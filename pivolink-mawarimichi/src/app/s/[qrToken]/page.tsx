/**
 * QR着地点。1つの入口でスタートQR／スポットQRを捌く（F01）。
 *
 * 画面遷移:
 *   目的地未選択          → 目的地選択（スタートQRでもスポットQRでも同じ）
 *   スタートQR・目的地あり → 現在の二択を提示
 *   スポットQR・未押印    → スポットの物語 + スタンプCTA
 *   スポットQR・押印済み  → スタンプ + 次の二択（揃っていれば目的地へのCTA）
 *   ?to=<slug>            → その寄り道へ向かうためのナビ画面（区間ナビのみ）
 */

import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { arriveAction, selectGoalAction, stampAction } from "@/app/actions";
import { gradient, NaviStanding, StartSeal, StampMark } from "@/components/graphics";
import { NavDeepLink } from "@/components/NavDeepLink";
import { SpotJsonLd } from "@/components/JsonLd";
import { ChoiceList, GoalBar, MealTag, NaviCard, PivolinkTrace } from "@/components/parts";
import { SubmitButton } from "@/components/SubmitButton";
import { VisitorShell } from "@/components/VisitorShell";
import { distM, fmtM } from "@/lib/geo";
import { branding, type Branding as Brand } from "@/lib/branding";
import { hoursLabel, isOpenAt } from "@/lib/hours";
import { ui } from "@/lib/i18n";
import { loadJourney, nextChoices, type JourneyState } from "@/lib/journey";
import { carryQuery, packQuery, readPivolink } from "@/lib/pivolink";
import { hourJst } from "@/lib/time";
import { walkingDirectionsUrl } from "@/lib/nav";
import { detectLang, readSession, readLangCookie } from "@/lib/session";
import { getStore } from "@/lib/store";
import type { PivolinkContext } from "@/lib/pivolink";
import { tx, type Campaign, type Goal, type Lang, type Spot } from "@/lib/types";

/** デモ用の「QRを読み込んだことにする」導線を出すか（本番Supabase接続時は既定でオフ） */
function demoScanEnabled(storeKind: string): boolean {
  if (process.env.MAWARIMICHI_DEMO_SCAN === "1") return true;
  if (process.env.MAWARIMICHI_DEMO_SCAN === "0") return false;
  return storeKind !== "supabase";
}

/**
 * SNSに貼られたときの見え方。
 * ★キャンペーンの設定から引く。ここを固定にすると、別の街で使っても
 *   「まわりみち KYOTO」のまま共有されてしまう。
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ qrToken: string }>;
}): Promise<Metadata> {
  const { qrToken } = await params;
  const resolved = await getStore().resolveQrToken(qrToken);
  if (!resolved) return {};

  const campaign = resolved.campaign;
  const brand = branding(campaign, "ja");
  const title = tx(campaign.name, "ja");
  const description = brand.tagline;
  const image = brand.ogImageUrl;
  // 見出しの改行は代替テキストでは1行に畳む
  const headline = brand.title.split("\n").join(" ");

  return {
    title,
    description,
    openGraph: {
      type: "website",
      siteName: title,
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: `${title} — ${headline}` }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function QrLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ qrToken: string }>;
  searchParams: Promise<{
    to?: string; band?: string; pick?: string; visit?: string; closed?: string;
  }>;
}) {
  const { qrToken } = await params;
  const { to, band, pick, visit, closed } = await searchParams;
  const nowHour = hourJst();
  // ★PivoLink の redirect_rules が下した判断。ここが「毎回違う行き先」の出どころ
  const pivolink = readPivolink({ band, pick, visit, closed });

  const store = getStore();
  const resolved = await store.resolveQrToken(qrToken);
  if (!resolved) notFound();

  const campaign = resolved.campaign;
  const session = await readSession();
  const state = session ? await loadJourney(session, pivolink) : null;

  const h = await headers();
  const lang: Lang = state?.session.lang ?? (await readLangCookie(campaign.languages)) ?? detectLang(h.get("accept-language"), campaign.languages);
  const userAgent = h.get("user-agent");
  const demo = store.kind !== "supabase";

  const brand = branding(campaign, lang);

  const shell = (children: React.ReactNode) => (
    <VisitorShell
      lang={lang}
      languages={campaign.languages}
      stampCount={state?.stampCount ?? 0}
      demo={demo}
      returnTo={`/s/${qrToken}?${to ? `to=${to}` : ""}${carryQuery(pivolink)}`}
    >
      {children}
    </VisitorShell>
  );

  // --- 目的地が未選択: 目的地選択画面 ---
  if (!state || !state.goal) {
    const [goals, allSpots] = await Promise.all([
      store.listGoals(campaign.id),
      store.listSpots(campaign.id),
    ]);
    return shell(
      <GoalSelect
        campaign={campaign}
        goals={goals}
        lang={lang}
        token={qrToken}
        hour={nowHour}
        openSpotCount={allSpots.filter((s) => isOpenAt(s.open_hours, nowHour)).length}
        pivolink={pivolink}
        brand={brand}
        spot={resolved.kind === "spot" ? resolved.spot : null}
      />,
    );
  }

  // --- 「その寄り道へ向かう」ナビ画面 ---
  if (to) {
    const target = state.spots.find((s) => s.slug === to);
    if (target) {
      return shell(
        <HeadingTo
          state={state}
          target={target}
          lang={lang}
          userAgent={userAgent}
          demoScan={demoScanEnabled(store.kind)}
        />,
      );
    }
  }

  // --- スタートQR: 現在の二択 ---
  if (resolved.kind === "start") {
    return shell(<Progress state={state} lang={lang} token={qrToken} userAgent={userAgent} />);
  }

  // --- スポットQR ---
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host") ?? "localhost:3000"}`;

  return shell(
    <>
      <SpotJsonLd spot={resolved.spot} campaign={campaign} lang={lang} origin={origin} />
      <SpotView
      state={state}
      spot={resolved.spot}
      lang={lang}
      token={qrToken}
        userAgent={userAgent}
      />
    </>,
  );
}

/* ---------------- 目的地選択 ---------------- */

function GoalSelect({
  campaign,
  goals,
  lang,
  token,
  hour,
  openSpotCount,
  pivolink,
  brand,
  spot,
}: {
  campaign: Campaign;
  goals: Goal[];
  lang: Lang;
  token: string;
  hour: number;
  openSpotCount: number;
  pivolink: PivolinkContext;
  brand: Brand;
  spot: Spot | null;
}) {
  const t = ui(lang);
  const pv = packQuery(pivolink);
  // ★寄り道の数だけ「開いている場所」が要る。朝いちばんと夕方以降は足りない。
  //   足りないまま歩かせると、閉まった門の前に立たせることになる（最短ルートより悪い体験）。
  const notEnoughOpen = openSpotCount < campaign.stamp_target;
  return (
    <div className="fade-in">
      <div className="start-hero">
        {brand.seal ? (
          <div className="qr">
            <StartSeal char={brand.seal} />
          </div>
        ) : null}
        <div className="start-loc">
          {spot ? tx(spot.name, lang) : `START — ${tx(campaign.start_label, lang)}`}
        </div>
        <h1>
          {brand.title.split("\n").map((line, i) => (
            <span key={i}>
              {i > 0 ? <br /> : null}
              {line}
            </span>
          ))}
        </h1>
        <p className="tag">{brand.tagline}</p>
        <NaviStanding height={150} src={brand.standingUrl} />
      </div>

      {notEnoughOpen ? (
        <div className="hours-warn">
          <div className="t">{lang === "ja" ? "いまの時間について" : "About this hour"}</div>
          <p>
            {lang === "ja"
              ? `いま開いている場所は ${openSpotCount} 件で、${campaign.stamp_target} つの寄り道はそろいません。歩くことはできますが、閉まっている場所に当たります。9:00〜16:00 のあいだが、いちばんよく巡れます。`
              : `Only ${openSpotCount} spots are open right now — not enough for ${campaign.stamp_target} detours. You can still walk, but some places will be closed. Between 9:00 and 16:00 works best.`}
          </p>
        </div>
      ) : null}

      <NaviCard
        lang={lang}
        text={spot ? t.spotNeedsGoal : brand.intro}
        name={brand.navigatorName}
        faceUrl={brand.faceUrl}
      />

      <p className="goal-label">{t.goalLabel}</p>
      <div className="goal-wrap">
        {goals.map((goal) => {
          // ★閉まっている目的地でも選べるようにしておく（門前まで歩くこと自体は成立する）。
          //   ただし「着いたら閉まっていた」を後から知るのが最悪なので、選ぶ前に伝える。
          const closed = !isOpenAt(goal.open_hours, hour);
          return (
            <form key={goal.id} action={selectGoalAction}>
              <input type="hidden" name="token" value={token} />
              <input type="hidden" name="goalId" value={goal.id} />
              {/* PivoLink の判断を選択後の画面まで持ち越す（無いと開示もA/Bも消える） */}
              <input type="hidden" name="pv" value={pv} />
              <SubmitButton
                className={`goal-card${closed ? " is-closed" : ""}`}
                pendingLabel={lang === "ja" ? "道を用意しています…" : "Finding your road…"}
              >
                <div className="thumb" style={{ background: gradient(goal.grad) }}>
                  {goal.icon_char}
                </div>
                <div>
                  <div className="gn">{tx(goal.name, lang)}</div>
                  <div className="gi">{tx(goal.subtitle, lang)}</div>
                  {closed ? (
                    <div className="gc">
                      {lang === "ja"
                        ? `本日の拝観は終了しています（${hoursLabel(goal.open_hours, lang)}）`
                        : `Closed for today (${hoursLabel(goal.open_hours, lang)})`}
                    </div>
                  ) : null}
                </div>
              </SubmitButton>
            </form>
          );
        })}
      </div>
      <div className="free-input">
        <input type="text" placeholder={t.freeInput} aria-label={t.freeInput} readOnly />
      </div>
      <p
        style={{
          textAlign: "center",
          fontSize: ".6rem",
          color: "var(--sub)",
          paddingBlockEnd: "1rem",
        }}
      >
        {brand.note}
      </p>
    </div>
  );
}

/* ---------------- 進行中（スタートQR再スキャン時など） ---------------- */

function Progress({
  state,
  lang,
  token,
  userAgent,
}: {
  state: JourneyState;
  lang: Lang;
  token: string;
  userAgent: string | null;
}) {
  const choices = choiceCards(state);

  return (
    <div className="fade-in">
      <GoalBar
        goal={state.goal!}
        lang={lang}
        remainingM={state.remainingM}
        progressPct={state.progressPct}
      />
      {state.complete ? (
        <ArrivalCta state={state} lang={lang} userAgent={userAgent} />
      ) : (
        <ChoiceList
          choices={choices}
          hour={state.hour}
          mealBands={state.mealBands}
          pivolink={state.pivolink}
          lang={lang}
          hrefFor={(spot) => `/s/${token}?to=${spot.slug}${carryQuery(state.pivolink)}`}
        />
      )}
    </div>
  );
}

/* ---------------- スポット画面 ---------------- */

function SpotView({
  state,
  spot,
  lang,
  token,
  userAgent,
}: {
  state: JourneyState;
  spot: Spot;
  lang: Lang;
  token: string;
  userAgent: string | null;
}) {
  const t = ui(lang);
  const brand = branding(state.campaign, lang);
  const stamped = state.stamped.find((s) => s.spot.id === spot.id);
  const index = stamped
    ? state.stamped.findIndex((s) => s.spot.id === spot.id) + 1
    : Math.min(state.stampCount + 1, state.stampTarget);

  return (
    <div className="fade-in">
      <GoalBar
        goal={state.goal!}
        lang={lang}
        remainingM={state.remainingM}
        progressPct={state.progressPct}
      />

      <div
        className={`spot-visual${spot.image_url ? " has-photo" : ""}`}
        style={
          spot.image_url
            ? { backgroundImage: `url(${spot.image_url})` }
            : { background: gradient(spot.grad) }
        }
      >
        <div className="k">{spot.kanji}</div>
        <div className="spot-visual-head">
          <div className="spot-num">{t.detour(index, state.stampTarget)}</div>
          <h1 className="spot-name">{tx(spot.name, lang)}</h1>
          <div className="spot-area">{tx(spot.area, lang)}</div>
          <MealTag spot={spot} lang={lang} hour={state.hour} bands={state.mealBands} />
        </div>
        <div className="photo-note">{spot.image_url ? t.photoImage : t.photoNote}</div>
      </div>

      {state.pivolink.closed ? (
        <div className="hours-warn">
          <div className="t">{lang === "ja" ? "いまは閉まっています" : "Closed right now"}</div>
          <p>
            {lang === "ja"
              ? `${tx(spot.name, lang)}の${hoursLabel(spot.open_hours, lang)}の外です。門の前まで来た記録としてスタンプは押せます。`
              : `Outside ${hoursLabel(spot.open_hours, lang)}. You can still collect the stamp as a record of reaching the gate.`}
          </p>
          <PivolinkTrace ctx={state.pivolink} lang={lang} />
        </div>
      ) : null}

      <p className="spot-story">{tx(spot.story, lang)}</p>
      <NaviCard
        lang={lang}
        text={tx(spot.navi_lines, lang)}
        size={44}
        name={brand.navigatorName}
        faceUrl={brand.faceUrl}
      />

      {spot.is_collab && spot.coupon ? (
        <div className="collab-band">
          <div className="t">{t.collabT}</div>
          <p>{tx(spot.coupon, lang)}</p>
        </div>
      ) : null}

      {stamped ? (
        <>
          <div className="stamp-zone">
            <div className="stamp landed">
              <StampMark spot={spot} rare={stamped.scan.is_rare} />
            </div>
            <p className={`stamp-msg ${stamped.scan.is_rare ? "rare-msg" : ""}`}>
              {stamped.scan.is_rare ? t.rareGet : t.stampGet}
              {stamped.scan.is_rare && spot.rare_config?.label ? (
                <>
                  <br />
                  <span style={{ fontSize: ".68rem" }}>{tx(spot.rare_config.label, lang)}</span>
                </>
              ) : null}
            </p>
          </div>

          {state.complete ? (
            <ArrivalCta state={state} lang={lang} userAgent={userAgent} />
          ) : (
            <ChoiceList
              choices={choiceCards(state)}
              hour={state.hour}
              mealBands={state.mealBands}
              pivolink={state.pivolink}
              lang={lang}
              hrefFor={(next) => `/s/${token}?to=${next.slug}${carryQuery(state.pivolink)}`}
            />
          )}
        </>
      ) : (
        <form action={stampAction}>
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="pv" value={packQuery(state.pivolink)} />
          <SubmitButton
            className="cta"
            style={{ marginBlockStart: "1rem" }}
            pendingLabel={lang === "ja" ? "押しています…" : "Stamping…"}
          >
            {t.stampBtn}
          </SubmitButton>
        </form>
      )}
    </div>
  );
}

/* ---------------- 次の寄り道へ向かう（区間ナビのみ） ---------------- */

function HeadingTo({
  state,
  target,
  lang,
  userAgent,
  demoScan,
}: {
  state: JourneyState;
  target: Spot;
  lang: Lang;
  userAgent: string | null;
  demoScan: boolean;
}) {
  const t = ui(lang);
  const brand = branding(state.campaign, lang);
  const legM = distM(state.position, target);

  return (
    <div className="fade-in">
      <GoalBar
        goal={state.goal!}
        lang={lang}
        remainingM={state.remainingM}
        progressPct={state.progressPct}
      />

      <div
        className={`spot-visual${target.image_url ? " has-photo" : ""}`}
        style={
          target.image_url
            ? { backgroundImage: `url(${target.image_url})` }
            : { background: gradient(target.grad) }
        }
      >
        <div className="k">{target.kanji}</div>
        <div className="spot-visual-head">
          <div className="spot-num">{t.detour(state.stampCount + 1, state.stampTarget)}</div>
          <h1 className="spot-name">{tx(target.name, lang)}</h1>
          <div className="spot-area">
            {tx(target.area, lang)} ・ {fmtM(legM)}
          </div>
          <MealTag spot={target} lang={lang} hour={state.hour} bands={state.mealBands} />
        </div>
        <div className="photo-note">{target.image_url ? t.photoImage : t.photoNote}</div>
      </div>

      <div className="spot-head">
        {/* ★区間ナビのみ。目的地の座標はここでは渡さない（CLAUDE.md §9-1） */}
        <NavDeepLink
          href={walkingDirectionsUrl(
            {
              lat: target.lat,
              lng: target.lng,
              slug: target.slug,
              name: tx(target.name, lang),
              mapUrl: target.map_url,
            },
            userAgent,
          )}
          spotId={state.currentSpot?.id ?? null}
          label={t.navBtn}
        />
      </div>

      <NaviCard
        lang={lang}
        text={tx(target.navi_lines, lang)}
        size={44}
        name={brand.navigatorName}
        faceUrl={brand.faceUrl}
      />

      {demoScan ? (
        <a className="cta ghost" href={`/s/${target.qr_token}`}>
          {lang === "ja"
            ? "現地のQRを読み込む（デモ）"
            : "Scan the QR at the spot (demo)"}
        </a>
      ) : (
        <p
          style={{
            textAlign: "center",
            fontSize: ".72rem",
            color: "var(--sub)",
            padding: "0 1.2rem 1.2rem",
          }}
        >
          {lang === "ja"
            ? "現地に着いたら、設置されたQRを読み込んでスタンプを押してください。"
            : "When you arrive, scan the QR on site to collect your stamp."}
        </p>
      )}
    </div>
  );
}

/* ---------------- 到着CTA ---------------- */

function ArrivalCta({
  state,
  lang,
  userAgent,
}: {
  state: JourneyState;
  lang: Lang;
  userAgent: string | null;
}) {
  const t = ui(lang);
  const goal = state.goal!;
  return (
    <>
      {/* 目的地の座標を渡してよいのは、スタンプが揃ったこの最終区間だけ（CLAUDE.md §9-1） */}
      <div style={{ textAlign: "center", marginBlockStart: ".4rem" }}>
        <NavDeepLink
          href={walkingDirectionsUrl(
            { lat: goal.lat, lng: goal.lng, slug: goal.slug, name: tx(goal.name, lang) },
            userAgent,
          )}
          spotId={state.currentSpot?.id ?? null}
          label={t.navGoalBtn}
        />
      </div>
      <form action={arriveAction} style={{ marginBlockStart: ".6rem" }}>
        <SubmitButton
          className="cta gold"
          pendingLabel={lang === "ja" ? "到着を記録しています…" : "Recording your arrival…"}
        >
          {t.toGoal(tx(goal.name, lang))}
        </SubmitButton>
      </form>
    </>
  );
}

/* ---------------- helpers ---------------- */

function choiceCards(state: JourneyState) {
  const byId = new Map(state.spots.map((s) => [s.id, s]));
  return nextChoices(state)
    .map((scored) => ({ scored, spot: byId.get(scored.spot.id)! }))
    .filter((c) => Boolean(c.spot));
}
