/**
 * まわりみちの管理画面から、PivoLink 側のQRとルールを作る層。
 *
 * ★これが無いと輪が閉じない。
 *   管理画面でスポットを足しても PivoLink にQRが無ければ、現地に貼る /r/ のURLが存在せず、
 *   時間帯ルールもA/Bテストも付かない。「PivoLinkが動かしている」という前提が、
 *   新しいスポットにだけ適用されない状態になる。
 *
 * ★営業時間の二重管理もここで解消する。
 *   スポットを保存するたびに PivoLink の時間帯ルールを作り直すので、
 *   管理画面の営業時間が唯一の正になる（手動でスクリプトを回す必要がない）。
 *
 * ★安全側の設計:
 *   - env が無ければ何もしない（未設定の環境で落とさない）
 *   - 触るのは slug が `mawarimichi-` で始まる行だけ。PivoLink の他の案件のQRには一切触れない
 *   - 失敗しても呼び出し側のスポット保存は成功させる（PivoLink都合でスポット編集を止めない）
 */

import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { OpenHours } from "./hours";
import type { Spot } from "./types";

export const PREFIX = "mawarimichi-";

/** A/Bテストの枝。「毎回違う道」の本体 */
export const PICKS = [
  { key: "a", weight: 34 },
  { key: "b", weight: 33 },
  { key: "c", weight: 33 },
];

export interface PivolinkQrStatus {
  /** env が入っていて操作できるか */
  configured: boolean;
  /** PivoLink にQRの行があるか */
  registered: boolean;
  /** 現地の看板に焼くURL。★QR画像はこれを焼くこと（アプリの直URLではない） */
  redirectUrl: string;
  /** PivoLink が現在指している遷移先 */
  destination: string | null;
  /** 付いているルールの内訳 */
  rules: { type: string; name: string; destination: string }[];
  /** ダッシュボードで開くURL */
  dashboardUrl: string | null;
  error?: string;
}

function env(name: string): string | null {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : null;
}

export function redirectOrigin(): string {
  return env("PIVOLINK_REDIRECT_ORIGIN") ?? "https://redirect.tsuratsura.com";
}

export function qrSlugFor(spotSlug: string): string {
  return `${PREFIX}${spotSlug}`;
}

export function pivolinkRedirectUrl(spotSlug: string): string {
  return `${redirectOrigin()}/r/${qrSlugFor(spotSlug)}`;
}

let cached: SupabaseClient | null = null;
/** キャンペーン側（pivolink-campaign.ts）からも使うので公開する */
export function pivolinkClient(): SupabaseClient | null {
  return db();
}
function db(): SupabaseClient | null {
  if (cached) return cached;
  const url = env("PIVOLINK_SUPABASE_URL");
  const key = env("PIVOLINK_SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}

export function pivolinkConfigured(): boolean {
  return db() !== null;
}

/** 所有者ユーザーID。qr_codes.user_id に必要 */
let ownerId: string | null = null;
export async function pivolinkOwnerId(): Promise<string | null> {
  const c = db();
  return c ? resolveOwnerId(c) : null;
}
async function resolveOwnerId(client: SupabaseClient): Promise<string | null> {
  if (ownerId) return ownerId;
  const explicit = env("PIVOLINK_OWNER_ID");
  if (explicit) return (ownerId = explicit);

  const email = env("PIVOLINK_OWNER_EMAIL");
  if (!email) return null;
  const { data } = await client.auth.admin.listUsers();
  ownerId = data?.users.find((u) => u.email === email)?.id ?? null;
  return ownerId;
}

export async function getQrStatus(spotSlug: string): Promise<PivolinkQrStatus> {
  const base: PivolinkQrStatus = {
    configured: false,
    registered: false,
    redirectUrl: pivolinkRedirectUrl(spotSlug),
    destination: null,
    rules: [],
    dashboardUrl: null,
  };

  const client = db();
  if (!client) return base;

  try {
    const { data: qr } = await client
      .from("qr_codes")
      .select("id, default_url")
      .eq("slug", qrSlugFor(spotSlug))
      .maybeSingle();

    if (!qr) return { ...base, configured: true };

    const { data: rules } = await client
      .from("redirect_rules")
      .select("condition_type, name, destination_url")
      .eq("qr_code_id", qr.id)
      .eq("is_active", true)
      .order("priority", { ascending: false });

    return {
      ...base,
      configured: true,
      registered: true,
      destination: (qr as { default_url: string }).default_url,
      rules: (rules ?? []).map((r) => ({
        type: (r as { condition_type: string }).condition_type,
        name: (r as { name: string }).name,
        destination: (r as { destination_url: string }).destination_url,
      })),
      dashboardUrl: `${redirectOrigin()}/dashboard/qr/${(qr as { id: string }).id}`,
    };
  } catch (e) {
    return { ...base, configured: true, error: e instanceof Error ? e.message : String(e) };
  }
}

/** 営業時間から「閉まっている時間帯」のルールを組む（開店前・閉店後の最大2本） */
function closedBands(hours: OpenHours | null | undefined) {
  if (!hours) return [];
  const pad = (h: number) => String(h).padStart(2, "0");
  const out: { name: string; start: string; end: string }[] = [];
  if (hours.from > 0)
    out.push({
      name: `開店前（0:00-${pad(hours.from - 1)}:59）`,
      start: "00:00",
      end: `${pad(hours.from - 1)}:59`,
    });
  if (hours.to < 24)
    out.push({ name: `閉店後（${pad(hours.to)}:00-23:59）`, start: `${pad(hours.to)}:00`, end: "23:59" });
  return out;
}

/**
 * スポットのQRとルールを PivoLink 側に作る／作り直す。
 *
 * ★時間帯ルールは「営業時間の外」だけに張る。
 *   1日を覆うと評価順（time_of_day > ab_test）で A/Bテストが一度も発火しなくなる。
 * ★ステップ（scan_step）はスポットQRには張らない。
 *   PivoLink は「visit ≦ 読込回数のうち最大」を採用して以後継続するため、
 *   3回読んだ端末が同じ枝に固定され、「毎回違う道」が止まる。
 */
export async function syncSpotQr(
  spot: Spot,
  appOrigin: string,
): Promise<{ ok: boolean; message: string }> {
  const client = db();
  if (!client) return { ok: false, message: "PivoLink の接続情報が設定されていません" };

  const owner = await resolveOwnerId(client);
  if (!owner) return { ok: false, message: "PivoLink の所有者ユーザーを特定できません" };

  const slug = qrSlugFor(spot.slug);
  const dest = `${appOrigin.replace(/\/$/, "")}/s/${spot.qr_token}`;

  try {
    const { data: qr, error: upsertErr } = await client
      .from("qr_codes")
      .upsert(
        {
          user_id: owner,
          slug,
          name: `まわりみち｜${spot.name.ja ?? spot.slug}`,
          description: "まわりみちの寄り道スポット。遷移先とルールは管理画面から生成",
          default_url: dest,
          is_active: spot.active,
          qr_color_dark: "#1B1814",
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();
    if (upsertErr) throw upsertErr;

    const qrId = (qr as { id: string }).id;

    // ルールは総入れ替え。ただし開催期間（schedule / scheduled_switch）は
    // キャンペーン全体の設定なので消さない
    await client
      .from("redirect_rules")
      .delete()
      .eq("qr_code_id", qrId)
      .in("condition_type", ["time_of_day", "ab_test", "scan_step"]);

    const rows: Record<string, unknown>[] = [];

    for (const [i, b] of closedBands(spot.open_hours).entries()) {
      rows.push({
        qr_code_id: qrId,
        name: b.name,
        destination_url: `${dest}?closed=1`,
        priority: 300 - i,
        condition_type: "time_of_day",
        condition_value: { start_time: b.start, end_time: b.end },
        is_active: true,
      });
    }

    for (const [i, p] of PICKS.entries()) {
      rows.push({
        qr_code_id: qrId,
        name: `ランダム振り分け ${p.key.toUpperCase()}`,
        destination_url: `${dest}?pick=${p.key}`,
        priority: 100 - i,
        condition_type: "ab_test",
        condition_value: { weight: p.weight },
        is_active: true,
      });
    }

    const { error: insErr } = await client.from("redirect_rules").insert(rows);
    if (insErr) throw insErr;

    const closed = closedBands(spot.open_hours).length;
    return {
      ok: true,
      message: `PivoLink を更新しました（時間帯${closed}件・A/Bテスト${PICKS.length}件）`,
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}

/** スポットを消すとき、PivoLink 側のQRも止める（行は残して無効化） */
export async function deactivateSpotQr(spotSlug: string): Promise<void> {
  const client = db();
  if (!client) return;
  await client.from("qr_codes").update({ is_active: false }).eq("slug", qrSlugFor(spotSlug));
}
