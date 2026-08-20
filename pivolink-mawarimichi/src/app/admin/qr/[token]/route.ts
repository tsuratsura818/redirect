/**
 * QR画像（PNG）の生成。入稿用に十分な解像度で出す。
 *
 * ★焼くのは PivoLink の /r/<slug>。アプリの直URL（/s/<token>）を焼いてはいけない。
 *   直URLを刷ると、時間帯・A/Bテスト・開催期間・CMがすべて素通りになり、
 *   しかも後から遷移先を変えられない（＝刷り直しになる）。
 *   PivoLink 未登録のときだけ直URLに落ちるが、その場合は画面で警告を出している。
 */

import QRCode from "qrcode";

import { isAdmin } from "@/lib/admin";
import { getQrStatus } from "@/lib/pivolink-admin";
import { getStore } from "@/lib/store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  if (!(await isAdmin())) return new Response("unauthorized", { status: 401 });

  const { token } = await params;

  // 実在するトークンだけを画像化する（任意文字列のQR生成器として使われないように）
  const resolved = await getStore().resolveQrToken(token);
  if (!resolved) return new Response("not found", { status: 404 });

  const url = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;

  // PivoLink に登録済みなら /r/ を焼く。未登録なら直URL（暫定）
  let target = `${origin}/s/${token}`;
  if (resolved.kind === "spot") {
    const status = await getQrStatus(resolved.spot.slug);
    if (status.registered) target = status.redirectUrl;
  } else if (process.env.PIVOLINK_REDIRECT_ORIGIN || process.env.PIVOLINK_SUPABASE_URL) {
    target = `${(process.env.PIVOLINK_REDIRECT_ORIGIN ?? "https://redirect.tsuratsura.com").replace(/\/$/, "")}/r/mawarimichi-start`;
  }

  const png = await QRCode.toBuffer(target, {
    type: "png",
    width: 1024,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#1B1814FF", light: "#FFFFFFFF" },
  });

  const download = url.searchParams.get("download") === "1";

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=60",
      ...(download
        ? { "Content-Disposition": `attachment; filename="mawarimichi-${token}.png"` }
        : {}),
    },
  });
}
