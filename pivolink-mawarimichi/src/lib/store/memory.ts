/**
 * インメモリ実装。Supabase の env が無いときの開発・デモ用。
 * プロセス内にしか残らないので、本番では絶対に使わない（getStore() が env で判定する）。
 */

import { randomUUID } from "node:crypto";

import { seedCampaign, seedGoals, seedRules, seedSpots } from "@/data/seed";
import type { CampaignInput } from "@/lib/campaign-input";
import type { GoalInput } from "@/lib/goal-input";
import type { SpotInput } from "@/lib/spot-input";
import type { Campaign, Coupon, Goal, Lang, RoutingRule, Scan, Session, Spot } from "@/lib/types";

import type { CampaignReport, QrResolution, Store } from "./types";

interface MemoryDb {
  campaigns: Campaign[];
  goals: Goal[];
  spots: Spot[];
  rules: RoutingRule[];
  sessions: Map<string, Session>;
  scans: Scan[];
  coupons: Coupon[];
}

/** dev の HMR でセッションが飛ばないように globalThis に載せる */
const globalForDb = globalThis as unknown as { __mawarimichiDb?: MemoryDb };

function createDb(): MemoryDb {
  return {
    campaigns: [structuredClone(seedCampaign)],
    goals: structuredClone(seedGoals),
    spots: structuredClone(seedSpots),
    rules: structuredClone(seedRules),
    sessions: new Map(),
    scans: [],
    coupons: [],
  };
}

const db: MemoryDb = (globalForDb.__mawarimichiDb ??= createDb());

export class MemoryStore implements Store {
  readonly kind = "memory" as const;

  async getCampaignBySlug(slug: string): Promise<Campaign | null> {
    return db.campaigns.find((c) => c.slug === slug) ?? null;
  }

  async getCampaignById(id: string): Promise<Campaign | null> {
    return db.campaigns.find((c) => c.id === id) ?? null;
  }

  async resolveQrToken(token: string): Promise<QrResolution | null> {
    const campaign = db.campaigns.find((c) => c.start_qr_token === token);
    if (campaign) return { kind: "start", campaign };

    const spot = db.spots.find((s) => s.qr_token === token && s.active);
    if (!spot) return null;
    const spotCampaign = db.campaigns.find((c) => c.id === spot.campaign_id);
    if (!spotCampaign) return null;
    return { kind: "spot", campaign: spotCampaign, spot };
  }

  async listGoals(campaignId: string, opts?: { includeInactive?: boolean }): Promise<Goal[]> {
    return db.goals
      .filter((g) => g.campaign_id === campaignId && (opts?.includeInactive || g.active))
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  async saveCampaign(campaignId: string, input: CampaignInput): Promise<Campaign | null> {
    const c = db.campaigns.find((x) => x.id === campaignId);
    if (!c) return null;
    Object.assign(c, input);
    return c;
  }

  async createGoal(campaignId: string, input: GoalInput): Promise<Goal> {
    if (db.goals.some((g) => g.campaign_id === campaignId && g.slug === input.slug))
      throw new Error("同じスラッグの目的地が既にあります");
    const goal: Goal = { id: randomUUID(), campaign_id: campaignId, grad: ["#3A5E4A", "#7BA05B"], ...input };
    db.goals.push(goal);
    return goal;
  }

  async saveGoal(goalId: string, input: GoalInput): Promise<Goal | null> {
    const g = db.goals.find((x) => x.id === goalId);
    if (!g) return null;
    if (db.goals.some((x) => x.id !== goalId && x.campaign_id === g.campaign_id && x.slug === input.slug))
      throw new Error("同じスラッグの目的地が既にあります");
    Object.assign(g, input);
    return g;
  }

  async deleteGoal(goalId: string): Promise<{ ok: boolean; reason?: string }> {
    if ([...db.sessions.values()].some((s) => s.goal_id === goalId))
      return { ok: false, reason: "この目的地を選んだ参加者がいるため削除できません。「公開」を外してください" };
    const i = db.goals.findIndex((g) => g.id === goalId);
    if (i < 0) return { ok: false, reason: "目的地が見つかりません" };
    db.goals.splice(i, 1);
    return { ok: true };
  }

  async listSpots(campaignId: string, opts?: { includeInactive?: boolean }): Promise<Spot[]> {
    return db.spots.filter(
      (s) => s.campaign_id === campaignId && (opts?.includeInactive || s.active),
    );
  }

  async listRules(campaignId: string): Promise<RoutingRule[]> {
    return db.rules.filter((r) => r.campaign_id === campaignId && r.active);
  }

  async getGoal(goalId: string): Promise<Goal | null> {
    return db.goals.find((g) => g.id === goalId) ?? null;
  }

  async getSpot(spotId: string): Promise<Spot | null> {
    return db.spots.find((s) => s.id === spotId) ?? null;
  }

  async createSession({ campaignId, lang }: { campaignId: string; lang: Lang }): Promise<Session> {
    const session: Session = {
      id: randomUUID(),
      campaign_id: campaignId,
      goal_id: null,
      lang,
      walked_m: 0,
      direct_m: null,
      completed_at: null,
      created_at: new Date().toISOString(),
    };
    db.sessions.set(session.id, session);
    return session;
  }

  async getSession(sessionId: string): Promise<Session | null> {
    return db.sessions.get(sessionId) ?? null;
  }

  async updateSession(
    sessionId: string,
    patch: Partial<Pick<Session, "goal_id" | "lang" | "walked_m" | "direct_m" | "completed_at">>,
  ): Promise<Session | null> {
    const session = db.sessions.get(sessionId);
    if (!session) return null;
    Object.assign(session, patch);
    return session;
  }

  async listScans(sessionId: string): Promise<Scan[]> {
    return db.scans
      .filter((s) => s.session_id === sessionId)
      .sort((a, b) => a.scanned_at.localeCompare(b.scanned_at));
  }

  async insertScan(input: {
    sessionId: string;
    spotId: string;
    isRare: boolean;
    choiceShown: string[] | null;
  }): Promise<{ scan: Scan; created: boolean }> {
    const existing = db.scans.find(
      (s) => s.session_id === input.sessionId && s.spot_id === input.spotId,
    );
    // ★二重押印防止（本番は DB の unique(session_id, spot_id) が担保する）
    if (existing) return { scan: existing, created: false };

    const scan: Scan = {
      id: randomUUID(),
      session_id: input.sessionId,
      spot_id: input.spotId,
      scanned_at: new Date().toISOString(),
      is_rare: input.isRare,
      choice_shown: input.choiceShown,
      nav_clicked: false,
    };
    db.scans.push(scan);
    return { scan, created: true };
  }

  async markNavClicked(sessionId: string, spotId: string): Promise<void> {
    const scan = db.scans.find((s) => s.session_id === sessionId && s.spot_id === spotId);
    if (scan) scan.nav_clicked = true;
  }

  async getCoupon(sessionId: string): Promise<Coupon | null> {
    return db.coupons.find((c) => c.session_id === sessionId) ?? null;
  }

  async issueCoupon(sessionId: string, code: string): Promise<Coupon> {
    const existing = db.coupons.find((c) => c.session_id === sessionId);
    if (existing) return existing;
    const coupon: Coupon = {
      id: randomUUID(),
      session_id: sessionId,
      code,
      issued_at: new Date().toISOString(),
      used_at: null,
      used_shop: null,
    };
    db.coupons.push(coupon);
    return coupon;
  }

  async updateSpot(
    spotId: string,
    patch: Partial<Pick<Spot, "capacity_weight" | "congestion_level" | "active" | "map_url" | "image_url">>,
  ): Promise<Spot | null> {
    const spot = db.spots.find((s) => s.id === spotId);
    if (!spot) return null;
    Object.assign(spot, patch);
    return spot;
  }

  async getRecentScanCounts(campaignId: string, windowMinutes: number): Promise<Record<string, number>> {
    const since = Date.now() - windowMinutes * 60_000;
    const ids = new Set(db.spots.filter((s) => s.campaign_id === campaignId).map((s) => s.id));
    const out: Record<string, number> = {};
    for (const scan of db.scans) {
      if (!ids.has(scan.spot_id)) continue;
      if (new Date(scan.scanned_at).getTime() < since) continue;
      out[scan.spot_id] = (out[scan.spot_id] ?? 0) + 1;
    }
    return out;
  }

  async createSpot(campaignId: string, input: SpotInput): Promise<Spot> {
    if (db.spots.some((s) => s.campaign_id === campaignId && s.slug === input.slug))
      throw new Error("同じスラッグのスポットが既にあります");
    const spot: Spot = {
      id: randomUUID(),
      campaign_id: campaignId,
      qr_token: randomUUID().replace(/-/g, ""),
      grad: ["#4A3B30", "#857D6E"],
      rare_config: { prob: 0.2 },
      ...input,
    };
    db.spots.push(spot);
    return spot;
  }

  async saveSpot(spotId: string, input: SpotInput): Promise<Spot | null> {
    const spot = db.spots.find((s) => s.id === spotId);
    if (!spot) return null;
    if (db.spots.some((s) => s.id !== spotId && s.campaign_id === spot.campaign_id && s.slug === input.slug))
      throw new Error("同じスラッグのスポットが既にあります");
    Object.assign(spot, input);
    return spot;
  }

  async deleteSpot(spotId: string): Promise<{ ok: boolean; reason?: string }> {
    if (db.scans.some((s) => s.spot_id === spotId))
      return { ok: false, reason: "スキャン履歴があるため削除できません。「公開」を外してください" };
    const i = db.spots.findIndex((s) => s.id === spotId);
    if (i < 0) return { ok: false, reason: "スポットが見つかりません" };
    db.spots.splice(i, 1);
    return { ok: true };
  }

  async getReport(campaignId: string): Promise<CampaignReport> {
    const spots = db.spots.filter((s) => s.campaign_id === campaignId);
    const sessions = Array.from(db.sessions.values()).filter((s) => s.campaign_id === campaignId);
    const sessionIds = new Set(sessions.map((s) => s.id));
    const scans = db.scans.filter((s) => sessionIds.has(s.session_id));
    const goals = db.goals.filter((g) => g.campaign_id === campaignId);

    return buildReport({ spots, sessions, scans, goals });
  }
}

/** Supabase実装と共通の集計ロジック */
export function buildReport(input: {
  spots: Spot[];
  sessions: Session[];
  scans: Scan[];
  goals: Goal[];
}): CampaignReport {
  const { spots, sessions, scans, goals } = input;
  const bySlug = new Map(spots.map((s) => [s.slug, s]));

  const shown = new Map<string, number>();
  const taken = new Map<string, number>();
  const scanCount = new Map<string, number>();
  const navClicks = new Map<string, number>();

  for (const scan of scans) {
    scanCount.set(scan.spot_id, (scanCount.get(scan.spot_id) ?? 0) + 1);
    taken.set(scan.spot_id, (taken.get(scan.spot_id) ?? 0) + 1);
    if (scan.nav_clicked) navClicks.set(scan.spot_id, (navClicks.get(scan.spot_id) ?? 0) + 1);
    for (const slug of scan.choice_shown ?? []) {
      const spot = bySlug.get(slug);
      if (spot) shown.set(spot.id, (shown.get(spot.id) ?? 0) + 1);
    }
  }

  const completed = sessions.filter((s) => s.completed_at);
  const rates = completed
    .filter((s) => s.direct_m && s.direct_m > 0)
    .map((s) => (Number(s.walked_m) / Number(s.direct_m)) * 100)
    .sort((a, b) => a - b);

  const scansBySession = new Map<string, Scan[]>();
  for (const scan of scans) {
    const list = scansBySession.get(scan.session_id) ?? [];
    list.push(scan);
    scansBySession.set(scan.session_id, list);
  }
  const spotById = new Map(spots.map((s) => [s.id, s]));
  const goalById = new Map(goals.map((g) => [g.id, g]));

  const recentRoutes = sessions
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 20)
    .map((s) => ({
      sessionId: s.id,
      goal: s.goal_id ? (goalById.get(s.goal_id)?.name.ja ?? "—") : "—",
      spots: (scansBySession.get(s.id) ?? [])
        .sort((a, b) => a.scanned_at.localeCompare(b.scanned_at))
        .map((scan) => spotById.get(scan.spot_id)?.name.ja ?? "?"),
      completedAt: s.completed_at,
    }));

  const totalNav = scans.filter((s) => s.nav_clicked).length;

  return {
    sessions: sessions.length,
    completedSessions: completed.length,
    totalScans: scans.length,
    navClickRate: scans.length ? totalNav / scans.length : 0,
    detourRateMedian: rates.length ? Math.round(rates[Math.floor(rates.length / 2)]) : null,
    spots: spots.map((spot) => ({
      spot,
      scans: scanCount.get(spot.id) ?? 0,
      shown: shown.get(spot.id) ?? 0,
      taken: taken.get(spot.id) ?? 0,
      navClicks: navClicks.get(spot.id) ?? 0,
    })),
    goals: goals.map((goal) => ({
      goal,
      sessions: sessions.filter((s) => s.goal_id === goal.id).length,
    })),
    recentRoutes,
  };
}
