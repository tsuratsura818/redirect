"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdmin } from "@/lib/admin";
import { deactivateSpotQr, pivolinkConfigured, syncSpotQr } from "@/lib/pivolink-admin";
import { parseSpotInput } from "@/lib/spot-input";
import { getStore } from "@/lib/store";
import type { Spot } from "@/lib/types";

function campaignSlug(): string {
  return process.env.NEXT_PUBLIC_DEFAULT_CAMPAIGN ?? "kyoto-higashiyama";
}

function appOrigin(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "";
}

/**
 * スポットを保存したら PivoLink 側のQRとルールも作り直す。
 * ★ここを自動にしないと、営業時間を直しても PivoLink が古いままになり、
 *   「閉まっているのに通常画面へ送る」が起きる。同じ情報を人手で2回入れさせない。
 * ★PivoLink 側が失敗してもスポットの保存自体は成功させる（編集を止めない）。
 *   結果は画面に出す。
 */
async function syncQr(spot: Spot): Promise<string> {
  if (!pivolinkConfigured()) return "";
  const origin = appOrigin();
  if (!origin) return "pv=noorigin";
  const r = await syncSpotQr(spot, origin);
  return r.ok ? "pv=ok" : `pv=${encodeURIComponent(r.message.slice(0, 120))}`;
}

export async function createSpotAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");

  const parsed = parseSpotInput(formData);
  if (!parsed.ok) redirect(`/admin/spots/new?error=${encodeURIComponent(parsed.errors.join(" / "))}`);

  const store = getStore();
  const campaign = await store.getCampaignBySlug(campaignSlug());
  if (!campaign) redirect("/admin?error=campaign");

  let slug: string;
  let pv = "";
  try {
    const spot = await store.createSpot(campaign.id, parsed.value);
    slug = spot.slug;
    pv = await syncQr(spot);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "追加に失敗しました";
    redirect(`/admin/spots/new?error=${encodeURIComponent(msg)}`);
  }

  revalidatePath("/admin");
  redirect(`/admin?created=${encodeURIComponent(slug)}${pv ? `&${pv}` : ""}`);
}

export async function saveSpotAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");

  const spotId = String(formData.get("spotId") ?? "");
  if (!spotId) redirect("/admin?error=invalid");

  const parsed = parseSpotInput(formData);
  if (!parsed.ok)
    redirect(`/admin/spots/${spotId}?error=${encodeURIComponent(parsed.errors.join(" / "))}`);

  let pv = "";
  try {
    const saved = await getStore().saveSpot(spotId, parsed.value);
    if (!saved) redirect(`/admin/spots/${spotId}?error=${encodeURIComponent("保存できませんでした")}`);
    pv = await syncQr(saved);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "保存に失敗しました";
    redirect(`/admin/spots/${spotId}?error=${encodeURIComponent(msg)}`);
  }

  revalidatePath("/admin");
  redirect(`/admin?saved=1${pv ? `&${pv}` : ""}`);
}

export async function deleteSpotAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");

  const spotId = String(formData.get("spotId") ?? "");
  if (!spotId) redirect("/admin?error=invalid");

  const store = getStore();
  const target = await store.getSpot(spotId);
  const result = await store.deleteSpot(spotId);
  if (!result.ok)
    redirect(`/admin/spots/${spotId}?error=${encodeURIComponent(result.reason ?? "削除できません")}`);

  // ★PivoLink 側のQRは消さずに無効化する。行を消すと現地の看板が「見つかりません」になる。
  //   無効化なら fallback_url / 期限切れページへ飛ばせるので、貼ったままでも案内が出せる。
  if (target) await deactivateSpotQr(target.slug);

  revalidatePath("/admin");
  redirect("/admin?deleted=1");
}
