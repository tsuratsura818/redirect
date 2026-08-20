/**
 * データアクセスの抽象。
 *
 * 実装は2つ:
 *   - SupabaseStore  … 本番。書き込みは service_role（Route Handler内）からのみ
 *   - MemoryStore    … Supabase未設定時の開発・デモ用（プロセス内保持・再起動で消える）
 *
 * UI/APIはこのインターフェースにしか依存しないので、DB接続が用意でき次第 env を入れるだけで切り替わる。
 */

import type { CampaignInput } from "@/lib/campaign-input";
import type { GoalInput } from "@/lib/goal-input";
import type { SpotInput } from "@/lib/spot-input";
import type { Campaign, Coupon, Goal, Lang, RoutingRule, Scan, Session, Spot } from "@/lib/types";

export type QrResolution =
  | { kind: "start"; campaign: Campaign }
  | { kind: "spot"; campaign: Campaign; spot: Spot };

export interface SpotReportRow {
  spot: Spot;
  /** スキャン数（＝スタンプ数） */
  scans: number;
  /** 二択で提示された回数 */
  shown: number;
  /** 提示されて選ばれた回数 */
  taken: number;
  /** ナビリンクがタップされた回数 */
  navClicks: number;
}

export interface CampaignReport {
  sessions: number;
  completedSessions: number;
  totalScans: number;
  navClickRate: number;
  /** まわりみち率の中央値(%) — 完走セッションのみ */
  detourRateMedian: number | null;
  spots: SpotReportRow[];
  goals: { goal: Goal; sessions: number }[];
  /** 直近のルート（新しい順） */
  recentRoutes: { sessionId: string; goal: string; spots: string[]; completedAt: string | null }[];
}

export interface Store {
  /** 実装の識別子。UIに「デモモード」を出すために使う */
  readonly kind: "supabase" | "memory" | "cookie";

  getCampaignBySlug(slug: string): Promise<Campaign | null>;
  getCampaignById(id: string): Promise<Campaign | null>;
  /** QRトークンを引く。スタートQRとスポットQRを1つの入口で捌く */
  resolveQrToken(token: string): Promise<QrResolution | null>;

  listGoals(campaignId: string, opts?: { includeInactive?: boolean }): Promise<Goal[]>;
  listSpots(campaignId: string, opts?: { includeInactive?: boolean }): Promise<Spot[]>;
  listRules(campaignId: string): Promise<RoutingRule[]>;
  getGoal(goalId: string): Promise<Goal | null>;
  getSpot(spotId: string): Promise<Spot | null>;

  createSession(input: { campaignId: string; lang: Lang }): Promise<Session>;
  getSession(sessionId: string): Promise<Session | null>;
  updateSession(
    sessionId: string,
    patch: Partial<Pick<Session, "goal_id" | "lang" | "walked_m" | "direct_m" | "completed_at">>,
  ): Promise<Session | null>;

  listScans(sessionId: string): Promise<Scan[]>;
  /**
   * スタンプ登録。(session_id, spot_id) の一意制約で二重押印を防ぐ。
   * created=false は「すでに押印済み」= 二重スキャン。
   */
  insertScan(input: {
    sessionId: string;
    spotId: string;
    isRare: boolean;
    choiceShown: string[] | null;
  }): Promise<{ scan: Scan; created: boolean }>;
  markNavClicked(sessionId: string, spotId: string): Promise<void>;

  getCoupon(sessionId: string): Promise<Coupon | null>;
  issueCoupon(sessionId: string, code: string): Promise<Coupon>;

  // --- 管理 ---
  updateSpot(
    spotId: string,
    patch: Partial<Pick<Spot, "capacity_weight" | "congestion_level" | "active" | "map_url" | "image_url">>,
  ): Promise<Spot | null>;
  /**
   * 直近 windowMinutes 分のスポット別スキャン数。混雑の自動判定に使う。
   * 参加者がいない時間帯は全部0になり、抽選には影響しない。
   */
  getRecentScanCounts(campaignId: string, windowMinutes: number): Promise<Record<string, number>>;

  getReport(campaignId: string): Promise<CampaignReport>;

  /** キャンペーン設定の更新（スタート地点・寄り道数・開催期間など） */
  saveCampaign(campaignId: string, input: CampaignInput): Promise<Campaign | null>;

  /** 目的地の作成・更新・削除。★セッションで使われている目的地は消せない */
  createGoal(campaignId: string, input: GoalInput): Promise<Goal>;
  saveGoal(goalId: string, input: GoalInput): Promise<Goal | null>;
  deleteGoal(goalId: string): Promise<{ ok: boolean; reason?: string }>;

  /** スポットの新規作成。qr_token は自動採番する */
  createSpot(campaignId: string, input: SpotInput): Promise<Spot>;
  /** スポットの全項目更新 */
  saveSpot(spotId: string, input: SpotInput): Promise<Spot | null>;
  /**
   * スポットの削除。★スキャン履歴があるものは消せない（実績が消えるため）。
   * その場合は「公開」を外して運用から external する。
   */
  deleteSpot(spotId: string): Promise<{ ok: boolean; reason?: string }>;
}
