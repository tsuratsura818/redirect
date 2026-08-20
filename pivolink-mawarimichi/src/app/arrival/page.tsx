/** 到着画面（F07/F08）。まわりみち率とクーポンを出す */

import { redirect } from "next/navigation";

import { restartAction } from "@/app/actions";
import { NaviCard } from "@/components/parts";
import { RouteMap } from "@/components/RouteMap";
import { VisitorShell } from "@/components/VisitorShell";
import { fmtM } from "@/lib/geo";
import { ui } from "@/lib/i18n";
import { loadJourney } from "@/lib/journey";
import { readSession } from "@/lib/session";
import { branding } from "@/lib/branding";
import { getStore } from "@/lib/store";
import { tx } from "@/lib/types";

export default async function ArrivalPage() {
  const session = await readSession();
  if (!session) redirect("/");

  const state = await loadJourney(session);
  if (!state || !state.goal || !session.completed_at) redirect("/");

  const store = getStore();
  const coupon = await store.getCoupon(session.id);

  const lang = state.session.lang;
  const brand = branding(state.campaign, lang);
  const t = ui(lang);
  const walked = Number(session.walked_m);
  const direct = Number(session.direct_m ?? state.directM);
  const rate = direct > 0 ? Math.round((walked / direct) * 100) : 0;

  return (
    <VisitorShell
      lang={lang}
      languages={state.campaign.languages}
      stampCount={state.stampCount}
      demo={store.kind !== "supabase"}
      returnTo="/arrival"
    >
      <div className="fade-in">
        <div className="goal-hero">
          <div className="gl">
            {t.arriveL} — {tx(state.goal.name, lang)}
          </div>
          <h1>{t.arriveT}</h1>
          <p>{t.arriveP(tx(state.goal.name, lang))}</p>
        </div>

        <RouteMap
          start={{ lat: state.campaign.start_lat, lng: state.campaign.start_lng }}
          goal={{ lat: state.goal.lat, lng: state.goal.lng }}
          points={state.stamped.map((e) => ({
            lat: e.spot.lat,
            lng: e.spot.lng,
            label: tx(e.spot.name, lang),
            rare: e.scan.is_rare,
          }))}
          startLabel={t.mapStart}
          goalLabel={tx(state.goal.name, lang)}
          shortestLabel={t.mapShortest}
          walkedLabel={t.mapWalked}
          lang={lang}
        />

        <div className="stats">
          <div>
            <div className="sv">{fmtM(walked)}</div>
            <div className="sk">{t.stWalked}</div>
          </div>
          <div>
            <div className="sv" style={{ color: "var(--sub)" }}>
              {fmtM(direct)}
            </div>
            <div className="sk">{t.stDirect}</div>
          </div>
          <div>
            <div className="sv big">{rate}%</div>
            <div className="sk">{t.stRate}</div>
          </div>
          <div className="stats-note">{t.statsNote(walked, direct)}</div>
        </div>

        {coupon ? (
          <div className="coupon">
            <div className="t">{t.couponT}</div>
            <div className="code">{coupon.code}</div>
            <p>{t.couponP}</p>
          </div>
        ) : null}

        <NaviCard
          lang={lang}
          text={brand.outro}
          name={brand.navigatorName}
          faceUrl={brand.faceUrl}
        />

        <form action={restartAction}>
          <input type="hidden" name="token" value={state.campaign.start_qr_token} />
          <button className="cta" type="submit">
            {t.again}
          </button>
        </form>
      </div>
    </VisitorShell>
  );
}
