"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdmin } from "@/lib/admin";
import { parseGoalInput } from "@/lib/goal-input";
import { getStore } from "@/lib/store";

function campaignSlug(): string {
  return process.env.NEXT_PUBLIC_DEFAULT_CAMPAIGN ?? "kyoto-higashiyama";
}

function back(msg: string, ok = true): never {
  redirect(`/admin/goals?${ok ? "ok" : "error"}=${encodeURIComponent(msg)}`);
}

/**
 * 目的地の作成・更新。
 * ★目的地には PivoLink のQRを作らない。
 *   目的地は「参加者が選ぶ行き先」であって、現地でQRを読む場所ではないため
 *   （最後の1区間だけナビで案内する）。QRが要るのはスタートと寄り道スポットだけ。
 */
export async function saveGoalAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");

  const parsed = parseGoalInput(formData);
  if (!parsed.ok) return back(parsed.errors.join(" / "), false);

  const store = getStore();
  const goalId = String(formData.get("goalId") ?? "");

  try {
    if (goalId) {
      const saved = await store.saveGoal(goalId, parsed.value);
      if (!saved) return back("保存できませんでした（DB未接続の可能性）", false);
      back(`目的地「${parsed.value.name.ja}」を保存しました`);
    } else {
      const campaign = await store.getCampaignBySlug(campaignSlug());
      if (!campaign) return back("キャンペーンが見つかりません", false);
      await store.createGoal(campaign.id, parsed.value);
      back(`目的地「${parsed.value.name.ja}」を追加しました`);
    }
  } catch (e) {
    if (e instanceof Error && !("digest" in e)) return back(e.message, false);
    throw e;
  } finally {
    revalidatePath("/admin/goals");
  }
}

export async function deleteGoalAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const goalId = String(formData.get("goalId") ?? "");
  if (!goalId) return back("目的地が指定されていません", false);

  const r = await getStore().deleteGoal(goalId);
  revalidatePath("/admin/goals");
  back(r.ok ? "目的地を削除しました" : (r.reason ?? "削除できません"), r.ok);
}
