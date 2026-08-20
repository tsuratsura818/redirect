/**
 * スポンサーCMを見たあとの復帰口。
 *
 * ★CMの表示そのものは PivoLink の「クッションページ」機能が行っている。
 *   アプリは「どこへ戻すか」だけを覚えていて、広告の中身・秒数・スキップ・
 *   クーポンコードの表示は PivoLink 側の設定（ダッシュボードで編集可）。
 * ★表示回数の計測も PivoLink の scan_logs / アナリティクスに乗るので、
 *   まわりみち側に cm_impressions を持つ必要がない。
 */
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACK_COOKIE = "mw_cm_back";

export async function GET(request: Request) {
  const jar = await cookies();
  const raw = jar.get(BACK_COOKIE)?.value ?? "";

  // ★戻り先は自サイト内の相対パスだけ許す。cookieは書き換えられうるので信用しない
  const back = /^\/[a-zA-Z0-9/_\-?=&.]*$/.test(raw) ? raw : "/";

  const res = NextResponse.redirect(new URL(back, request.url));
  res.cookies.set(BACK_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
