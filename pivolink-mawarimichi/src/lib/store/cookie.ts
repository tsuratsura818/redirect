/**
 * cookie 実装 — DBなしで Vercel（サーバーレス）に載せるための保存先。
 *
 * なぜ必要か:
 *   MemoryStore はプロセス内にしか残らないので、サーバーレスでは
 *   リクエストごとに別インスタンスへ飛んだ瞬間にセッションが消える。
 *   実地テストのために「DBを用意せずに公開URLで通しで動かす」には、
 *   進行状態を参加者の端末（署名cookie）に持たせるのが最も確実。
 *
 * 何を持つか:
 *   スポット・目的地・ルールは seed.ts の静的データ（読み取りのみ）。
 *   可変なのは「その人の道中」だけなので、それを署名付きcookieに入れる。
 *
 * ★制約: 端末ごとに閉じるため、**回遊レポートの集計ができない**。
 *   分散状況を数字で見る運用に入る段階では Supabase に切り替えること。
 */

import "server-only";

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { seedCampaign, seedGoals, seedRules, seedSpots } from "@/data/seed";
import type { Campaign, Coupon, Goal, Lang, RoutingRule, Scan, Session, Spot } from "@/lib/types";

import type { CampaignReport, QrResolution, Store } from "./types";

const COOKIE = "mw_state";
const MAX_AGE_SEC = 60 * 60 * 12;
const DEV_SECRET = "mawarimichi-dev-secret-do-not-use-in-production";

/** cookieに入れる最小の状態。キーは短く（4KB制限があるため） */
interface State {
  i: string; // session id
  g: string | null; // goal id
  l: Lang;
  w: number; // walked_m
  d: number | null; // direct_m
  c: string | null; // completed_at
  t: string; // created_at
  s: { p: string; r: 0 | 1; t: string; c: string[] | null; n: 0 | 1 }[]; // scans
  u: string | null; // coupon code
}

function secret(): string {
  const v = process.env.QR_TOKEN_SECRET;
  if (v) return v;
  if (process.env.NODE_ENV === "production") throw new Error("QR_TOKEN_SECRET が未設定です");
  return DEV_SECRET;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

async function read(): Promise<State | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const i = raw.lastIndexOf(".");
  if (i <= 0) return null;
  const body = raw.slice(0, i);
  const mac = Buffer.from(raw.slice(i + 1));
  const expected = Buffer.from(sign(body));
  if (mac.length !== expected.length || !timingSafeEqual(mac, expected)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf-8")) as State;
  } catch {
    return null;
  }
}

async function write(state: State): Promise<void> {
  const body = Buffer.from(JSON.stringify(state), "utf-8").toString("base64url");
  (await cookies()).set(COOKIE, `${body}.${sign(body)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

const toSession = (s: State): Session => ({
  id: s.i,
  campaign_id: seedCampaign.id,
  goal_id: s.g,
  lang: s.l,
  walked_m: s.w,
  direct_m: s.d,
  completed_at: s.c,
  created_at: s.t,
});

const toScans = (s: State): Scan[] =>
  s.s.map((x, i) => ({
    id: `${s.i}-${i}`,
    session_id: s.i,
    spot_id: x.p,
    scanned_at: x.t,
    is_rare: x.r === 1,
    choice_shown: x.c,
    nav_clicked: x.n === 1,
  }));

export class CookieStore implements Store {
  readonly kind = "cookie" as const;

  async getCampaignBySlug(slug: string): Promise<Campaign | null> {
    return seedCampaign.slug === slug ? seedCampaign : null;
  }
  async getCampaignById(id: string): Promise<Campaign | null> {
    return seedCampaign.id === id ? seedCampaign : null;
  }
  async resolveQrToken(token: string): Promise<QrResolution | null> {
    if (seedCampaign.start_qr_token === token) return { kind: "start", campaign: seedCampaign };
    const spot = seedSpots.find((s) => s.qr_token === token && s.active);
    return spot ? { kind: "spot", campaign: seedCampaign, spot } : null;
  }
  async listGoals(): Promise<Goal[]> {
    return seedGoals.filter((g) => g.active).sort((a, b) => a.sort_order - b.sort_order);
  }
  async listSpots(_id: string, opts?: { includeInactive?: boolean }): Promise<Spot[]> {
    return seedSpots.filter((s) => opts?.includeInactive || s.active);
  }
  async listRules(): Promise<RoutingRule[]> {
    return seedRules.filter((r) => r.active);
  }
  async getGoal(goalId: string): Promise<Goal | null> {
    return seedGoals.find((g) => g.id === goalId) ?? null;
  }
  async getSpot(spotId: string): Promise<Spot | null> {
    return seedSpots.find((s) => s.id === spotId) ?? null;
  }

  async createSession({ lang }: { campaignId: string; lang: Lang }): Promise<Session> {
    const state: State = {
      i: randomUUID(),
      g: null,
      l: lang,
      w: 0,
      d: null,
      c: null,
      t: new Date().toISOString(),
      s: [],
      u: null,
    };
    await write(state);
    return toSession(state);
  }

  async getSession(sessionId: string): Promise<Session | null> {
    const s = await read();
    return s && s.i === sessionId ? toSession(s) : null;
  }

  async updateSession(
    sessionId: string,
    patch: Partial<Pick<Session, "goal_id" | "lang" | "walked_m" | "direct_m" | "completed_at">>,
  ): Promise<Session | null> {
    const s = await read();
    if (!s || s.i !== sessionId) return null;
    if (patch.goal_id !== undefined) s.g = patch.goal_id;
    if (patch.lang !== undefined) s.l = patch.lang;
    if (patch.walked_m !== undefined) s.w = Number(patch.walked_m);
    if (patch.direct_m !== undefined) s.d = patch.direct_m === null ? null : Number(patch.direct_m);
    if (patch.completed_at !== undefined) s.c = patch.completed_at;
    await write(s);
    return toSession(s);
  }

  async listScans(sessionId: string): Promise<Scan[]> {
    const s = await read();
    return s && s.i === sessionId ? toScans(s) : [];
  }

  async insertScan(input: {
    sessionId: string;
    spotId: string;
    isRare: boolean;
    choiceShown: string[] | null;
  }): Promise<{ scan: Scan; created: boolean }> {
    const s = await read();
    if (!s || s.i !== input.sessionId) throw new Error("セッションがありません");

    const idx = s.s.findIndex((x) => x.p === input.spotId);
    if (idx >= 0) return { scan: toScans(s)[idx], created: false }; // ★二重押印を防ぐ

    s.s.push({
      p: input.spotId,
      r: input.isRare ? 1 : 0,
      t: new Date().toISOString(),
      c: input.choiceShown,
      n: 0,
    });
    await write(s);
    return { scan: toScans(s)[s.s.length - 1], created: true };
  }

  async markNavClicked(sessionId: string, spotId: string): Promise<void> {
    const s = await read();
    if (!s || s.i !== sessionId) return;
    const hit = s.s.find((x) => x.p === spotId);
    if (!hit || hit.n === 1) return;
    hit.n = 1;
    await write(s);
  }

  async getCoupon(sessionId: string): Promise<Coupon | null> {
    const s = await read();
    if (!s || s.i !== sessionId || !s.u) return null;
    return {
      id: `${s.i}-coupon`,
      session_id: s.i,
      code: s.u,
      issued_at: s.c ?? s.t,
      used_at: null,
      used_shop: null,
    };
  }

  async issueCoupon(sessionId: string, code: string): Promise<Coupon> {
    const s = await read();
    if (!s || s.i !== sessionId) throw new Error("セッションがありません");
    if (!s.u) {
      s.u = code;
      await write(s);
    }
    return (await this.getCoupon(sessionId))!;
  }

  /** cookie方式では重みを永続化できない（端末に配れない）。読み取り専用にする */
  async updateSpot(): Promise<Spot | null> {
    return null;
  }

  /** 端末ごとに閉じているので、他の参加者の混雑は分からない。常に空を返す */
  async getRecentScanCounts(): Promise<Record<string, number>> {
    return {};
  }

  /** DB未接続では保存先が無い。管理画面側で「Supabaseを繋いでください」を出す */
  async saveCampaign(): Promise<null> {
    return null;
  }
  async createGoal(): Promise<never> {
    throw new Error("このモードでは目的地を追加できません（Supabaseに接続してください）");
  }
  async saveGoal(): Promise<null> {
    return null;
  }
  async deleteGoal(): Promise<{ ok: boolean; reason?: string }> {
    return { ok: false, reason: "このモードでは目的地を削除できません" };
  }
  async createSpot(): Promise<never> {
    throw new Error("DB未接続のためスポットを追加できません（Supabaseを接続してください）");
  }
  async saveSpot(): Promise<Spot | null> {
    return null;
  }
  async deleteSpot(): Promise<{ ok: boolean; reason?: string }> {
    return { ok: false, reason: "DB未接続のため削除できません" };
  }

  /** 端末ごとに閉じているため集計できない。管理画面には空で返し、画面側で理由を出す */
  async getReport(): Promise<CampaignReport> {
    return {
      sessions: 0,
      completedSessions: 0,
      totalScans: 0,
      navClickRate: 0,
      detourRateMedian: null,
      spots: seedSpots.map((spot) => ({ spot, scans: 0, shown: 0, taken: 0, navClicks: 0 })),
      goals: seedGoals.map((goal) => ({ goal, sessions: 0 })),
      recentRoutes: [],
    };
  }
}
