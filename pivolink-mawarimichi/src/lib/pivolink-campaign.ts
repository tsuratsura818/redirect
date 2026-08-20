/**
 * キャンペーン単位で PivoLink 側に作るもの。
 *   ・スタートQR（入口）
 *   ・開催期間（開始前・終了後の振り替え）
 *   ・スポンサーCM枠（クッションページ＝広告クリエイティブ）
 *
 * ★第三者に渡す前提なので、ここに書いたものは全部まわりみちの管理画面から操作できる。
 *   スクリプトを叩かないと使えない機能を残さない。
 */

import "server-only";

import { pivolinkClient, pivolinkOwnerId, redirectOrigin, PREFIX, PICKS } from "./pivolink-admin";

type Row = Record<string, unknown>;

/* ================= スタートQR ================= */

/**
 * スタートQR（キャンペーンの入口）のQRとルールを作る。
 * ★時間帯は朝と夕だけ。昼（11:00-16:59）はあえて空ける。
 *   1日を覆うと評価順で time_of_day が勝ち続け、A/Bテストが一度も発火しない。
 */
export async function syncStartQr(
  campaign: { slug: string; start_qr_token: string; name: { ja?: string } },
  appOrigin: string,
): Promise<{ ok: boolean; message: string }> {
  const client = pivolinkClient();
  if (!client) return { ok: false, message: "PivoLink の接続情報が設定されていません" };
  const owner = await pivolinkOwnerId();
  if (!owner) return { ok: false, message: "PivoLink の所有者ユーザーを特定できません" };

  const slug = `${PREFIX}start`;
  const dest = `${appOrigin.replace(/\/$/, "")}/s/${campaign.start_qr_token}`;

  try {
    const { data: qr, error } = await client
      .from("qr_codes")
      .upsert(
        {
          user_id: owner,
          slug,
          name: `まわりみち｜START ${campaign.name.ja ?? campaign.slug}`,
          description: "スタート地点。ここから目的地を選ぶ",
          default_url: dest,
          is_active: true,
          qr_color_dark: "#1B1814",
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();
    if (error) throw error;
    const qrId = (qr as { id: string }).id;

    await client
      .from("redirect_rules")
      .delete()
      .eq("qr_code_id", qrId)
      .in("condition_type", ["time_of_day", "ab_test", "scan_step"]);

    const base: Row[] = [
      {
        name: "時間帯 朝（7:00-10:59）",
        destination_url: `${dest}?band=morning`,
        priority: 300,
        condition_type: "time_of_day",
        condition_value: { start_time: "07:00", end_time: "10:59" },
      },
      {
        name: "時間帯 夕（17:00-22:00）",
        destination_url: `${dest}?band=evening`,
        priority: 299,
        condition_type: "time_of_day",
        condition_value: { start_time: "17:00", end_time: "22:00" },
      },
      {
        name: "2回目の参加",
        destination_url: `${dest}?band=day&visit=2&pick=b`,
        priority: 198,
        condition_type: "scan_step",
        condition_value: { visit: 2 },
      },
      {
        name: "3回目の参加",
        destination_url: `${dest}?band=day&visit=3&pick=c`,
        priority: 197,
        condition_type: "scan_step",
        condition_value: { visit: 3 },
      },
      ...PICKS.map((p, i) => ({
        name: `ランダム振り分け ${p.key.toUpperCase()}`,
        destination_url: `${dest}?band=day&pick=${p.key}`,
        priority: 100 - i,
        condition_type: "ab_test",
        condition_value: { weight: p.weight },
      })),
    ];

    const rows = base.map((r) => ({ ...r, qr_code_id: qrId, is_active: true }));
    const { error: insErr } = await client.from("redirect_rules").insert(rows);
    if (insErr) throw insErr;
    return { ok: true, message: `スタートQRを更新しました（ルール${rows.length}件）` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}

/* ================= 開催期間 ================= */

/**
 * 開催期間を PivoLink のルールとして全QRに張る。
 *   schedule          開始日時より前 → 「まだ始まっていません」
 *   scheduled_switch  終了日時を過ぎたら → 「お礼」
 *
 * ★CM枠は対象外。期間で止めるとCMだけ先に死ぬ。
 * ★現地の看板・チラシを一度も触らずに、開始日にひらき終了日に閉じる。ここが運用の勘所。
 */
export async function syncCampaignPeriod(
  startsAt: string | null,
  endsAt: string | null,
  appOrigin: string,
): Promise<{ ok: boolean; message: string }> {
  const client = pivolinkClient();
  if (!client) return { ok: false, message: "PivoLink の接続情報が設定されていません" };
  const origin = appOrigin.replace(/\/$/, "");

  try {
    const { data: qrs } = await client.from("qr_codes").select("id, slug").like("slug", `${PREFIX}%`);
    const targets = (qrs ?? []).filter(
      (q) => !(q as { slug: string }).slug.startsWith(`${PREFIX}cm`),
    );
    if (!targets.length) return { ok: false, message: "PivoLink にQRがありません" };

    const ids = targets.map((q) => (q as { id: string }).id);
    await client
      .from("redirect_rules")
      .delete()
      .in("qr_code_id", ids)
      .in("condition_type", ["schedule", "scheduled_switch"]);

    const rows: Row[] = [];
    for (const q of targets) {
      const id = (q as { id: string }).id;
      if (startsAt)
        rows.push({
          qr_code_id: id,
          name: "開催前",
          destination_url: `${origin}/notyet`,
          priority: 900,
          condition_type: "schedule",
          // schedule は「この期間に入っていたら」の意味。遠い過去〜開始直前を窓にする
          condition_value: { start_at: "2020-01-01T00:00:00.000Z", end_at: startsAt },
          is_active: true,
        });
      if (endsAt)
        rows.push({
          qr_code_id: id,
          name: "開催終了",
          destination_url: `${origin}/finished`,
          priority: 890,
          condition_type: "scheduled_switch",
          condition_value: { switch_at: endsAt },
          is_active: true,
        });
    }

    if (rows.length) {
      const { error } = await client.from("redirect_rules").insert(rows);
      if (error) throw error;
    }
    return {
      ok: true,
      message: rows.length
        ? `開催期間を ${targets.length} 件のQRに反映しました`
        : "開催期間が未設定なので、期間ルールを外しました（常時公開）",
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}

/* ================= スポンサーCM枠 ================= */

export interface Sponsor {
  slug: string;
  key: string;
  name: string;
  title: string;
  message: string;
  buttonText: string;
  background: string;
  textColor: string;
  accent: string;
  seconds: number;
  couponCode: string;
  couponNote: string;
  active: boolean;
}

export const EMPTY_SPONSOR: Sponsor = {
  slug: "",
  key: "",
  name: "",
  title: "",
  message: "",
  buttonText: "道にもどる",
  background: "#2A2620",
  // ★クッションページは白いカードの上に文字を載せる。ここを白にすると白文字が消える
  textColor: "#1E1A17",
  accent: "#E2543F",
  seconds: 15,
  couponCode: "",
  couponNote: "",
  active: true,
};

/** CM枠の一覧。クッションページ（＝広告そのもの）を読む */
export async function listSponsors(): Promise<Sponsor[]> {
  const client = pivolinkClient();
  if (!client) return [];
  const { data: qrs } = await client
    .from("qr_codes")
    .select("id, slug, name, is_active")
    .like("slug", `${PREFIX}cm-%`)
    .order("slug");
  if (!qrs?.length) return [];

  const { data: cushions } = await client
    .from("cushion_pages")
    .select("*")
    .in(
      "qr_code_id",
      qrs.map((q) => (q as { id: string }).id),
    );
  const byQr = new Map(
    (cushions ?? []).map((c) => [
      (c as { qr_code_id: string }).qr_code_id,
      c as Record<string, unknown>,
    ]),
  );

  return qrs.map((q) => {
    const row = q as { id: string; slug: string; name: string; is_active: boolean };
    const c = byQr.get(row.id) ?? {};
    const s = (k: string, d = "") => (typeof c[k] === "string" ? (c[k] as string) : d);
    return {
      slug: row.slug,
      key: row.slug.replace(`${PREFIX}cm-`, ""),
      name: row.name.replace("まわりみち｜CM枠 ", ""),
      title: s("title"),
      message: s("message"),
      buttonText: s("button_text", "道にもどる"),
      background: s("background_color", "#2A2620"),
      textColor: s("text_color", "#FFFFFF"),
      accent: s("accent_color", "#E2543F"),
      seconds: typeof c.display_seconds === "number" ? c.display_seconds : 15,
      couponCode: s("coupon_code"),
      couponNote: s("coupon_note"),
      active: row.is_active && c.is_active !== false,
    };
  });
}

/** CM枠の作成・更新。クッションページの中身がそのまま広告クリエイティブ */
export async function saveSponsor(
  sponsor: Sponsor,
  appOrigin: string,
): Promise<{ ok: boolean; message: string }> {
  const client = pivolinkClient();
  if (!client) return { ok: false, message: "PivoLink の接続情報が設定されていません" };
  const owner = await pivolinkOwnerId();
  if (!owner) return { ok: false, message: "PivoLink の所有者ユーザーを特定できません" };
  if (!/^[a-z0-9][a-z0-9-]{0,20}$/.test(sponsor.key))
    return { ok: false, message: "枠IDは半角英小文字・数字・ハイフンで入力してください" };

  const slug = `${PREFIX}cm-${sponsor.key}`;
  const origin = appOrigin.replace(/\/$/, "");

  try {
    const { data: qr, error } = await client
      .from("qr_codes")
      .upsert(
        {
          user_id: owner,
          slug,
          name: `まわりみち｜CM枠 ${sponsor.name || sponsor.key}`,
          description: "スポンサーCM。クッションページが広告クリエイティブ本体",
          default_url: `${origin}/cm/return?s=${sponsor.key}`,
          is_active: sponsor.active,
          qr_color_dark: "#1B1814",
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();
    if (error) throw error;
    const qrId = (qr as { id: string }).id;

    const { error: cErr } = await client.from("cushion_pages").upsert(
      {
        qr_code_id: qrId,
        title: sponsor.title || "スポンサー",
        message: sponsor.message,
        button_text: sponsor.buttonText || "道にもどる",
        background_color: sponsor.background,
        text_color: sponsor.textColor,
        accent_color: sponsor.accent,
        display_seconds: sponsor.seconds,
        is_active: sponsor.active,
        coupon_enabled: Boolean(sponsor.couponCode),
        coupon_code: sponsor.couponCode || null,
        coupon_note: sponsor.couponNote || null,
      },
      { onConflict: "qr_code_id" },
    );
    if (cErr) throw cErr;

    await syncCmEntry(origin);
    return { ok: true, message: `CM枠「${sponsor.name || sponsor.key}」を保存しました` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}

export async function deleteSponsor(key: string, appOrigin: string): Promise<void> {
  const client = pivolinkClient();
  if (!client) return;
  const { data: qr } = await client
    .from("qr_codes")
    .select("id")
    .eq("slug", `${PREFIX}cm-${key}`)
    .maybeSingle();
  if (qr) {
    const id = (qr as { id: string }).id;
    await client.from("cushion_pages").delete().eq("qr_code_id", id);
    await client.from("qr_codes").delete().eq("id", id);
  }
  await syncCmEntry(appOrigin.replace(/\/$/, ""));
}

/**
 * CMの入口QR。ab_test で有効なスポンサー枠へ均等に振り分ける。
 * ★どのスポンサーを出すかを決めているのは PivoLink。アプリは「いつ挟むか」だけ。
 */
export async function syncCmEntry(appOrigin: string): Promise<void> {
  const client = pivolinkClient();
  if (!client) return;
  const owner = await pivolinkOwnerId();
  if (!owner) return;

  const origin = appOrigin.replace(/\/$/, "");
  const { data: qr } = await client
    .from("qr_codes")
    .upsert(
      {
        user_id: owner,
        slug: `${PREFIX}cm`,
        name: "まわりみち｜CM入口（スポンサー振り分け）",
        description: "スタンプN個ごとにここを通る。ab_test がスポンサーを選ぶ",
        default_url: `${origin}/cm/return`,
        is_active: true,
        qr_color_dark: "#1B1814",
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();
  if (!qr) return;
  const entryId = (qr as { id: string }).id;

  const sponsors = (await listSponsors()).filter((s) => s.active);
  await client.from("redirect_rules").delete().eq("qr_code_id", entryId);
  if (!sponsors.length) return;

  const weight = Math.max(1, Math.floor(100 / sponsors.length));
  await client.from("redirect_rules").insert(
    sponsors.map((s, i) => ({
      qr_code_id: entryId,
      name: `スポンサー ${s.name || s.key}`,
      destination_url: `${redirectOrigin()}/r/${s.slug}`,
      priority: 100 - i,
      condition_type: "ab_test",
      condition_value: { weight },
      is_active: true,
    })),
  );
}

/** CM入口のURL（env `MAWARIMICHI_CM_URL` に入れる値） */
export function cmEntryUrl(): string {
  return `${redirectOrigin()}/r/${PREFIX}cm`;
}
