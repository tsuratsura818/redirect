/** ナビリンクのタップ記録（KPI: ナビ利用率）。sendBeacon から呼ばれる */

import { NextResponse } from "next/server";

import { readSession } from "@/lib/session";
import { getStore } from "@/lib/store";

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  let spotId: unknown;
  try {
    ({ spotId } = (await request.json()) as { spotId?: unknown });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (typeof spotId !== "string") return NextResponse.json({ ok: false }, { status: 400 });

  await getStore().markNavClicked(session.id, spotId);
  return NextResponse.json({ ok: true });
}
