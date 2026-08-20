"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdmin, signInAdmin, signOutAdmin } from "@/lib/admin";
import { getStore } from "@/lib/store";

export async function adminLoginAction(formData: FormData) {
  const ok = await signInAdmin(String(formData.get("password") ?? ""));
  redirect(ok ? "/admin" : "/admin/login?error=1");
}

export async function adminLogoutAction() {
  await signOutAdmin();
  redirect("/admin/login");
}

/**
 * スポットの重み・混雑度・公開状態の更新。
 * ★変更は次の抽選から即時反映される（参加者側は毎リクエストでDBを読んで抽選する）
 */
export async function updateSpotAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");

  const spotId = String(formData.get("spotId") ?? "");
  const capacityWeight = Number(formData.get("capacityWeight"));
  const congestionLevel = Number(formData.get("congestionLevel"));
  const active = formData.get("active") === "on";
  const mapUrlRaw = String(formData.get("mapUrl") ?? "").trim();
  // https 以外は保存しない（QRの遷移先を任意URLにされないように）
  const mapUrl = mapUrlRaw && /^https:\/\//.test(mapUrlRaw) ? mapUrlRaw : null;

  if (!spotId || !Number.isFinite(capacityWeight) || !Number.isFinite(congestionLevel)) {
    redirect("/admin?error=invalid");
  }

  await getStore().updateSpot(spotId, {
    capacity_weight: Math.min(Math.max(capacityWeight, 0), 10),
    congestion_level: Math.min(Math.max(Math.round(congestionLevel), 0), 2),
    active,
    map_url: mapUrl,
  });

  revalidatePath("/admin");
  redirect("/admin?saved=1");
}
