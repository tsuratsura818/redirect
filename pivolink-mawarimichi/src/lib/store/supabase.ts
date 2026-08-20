/**
 * Supabase 実装。
 * 参加者の書き込みはすべてこの層（= Route Handler = サーバー側）から service_role で行う。
 * クライアントから sessions/scans/coupons へ直接INSERTさせない（0001_init.sql の RLS 方針）。
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { CampaignInput } from "@/lib/campaign-input";
import type { GoalInput } from "@/lib/goal-input";
import type { SpotInput } from "@/lib/spot-input";
import type { Campaign, Coupon, Goal, Lang, RoutingRule, Scan, Session, Spot } from "@/lib/types";

import { buildReport } from "./memory";
import type { CampaignReport, QrResolution, Store } from "./types";

function client(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env が未設定です");
  return createClient(url, key, { auth: { persistSession: false } });
}

export class SupabaseStore implements Store {
  readonly kind = "supabase" as const;
  private db = client();

  async getCampaignBySlug(slug: string): Promise<Campaign | null> {
    const { data } = await this.db.from("campaigns").select("*").eq("slug", slug).maybeSingle();
    return (data as Campaign | null) ?? null;
  }

  async getCampaignById(id: string): Promise<Campaign | null> {
    const { data } = await this.db.from("campaigns").select("*").eq("id", id).maybeSingle();
    return (data as Campaign | null) ?? null;
  }

  async resolveQrToken(token: string): Promise<QrResolution | null> {
    const { data: campaign } = await this.db
      .from("campaigns")
      .select("*")
      .eq("start_qr_token", token)
      .maybeSingle();
    if (campaign) return { kind: "start", campaign: campaign as Campaign };

    const { data: spot } = await this.db
      .from("spots")
      .select("*")
      .eq("qr_token", token)
      .eq("active", true)
      .maybeSingle();
    if (!spot) return null;

    const { data: spotCampaign } = await this.db
      .from("campaigns")
      .select("*")
      .eq("id", (spot as Spot).campaign_id)
      .maybeSingle();
    if (!spotCampaign) return null;

    return { kind: "spot", campaign: spotCampaign as Campaign, spot: spot as Spot };
  }

  async listGoals(campaignId: string, opts?: { includeInactive?: boolean }): Promise<Goal[]> {
    let q = this.db.from("goals").select("*").eq("campaign_id", campaignId);
    if (!opts?.includeInactive) q = q.eq("active", true);
    const { data } = await q.order("sort_order");
    return (data as Goal[]) ?? [];
  }

  async saveCampaign(campaignId: string, input: CampaignInput): Promise<Campaign | null> {
    const { data, error } = await this.db
      .from("campaigns")
      .update(input)
      .eq("id", campaignId)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Campaign | null) ?? null;
  }

  async createGoal(campaignId: string, input: GoalInput): Promise<Goal> {
    const { data, error } = await this.db
      .from("goals")
      .insert({ campaign_id: campaignId, grad: ["#3A5E4A", "#7BA05B"], ...input })
      .select("*")
      .single();
    if (error) throw new Error(error.code === "23505" ? "同じスラッグの目的地が既にあります" : error.message);
    return data as Goal;
  }

  async saveGoal(goalId: string, input: GoalInput): Promise<Goal | null> {
    const { data, error } = await this.db
      .from("goals").update(input).eq("id", goalId).select("*").maybeSingle();
    if (error) throw new Error(error.code === "23505" ? "同じスラッグの目的地が既にあります" : error.message);
    return (data as Goal | null) ?? null;
  }

  async deleteGoal(goalId: string): Promise<{ ok: boolean; reason?: string }> {
    // ★選ばれた実績のある目的地は消さない。消すとレポートの内訳が壊れる
    const { count } = await this.db
      .from("sessions").select("id", { count: "exact", head: true }).eq("goal_id", goalId);
    if ((count ?? 0) > 0)
      return { ok: false, reason: "この目的地を選んだ参加者がいるため削除できません。「公開」を外してください" };
    const { error } = await this.db.from("goals").delete().eq("id", goalId);
    return error ? { ok: false, reason: error.message } : { ok: true };
  }

  async listSpots(campaignId: string, opts?: { includeInactive?: boolean }): Promise<Spot[]> {
    let query = this.db.from("spots").select("*").eq("campaign_id", campaignId);
    if (!opts?.includeInactive) query = query.eq("active", true);
    const { data } = await query.order("slug");
    return (data as Spot[]) ?? [];
  }

  async listRules(campaignId: string): Promise<RoutingRule[]> {
    const { data } = await this.db
      .from("routing_rules")
      .select("*")
      .eq("campaign_id", campaignId)
      .eq("active", true)
      .order("priority");
    return (data as RoutingRule[]) ?? [];
  }

  async getGoal(goalId: string): Promise<Goal | null> {
    const { data } = await this.db.from("goals").select("*").eq("id", goalId).maybeSingle();
    return (data as Goal | null) ?? null;
  }

  async getSpot(spotId: string): Promise<Spot | null> {
    const { data } = await this.db.from("spots").select("*").eq("id", spotId).maybeSingle();
    return (data as Spot | null) ?? null;
  }

  async createSession({ campaignId, lang }: { campaignId: string; lang: Lang }): Promise<Session> {
    const { data, error } = await this.db
      .from("sessions")
      .insert({ campaign_id: campaignId, lang })
      .select("*")
      .single();
    if (error) throw error;
    return data as Session;
  }

  async getSession(sessionId: string): Promise<Session | null> {
    const { data } = await this.db.from("sessions").select("*").eq("id", sessionId).maybeSingle();
    return (data as Session | null) ?? null;
  }

  async updateSession(
    sessionId: string,
    patch: Partial<Pick<Session, "goal_id" | "lang" | "walked_m" | "direct_m" | "completed_at">>,
  ): Promise<Session | null> {
    const { data } = await this.db
      .from("sessions")
      .update(patch)
      .eq("id", sessionId)
      .select("*")
      .maybeSingle();
    return (data as Session | null) ?? null;
  }

  async listScans(sessionId: string): Promise<Scan[]> {
    const { data } = await this.db
      .from("scans")
      .select("*")
      .eq("session_id", sessionId)
      .order("scanned_at");
    return (data as Scan[]) ?? [];
  }

  async insertScan(input: {
    sessionId: string;
    spotId: string;
    isRare: boolean;
    choiceShown: string[] | null;
  }): Promise<{ scan: Scan; created: boolean }> {
    const { data, error } = await this.db
      .from("scans")
      .insert({
        session_id: input.sessionId,
        spot_id: input.spotId,
        is_rare: input.isRare,
        choice_shown: input.choiceShown,
      })
      .select("*")
      .single();

    if (!error) return { scan: data as Scan, created: true };

    // 23505 = unique_violation → (session_id, spot_id) の二重押印。既存を返す
    if (error.code === "23505") {
      const { data: existing } = await this.db
        .from("scans")
        .select("*")
        .eq("session_id", input.sessionId)
        .eq("spot_id", input.spotId)
        .single();
      return { scan: existing as Scan, created: false };
    }
    throw error;
  }

  async markNavClicked(sessionId: string, spotId: string): Promise<void> {
    await this.db
      .from("scans")
      .update({ nav_clicked: true })
      .eq("session_id", sessionId)
      .eq("spot_id", spotId);
  }

  async getCoupon(sessionId: string): Promise<Coupon | null> {
    const { data } = await this.db
      .from("coupons")
      .select("*")
      .eq("session_id", sessionId)
      .maybeSingle();
    return (data as Coupon | null) ?? null;
  }

  async issueCoupon(sessionId: string, code: string): Promise<Coupon> {
    const existing = await this.getCoupon(sessionId);
    if (existing) return existing;
    const { data, error } = await this.db
      .from("coupons")
      .insert({ session_id: sessionId, code })
      .select("*")
      .single();
    if (error) throw error;
    return data as Coupon;
  }

  async updateSpot(
    spotId: string,
    patch: Partial<Pick<Spot, "capacity_weight" | "congestion_level" | "active" | "map_url" | "image_url">>,
  ): Promise<Spot | null> {
    const { data } = await this.db
      .from("spots")
      .update(patch)
      .eq("id", spotId)
      .select("*")
      .maybeSingle();
    return (data as Spot | null) ?? null;
  }

  async getRecentScanCounts(campaignId: string, windowMinutes: number): Promise<Record<string, number>> {
    const since = new Date(Date.now() - windowMinutes * 60_000).toISOString();
    const spots = await this.listSpots(campaignId, { includeInactive: true });
    if (!spots.length) return {};
    const { data } = await this.db
      .from("scans")
      .select("spot_id")
      .gte("scanned_at", since)
      .in("spot_id", spots.map((s) => s.id));
    const out: Record<string, number> = {};
    for (const row of (data as { spot_id: string }[]) ?? []) {
      out[row.spot_id] = (out[row.spot_id] ?? 0) + 1;
    }
    return out;
  }

  async createSpot(campaignId: string, input: SpotInput): Promise<Spot> {
    const { data, error } = await this.db
      .from("spots")
      .insert({ campaign_id: campaignId, grad: ["#4A3B30", "#857D6E"], rare_config: { prob: 0.2 }, ...input })
      .select("*")
      .single();
    // 23505 = unique_violation（campaign_id, slug）
    if (error) throw new Error(error.code === "23505" ? "同じスラッグのスポットが既にあります" : error.message);
    return data as Spot;
  }

  async saveSpot(spotId: string, input: SpotInput): Promise<Spot | null> {
    const { data, error } = await this.db
      .from("spots")
      .update(input)
      .eq("id", spotId)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.code === "23505" ? "同じスラッグのスポットが既にあります" : error.message);
    return (data as Spot | null) ?? null;
  }

  async deleteSpot(spotId: string): Promise<{ ok: boolean; reason?: string }> {
    const { count } = await this.db
      .from("scans")
      .select("id", { count: "exact", head: true })
      .eq("spot_id", spotId);
    if ((count ?? 0) > 0)
      return { ok: false, reason: "スキャン履歴があるため削除できません。「公開」を外してください" };
    const { error } = await this.db.from("spots").delete().eq("id", spotId);
    return error ? { ok: false, reason: error.message } : { ok: true };
  }

  async getReport(campaignId: string): Promise<CampaignReport> {
    const [spots, goals, sessionsRes] = await Promise.all([
      this.listSpots(campaignId, { includeInactive: true }),
      this.db.from("goals").select("*").eq("campaign_id", campaignId),
      this.db.from("sessions").select("*").eq("campaign_id", campaignId),
    ]);

    const sessions = (sessionsRes.data as Session[]) ?? [];
    const sessionIds = sessions.map((s) => s.id);
    const scans = sessionIds.length
      ? ((await this.db.from("scans").select("*").in("session_id", sessionIds)).data as Scan[]) ?? []
      : [];

    return buildReport({ spots, sessions, scans, goals: (goals.data as Goal[]) ?? [] });
  }
}
