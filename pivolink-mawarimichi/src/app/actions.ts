"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { distM } from "@/lib/geo";
import { loadJourney, nextChoices } from "@/lib/journey";
import {
  detectLang,
  getOrStartSession,
  readSession,
  clearSession,
  readLangCookie,
  writeLangCookie,
} from "@/lib/session";
import { generateCouponCode, rollRare } from "@/lib/stamp";
import { unpackQuery } from "@/lib/pivolink";
import { getStore } from "@/lib/store";
import { PHASE1_LANGS, type Lang } from "@/lib/types";

/** 言語の決め方: 手動で選んだcookie → Accept-Language の順 */
async function preferredLang(allowed: Lang[]): Promise<Lang> {
  const chosen = await readLangCookie(allowed);
  if (chosen) return chosen;
  const h = await headers();
  return detectLang(h.get("accept-language"), allowed);
}

function asLang(value: FormDataEntryValue | null, fallback: Lang): Lang {
  const v = String(value ?? "");
  return (PHASE1_LANGS as string[]).includes(v) ? (v as Lang) : fallback;
}

/** 目的地の選択。ここで初めてセッション（＝匿名cookie）が生まれる */
export async function selectGoalAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const goalId = String(formData.get("goalId") ?? "");
  // PivoLink の判断（時間帯・A/B枝・読込回数）を、選択後の画面まで持ち越す
  const pv = unpackQuery(String(formData.get("pv") ?? ""));

  const store = getStore();
  const resolved = await store.resolveQrToken(token);
  if (!resolved) redirect("/");

  const goal = await store.getGoal(goalId);
  if (!goal || goal.campaign_id !== resolved.campaign.id) redirect(`/s/${token}`);

  const lang = await preferredLang(resolved.campaign.languages);
  const session = await getOrStartSession(resolved.campaign.id, lang);

  await store.updateSession(session.id, {
    goal_id: goal.id,
    direct_m: distM(
      { lat: resolved.campaign.start_lat, lng: resolved.campaign.start_lng },
      { lat: goal.lat, lng: goal.lng },
    ),
  });

  redirect(`/s/${token}${pv ? `?${pv}` : ""}`);
}

/**
 * スタンプ押印。
 * ★二重押印は DB の unique(session_id, spot_id) で弾く（created=false で戻る）。
 * ★提示した二択を choice_shown に残す = 提示無視率（choice_shown vs choice_taken）の計測。
 */
export async function stampAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const pv = unpackQuery(String(formData.get("pv") ?? ""));
  const store = getStore();

  const resolved = await store.resolveQrToken(token);
  if (!resolved || resolved.kind !== "spot") redirect("/");

  const session = await readSession();
  if (!session || !session.goal_id) redirect(`/s/${token}`);

  const state = await loadJourney(session);
  if (!state || state.complete) redirect(`/s/${token}`);

  const spot = resolved.spot;
  const shown = nextChoices(state).map((c) => c.spot.slug);

  const { created } = await store.insertScan({
    sessionId: session.id,
    spotId: spot.id,
    isRare: rollRare(spot),
    choiceShown: shown.length ? shown : null,
  });

  if (created) {
    await store.updateSession(session.id, {
      walked_m: Number(session.walked_m) + distM(state.position, spot),
    });
  }

  const back = `/s/${token}${pv ? `?${pv}` : ""}`;

  // ★スポンサーCM。表示位置は「スタンプ獲得の直後」だけ（CLAUDE.md §9-4）。
  //   広告そのものは PivoLink のクッションページ機能。アプリは
  //   「いつ通すか（頻度上限）」と「どこへ戻すか」だけを持つ。
  if (created && shouldShowCm(state.stampCount + 1, state.campaign.cm_frequency_cap)) {
    const cm = process.env.MAWARIMICHI_CM_URL;
    if (cm) {
      const jar = await cookies();
      jar.set("mw_cm_back", back, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 10,
      });
      redirect(cm);
    }
  }

  redirect(back);
}

/**
 * CMを挟むか。cm_frequency_cap 個ごとに1回（既定3）。
 * ★1個目には出さない。最初の報酬体験を広告で汚すと、そこで離脱する。
 */
function shouldShowCm(stampNumber: number, cap: number): boolean {
  if (!cap || cap < 1) return false;
  return stampNumber > 1 && stampNumber % cap === 0;
}

/** 到着。最終区間ぶんの距離を足し、完了時刻とクーポンを確定する */
export async function arriveAction() {
  const session = await readSession();
  if (!session) redirect("/");

  const state = await loadJourney(session);
  if (!state || !state.goal || !state.complete) redirect("/");

  const store = getStore();

  if (!session.completed_at) {
    await store.updateSession(session.id, {
      walked_m:
        Number(session.walked_m) +
        distM(state.position, { lat: state.goal.lat, lng: state.goal.lng }),
      completed_at: new Date().toISOString(),
    });
    await store.issueCoupon(session.id, generateCouponCode());
  }

  redirect("/arrival");
}

/** 言語切替。セッションに保存するので、以後の画面すべてに効く */
export async function setLangAction(formData: FormData) {
  const returnTo = String(formData.get("returnTo") ?? "/");
  const session = await readSession();
  const lang = asLang(formData.get("lang"), session?.lang ?? "ja");

  // ★セッションの有無にかかわらず必ずcookieに残す。
  //   目的地を選ぶ前はセッションが無く、以前はここで切替が消えていた。
  await writeLangCookie(lang);
  if (session) await getStore().updateSession(session.id, { lang });

  redirect(returnTo);
}

/** 最初から巡りなおす。セッションを捨てるだけ（PIIを持たないので消すものが無い） */
export async function restartAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  await clearSession();
  redirect(token ? `/s/${token}` : "/");
}
