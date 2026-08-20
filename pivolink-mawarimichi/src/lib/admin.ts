/**
 * 管理画面の認証。
 * ★fail-closed: 本番で ADMIN_PASSWORD が未設定なら「素通り」ではなく「常に拒否」する。
 *   （env 未設定で認証が無効化される事故を過去に踏んでいるため）
 */

import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "mw_admin";
const MAX_AGE_SEC = 60 * 60 * 8;
const DEV_PASSWORD = "mawarimichi";

export type AdminGate =
  | { ok: true; password: string; devDefault: boolean }
  | { ok: false; reason: "not-configured" };

/** 使うべきパスワード。本番で未設定なら認証不能（＝全拒否） */
export function adminGate(): AdminGate {
  const configured = process.env.ADMIN_PASSWORD;
  if (configured) return { ok: true, password: configured, devDefault: false };
  if (process.env.NODE_ENV === "production") return { ok: false, reason: "not-configured" };
  return { ok: true, password: DEV_PASSWORD, devDefault: true };
}

function secret(): string {
  return process.env.QR_TOKEN_SECRET ?? "mawarimichi-dev-secret-do-not-use-in-production";
}

function token(password: string): string {
  return createHmac("sha256", secret()).update(`admin:${password}`).digest("base64url");
}

export async function isAdmin(): Promise<boolean> {
  const gate = adminGate();
  if (!gate.ok) return false;

  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return false;

  const a = Buffer.from(raw);
  const b = Buffer.from(token(gate.password));
  return a.length === b.length && timingSafeEqual(a, b);
}

/** パスワードを検証して管理cookieを発行する */
export async function signInAdmin(password: string): Promise<boolean> {
  const gate = adminGate();
  if (!gate.ok) return false;

  const given = Buffer.from(password);
  const expected = Buffer.from(gate.password);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return false;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token(gate.password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
  return true;
}

export async function signOutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
