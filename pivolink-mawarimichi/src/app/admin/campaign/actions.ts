"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdmin } from "@/lib/admin";
import { parseCampaignInput } from "@/lib/campaign-input";
import {
  deleteSponsor,
  saveSponsor,
  syncCampaignPeriod,
  syncStartQr,
  type Sponsor,
} from "@/lib/pivolink-campaign";
import { getStore } from "@/lib/store";

function campaignSlug(): string {
  return process.env.NEXT_PUBLIC_DEFAULT_CAMPAIGN ?? "kyoto-higashiyama";
}

function appOrigin(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "";
}

/** ★redirect は never を返すので、呼び出し側は必ず return を付けて後続を止める */
function back(msg: string, ok = true): never {
  redirect(`/admin/campaign?${ok ? "ok" : "error"}=${encodeURIComponent(msg)}`);
}

/**
 * キャンペーン設定の保存。
 * ★保存すると PivoLink の期間ルールとスタートQRも作り直す。
 *   日付を管理画面と PivoLink の2箇所に手入力させないため。
 */
export async function saveCampaignAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");

  const parsed = parseCampaignInput(formData);
  if (!parsed.ok) return back(parsed.errors.join(" / "), false);

  const store = getStore();
  const campaign = await store.getCampaignBySlug(campaignSlug());
  if (!campaign) return back("キャンペーンが見つかりません", false);

  const saved = await store.saveCampaign(campaign.id, parsed.value);
  if (!saved) return back("保存できませんでした（DB未接続の可能性）", false);

  const notes: string[] = ["設定を保存しました"];
  const origin = appOrigin();
  if (origin) {
    const start = await syncStartQr(saved, origin);
    notes.push(start.message);
    const period = await syncCampaignPeriod(saved.starts_at ?? null, saved.ends_at ?? null, origin);
    notes.push(period.message);
  } else {
    notes.push("NEXT_PUBLIC_APP_URL が未設定のため PivoLink には反映していません");
  }

  revalidatePath("/admin/campaign");
  back(notes.join(" ／ "));
}

/** スタートQRだけを作り直す（ルールを手で壊したときの復旧用） */
export async function rebuildStartQrAction() {
  if (!(await isAdmin())) redirect("/admin/login");
  const campaign = await getStore().getCampaignBySlug(campaignSlug());
  if (!campaign) return back("キャンペーンが見つかりません", false);
  const r = await syncStartQr(campaign, appOrigin());
  revalidatePath("/admin/campaign");
  back(r.message, r.ok);
}

/* ---------- スポンサーCM枠 ---------- */

function sponsorFrom(fd: FormData): Sponsor {
  const s = (k: string, d = "") => String(fd.get(k) ?? d).trim();
  const n = Number(s("seconds", "15"));
  return {
    slug: "",
    key: s("key").toLowerCase(),
    name: s("name"),
    title: s("title"),
    message: s("message"),
    buttonText: s("buttonText", "道にもどる"),
    background: s("background", "#2A2620"),
    textColor: s("textColor", "#FFFFFF"),
    accent: s("accent", "#E2543F"),
    seconds: Number.isFinite(n) && n >= 0 && n <= 60 ? n : 15,
    couponCode: s("couponCode"),
    couponNote: s("couponNote"),
    active: fd.get("active") === "on",
  };
}

export async function saveSponsorAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const origin = appOrigin();
  if (!origin) return back("NEXT_PUBLIC_APP_URL が未設定です", false);
  const r = await saveSponsor(sponsorFrom(formData), origin);
  revalidatePath("/admin/campaign");
  back(r.message, r.ok);
}

export async function deleteSponsorAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const key = String(formData.get("key") ?? "");
  if (!key) return back("枠IDがありません", false);
  await deleteSponsor(key, appOrigin());
  revalidatePath("/admin/campaign");
  back(`CM枠「${key}」を削除しました`);
}
