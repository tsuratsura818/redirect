/**
 * 匿名セッション。★PIIは一切扱わない（氏名・メール・電話・常時GPSを取らない）。
 * cookie には署名付きの session_id しか入れない。
 */

import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { getStore } from "./store";
import { PHASE1_LANGS, type Lang, type Session } from "./types";

const COOKIE_NAME = "mw_sid";
const MAX_AGE_SEC = 60 * 60 * 12; // 12時間 = 1日の観光行程ぶん

const DEV_SECRET = "mawarimichi-dev-secret-do-not-use-in-production";

function secret(): string {
  const value = process.env.QR_TOKEN_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    // 本番で署名なし運用に落ちないよう fail-closed
    throw new Error("QR_TOKEN_SECRET が未設定です（本番では必須）");
  }
  return DEV_SECRET;
}

function sign(sessionId: string): string {
  return createHmac("sha256", secret()).update(sessionId).digest("base64url");
}

function verify(value: string): string | null {
  const idx = value.lastIndexOf(".");
  if (idx <= 0) return null;
  const sessionId = value.slice(0, idx);
  const mac = value.slice(idx + 1);
  const expected = sign(sessionId);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return sessionId;
}

/** cookie から現在のセッションIDを取り出す（改ざんされていたら null） */
export async function readSessionId(): Promise<string | null> {
  const cookieStore = await cookies(); // ★Next.js 16 では async
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  return raw ? verify(raw) : null;
}

/** 現在のセッション。cookie が無い・DBに無い場合は null */
export async function readSession(): Promise<Session | null> {
  const sessionId = await readSessionId();
  if (!sessionId) return null;
  return getStore().getSession(sessionId);
}

/**
 * セッションを作って cookie に載せる。
 * ★Server Action / Route Handler からのみ呼べる（Server Component では cookie を書けない）
 */
export async function startSession(campaignId: string, lang: Lang): Promise<Session> {
  const session = await getStore().createSession({ campaignId, lang });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${session.id}.${sign(session.id)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
  return session;
}

/** 既存セッションがあれば返し、無ければ作る */
export async function getOrStartSession(campaignId: string, lang: Lang): Promise<Session> {
  const existing = await readSession();
  if (existing && existing.campaign_id === campaignId) return existing;
  return startSession(campaignId, lang);
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * 言語の好みを覚えるcookie。
 * ★セッションが生まれる前（＝目的地を選ぶ前）でも言語を切り替えられるようにするため。
 *   以前はセッションが無いと切替が黙って捨てられ、インバウンドの参加者が最初の画面で
 *   ENを押しても日本語のままだった。署名は要らない（秘密ではなく好みなので）。
 */
const LANG_COOKIE = "mw_lang";

export async function readLangCookie(allowed: Lang[] = PHASE1_LANGS): Promise<Lang | null> {
  const v = (await cookies()).get(LANG_COOKIE)?.value;
  return v && (allowed as string[]).includes(v) ? (v as Lang) : null;
}

export async function writeLangCookie(lang: Lang): Promise<void> {
  (await cookies()).set(LANG_COOKIE, lang, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

/** Accept-Language から初期言語を判定する。手動切替後はセッションの lang が優先 */
export function detectLang(acceptLanguage: string | null, allowed: Lang[] = PHASE1_LANGS): Lang {
  if (!acceptLanguage) return allowed[0];
  const tags = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of tags) {
    const base = tag.split("-")[0];
    const hit = allowed.find((l) => l === base);
    if (hit) return hit;
  }
  return allowed[0];
}
