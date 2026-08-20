/**
 * 参加者の道中（ジャーニー）の状態をサーバー側で組み立てる層。
 * 画面・Server Action はここだけを見る。
 */

import "server-only";

import { distM, type LatLng } from "./geo";
import { mealBandsFromRules, type MealBandHours } from "./meal";
import { BAND_MEALS, EMPTY_PIVOLINK, pickSuffix, type PivolinkContext } from "./pivolink";
import { seededRng } from "./rng";
import { pickChoices, type RoutableSpot, type ScoredSpot } from "./routing";
import { getStore } from "./store";
import { hourJst } from "./time";
import type { Campaign, Goal, RoutingRule, Scan, Session, Spot } from "./types";

/** 混雑を見る時間窓。短すぎると反応しすぎ、長すぎると効かない */
const CONGESTION_WINDOW_MIN = 60;

export interface JourneyState {
  campaign: Campaign;
  session: Session;
  goal: Goal | null;
  goals: Goal[];
  spots: Spot[];
  rules: RoutingRule[];
  scans: Scan[];
  /** 直近1時間のスポット別スキャン数（混雑の自動判定用） */
  recentScans: Record<string, number>;
  /** 現在のJST時（食べどきバッジの判定に使う。抽選と同じ値を渡す） */
  hour: number;
  /** 時刻→食事どきの対応（routing_rules 由来） */
  mealBands: MealBandHours;
  /** PivoLink のルールが下した判断（時間帯・A/B・読込回数） */
  pivolink: PivolinkContext;
  /** 押印済みスポット（押した順） */
  stamped: { spot: Spot; scan: Scan }[];
  stampCount: number;
  stampTarget: number;
  /** 直近に押印したスポット = 現在地 */
  currentSpot: Spot | null;
  position: LatLng;
  /** 目的地までの残り距離(m) */
  remainingM: number;
  /** スタート→目的地の直線距離(m) */
  directM: number;
  /** これまでの歩行距離(m) */
  walkedM: number;
  progressPct: number;
  complete: boolean;
}

export async function loadJourney(
  session: Session,
  pivolink: PivolinkContext = EMPTY_PIVOLINK,
): Promise<JourneyState | null> {
  const store = getStore();
  const [campaign, spots, goals, rules, scans, recentScans] = await Promise.all([
    store.getCampaignById(session.campaign_id),
    store.listSpots(session.campaign_id),
    store.listGoals(session.campaign_id),
    store.listRules(session.campaign_id),
    store.listScans(session.id),
    store.getRecentScanCounts(session.campaign_id, CONGESTION_WINDOW_MIN),
  ]);
  if (!campaign) return null;

  const spotById = new Map(spots.map((s) => [s.id, s]));
  const stamped = scans
    .map((scan) => ({ scan, spot: spotById.get(scan.spot_id) }))
    .filter((x): x is { scan: Scan; spot: Spot } => Boolean(x.spot));

  const goal = session.goal_id ? (goals.find((g) => g.id === session.goal_id) ?? null) : null;
  const start: LatLng = { lat: campaign.start_lat, lng: campaign.start_lng };
  const currentSpot = stamped.length ? stamped[stamped.length - 1].spot : null;
  const position: LatLng = currentSpot ? { lat: currentSpot.lat, lng: currentSpot.lng } : start;

  const directM = goal ? distM(start, goal) : 0;
  const remainingM = goal ? distM(position, goal) : 0;
  const progressPct = directM
    ? Math.max(6, Math.min(100, Math.round((1 - remainingM / directM) * 100)))
    : 0;

  return {
    campaign,
    session,
    goal,
    goals,
    spots,
    rules,
    scans,
    recentScans,
    hour: hourJst(),
    mealBands: mealBandsFromRules(rules),
    pivolink,
    stamped,
    stampCount: stamped.length,
    stampTarget: campaign.stamp_target,
    currentSpot,
    position,
    remainingM,
    directM,
    walkedM: Number(session.walked_m),
    progressPct,
    complete: stamped.length >= campaign.stamp_target,
  };
}

/**
 * 次の二択の抽選。
 * ★シードを (session_id, 押印数) から決めるので、画面をリロードしても同じ二択が出る。
 *   同時に押印時に「何を提示したか」を再計算できる（scans.choice_shown の記録用）。
 *   管理画面で重みを変えれば、次の抽選から即時反映される。
 */
export function nextChoices(state: JourneyState): ScoredSpot[] {
  if (!state.goal || state.complete) return [];

  const routable: RoutableSpot[] = state.spots
    .slice()
    .sort((a, b) => a.slug.localeCompare(b.slug)) // 抽選を再現可能にするため順序を固定
    .map((s) => ({
      id: s.id,
      slug: s.slug,
      lat: s.lat,
      lng: s.lng,
      capacity_weight: Number(s.capacity_weight),
      congestion_level: s.congestion_level,
      is_collab: s.is_collab,
      meal_times: s.meal_times ?? [],
      open_hours: s.open_hours ?? null,
    }));

  return pickChoices({
    from: state.position,
    goal: { lat: state.goal.lat, lng: state.goal.lng },
    spots: routable,
    visitedIds: state.stamped.map((s) => s.spot.id),
    currentSpotId: state.currentSpot?.id ?? null,
    toleranceM: state.campaign.detour_tolerance_m,
    rules: state.rules,
    hourJst: state.hour,
    previousSlug: state.currentSpot?.slug ?? null,
    recentScans: state.recentScans,
    // ★食べどきの判断は PivoLink（time_of_day）から。無ければ時刻で自前判定
    mealBandOverride: state.pivolink.band ? BAND_MEALS[state.pivolink.band] : null,
    // ★A/Bテストの枝がシードに混ざる。PivoLink が振り直せば二択も変わる。
    //   枝はURLに載っているのでリロードしても同じ二択のまま（体験は壊れない）
    rng: seededRng(
      choiceSeed(state.session.id, state.stampCount, pickSuffix(state.pivolink)),
    ),
  }).choices;
}

/** session_id + 押印数 + PivoLinkの枝 から 32bit のシードを作る（FNV-1a） */
function choiceSeed(sessionId: string, stampCount: number, suffix = ""): number {
  let h = 2166136261;
  const input = `${sessionId}#${stampCount}${suffix}`;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
