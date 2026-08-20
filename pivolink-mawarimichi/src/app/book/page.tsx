/** スタンプ帳（F05）。押印済みスタンプと今日のルートを見せる */

import { redirect } from "next/navigation";

import { StampMark } from "@/components/graphics";
import { RouteMap } from "@/components/RouteMap";
import { VisitorShell } from "@/components/VisitorShell";
import { ui } from "@/lib/i18n";
import { loadJourney } from "@/lib/journey";
import { readSession } from "@/lib/session";
import { getStore } from "@/lib/store";
import { tx } from "@/lib/types";

export default async function BookPage() {
  const session = await readSession();
  if (!session) redirect("/");

  const state = await loadJourney(session);
  if (!state) redirect("/");

  const lang = state.session.lang;
  const t = ui(lang);
  const backHref = state.currentSpot
    ? `/s/${state.currentSpot.qr_token}`
    : `/s/${state.campaign.start_qr_token}`;

  const slots = Array.from({ length: state.stampTarget }, (_, i) => state.stamped[i] ?? null);

  return (
    <VisitorShell
      lang={lang}
      languages={state.campaign.languages}
      stampCount={state.stampCount}
      demo={getStore().kind !== "supabase"}
      returnTo="/book"
    >
      <div className="book fade-in">
        <h2>{t.bookT}</h2>
        <div className="book-sub">{t.bookSub(state.stampCount, state.stampTarget)}</div>

        <div className="book-grid">
          {slots.map((entry, i) =>
            entry ? (
              <div
                key={entry.scan.id}
                className="slot"
                style={{
                  borderStyle: "solid",
                  borderColor: entry.scan.is_rare ? "var(--kin)" : "var(--shu)",
                }}
              >
                <StampMark spot={entry.spot} rare={entry.scan.is_rare} size={80} />
              </div>
            ) : (
              <div key={`empty-${i}`} className="slot">
                <span className="n">{String(i + 1).padStart(2, "0")}</span>
              </div>
            ),
          )}
        </div>

        {state.goal && state.stamped.length > 0 ? (
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
        ) : null}

        <div className="route-list">
          <div className="t">{t.routeT}</div>
          <ol>
            {state.stamped.length ? (
              state.stamped.map((entry) => (
                <li key={entry.scan.id}>
                  {tx(entry.spot.name, lang)}
                  {entry.scan.is_rare ? " ★" : ""}
                </li>
              ))
            ) : (
              <li style={{ listStyle: "none", color: "var(--sub)" }}>—</li>
            )}
          </ol>
        </div>

        <a className="cta ghost" href={backHref} style={{ inlineSize: "100%", margin: "1.2rem 0 0" }}>
          {t.back}
        </a>
      </div>
    </VisitorShell>
  );
}
