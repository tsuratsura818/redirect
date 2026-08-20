import "server-only";

import { CookieStore } from "./cookie";
import { MemoryStore } from "./memory";
import { SupabaseStore } from "./supabase";
import type { Store } from "./types";

let cached: Store | null = null;

/**
 * Supabase の env が揃っていれば Supabase、無ければインメモリ（デモモード）。
 * 本番デプロイ時に env を入れ忘れると黙ってデモモードで動いてしまうので、
 * 参加者UI/管理画面に「DEMO」バンドを出して気づけるようにしてある。
 */
export function getStore(): Store {
  if (cached) return cached;

  const hasSupabase =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (hasSupabase) {
    cached = new SupabaseStore();
  } else if (process.env.MAWARIMICHI_STORE === "cookie" || process.env.VERCEL) {
    // サーバーレスではインメモリが保たないので、進行状態を端末の署名cookieに持たせる
    cached = new CookieStore();
  } else {
    cached = new MemoryStore();
  }
  return cached;
}

export type { CampaignReport, QrResolution, Store } from "./types";
