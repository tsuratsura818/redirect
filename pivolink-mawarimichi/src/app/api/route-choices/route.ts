/**
 * 回廊ルーティングのプレビュー（管理者専用）。
 * 「重みやルールを変えたら、次にどの二択が出るか」を管理画面から確認するための読み取り専用API。
 * 参加者の抽選には使わない（参加者側はセッション固定シードでサーバー描画する）。
 */

import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/admin";
import { pickChoices, type RoutableSpot } from "@/lib/routing";
import { getStore } from "@/lib/store";
import { hourJst } from "@/lib/time";

export async function GET(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const campaignSlug = url.searchParams.get("campaign") ?? process.env.NEXT_PUBLIC_DEFAULT_CAMPAIGN ?? "kyoto-higashiyama";
  const goalSlug = url.searchParams.get("goal");
  const visited = (url.searchParams.get("visited") ?? "").split(",").filter(Boolean);
  const hourParam = url.searchParams.get("hour");
  const samples = Math.min(Number(url.searchParams.get("samples") ?? 200), 2000);

  const store = getStore();
  const campaign = await store.getCampaignBySlug(campaignSlug);
  if (!campaign) return NextResponse.json({ error: "campaign not found" }, { status: 404 });

  const [goals, spots, rules] = await Promise.all([
    store.listGoals(campaign.id),
    store.listSpots(campaign.id),
    store.listRules(campaign.id),
  ]);

  const goal = goalSlug ? goals.find((g) => g.slug === goalSlug) : goals[0];
  if (!goal) return NextResponse.json({ error: "goal not found" }, { status: 404 });

  const routable: RoutableSpot[] = spots.map((s) => ({
    id: s.id,
    slug: s.slug,
    lat: s.lat,
    lng: s.lng,
    capacity_weight: Number(s.capacity_weight),
    congestion_level: s.congestion_level,
  }));
  const visitedIds = spots.filter((s) => visited.includes(s.slug)).map((s) => s.id);

  // 1回ぶんの二択と、samples 回まわしたときの出現率を返す
  const hour = hourParam !== null ? Number(hourParam) : hourJst();
  const input = {
    from: { lat: campaign.start_lat, lng: campaign.start_lng },
    goal: { lat: goal.lat, lng: goal.lng },
    spots: routable,
    visitedIds,
    toleranceM: campaign.detour_tolerance_m,
    rules,
    hourJst: hour,
  };

  const once = pickChoices(input);
  const appear = new Map<string, number>();
  for (let i = 0; i < samples; i++) {
    for (const c of pickChoices(input).choices) {
      appear.set(c.spot.slug, (appear.get(c.spot.slug) ?? 0) + 1);
    }
  }

  return NextResponse.json({
    campaign: campaign.slug,
    goal: goal.slug,
    hourJst: hour,
    poolSize: once.poolSize,
    fallback: once.fallback,
    distanceNowM: Math.round(once.distanceNowM),
    sample: once.choices.map((c) => ({
      slug: c.spot.slug,
      weight: Number(c.weight.toFixed(3)),
      distanceToGoalM: Math.round(c.distanceToGoalM),
    })),
    appearanceRate: Object.fromEntries(
      Array.from(appear.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([slug, n]) => [slug, Number(((n / samples) * 100).toFixed(1))]),
    ),
  });
}
