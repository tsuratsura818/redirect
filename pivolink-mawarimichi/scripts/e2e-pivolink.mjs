/**
 * 「PivoLinkが本当にルーティングしているか」の検証。
 *
 *   node scripts/e2e-pivolink.mjs [baseUrl]
 *
 * 確認すること:
 *   1. PivoLink の /r/<slug> が、同じQRに対して毎回違う行き先を返す（ab_test）
 *   2. 営業時間外のスポットは、PivoLink が閉店案内へ振り替える（time_of_day）
 *   3. PivoLink が振った枝（pick）によって、まわりみちの二択が実際に変わる
 *   4. 画面に「PivoLinkのルールで選ばれました」の開示が出る
 *   5. PivoLink を経由しない直リンクでも壊れない（自前の時刻判定に落ちる）
 *
 * ★3が通らなければ、PivoLinkは「ただの短縮URL」であって企画の前提が崩れる。
 */

const BASE = process.argv[2] ?? "http://localhost:3939";
const PIVOLINK = "https://redirect.tsuratsura.com";

const failures = [];
function check(label, cond, detail = "") {
  console.log(`${cond ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!cond) failures.push(label);
}

/** セッションcookieを1本ぶん持つ、使い捨ての参加者 */
function visitor() {
  let cookie = "";
  const capture = (res) => {
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const [pair] = c.split(";");
      const [name] = pair.split("=");
      cookie = [
        ...cookie.split("; ").filter(Boolean).filter((e) => !e.startsWith(`${name}=`)),
        pair,
      ].join("; ");
    }
  };
  return {
    async get(path) {
      const res = await fetch(`${BASE}${path}`, {
        headers: { "accept-language": "ja", ...(cookie ? { cookie } : {}) },
        redirect: "manual",
      });
      capture(res);
      return res.status >= 300 && res.status < 400 ? "" : await res.text();
    },
    async action(path, fields) {
      const body = new FormData();
      for (const [k, v] of Object.entries(fields)) body.append(k, v);
      const res = await fetch(`${BASE}${path}`, {
        method: "POST",
        headers: { origin: BASE, ...(cookie ? { cookie } : {}) },
        body,
        redirect: "manual",
      });
      capture(res);
      return res;
    },
  };
}

/**
 * Server Action フォームの隠しフィールドを拾う。
 * ★Next は JS 無効時のフォールバックとして name="$ACTION_ID_<id>" を埋める。
 *   これを付けずに token/goalId だけ送っても Server Action は発火しない（実際に踏んだ）。
 */
function formFields(html, marker) {
  const re = /<form[^>]*>([\s\S]*?)<\/form>/g;
  let m;
  while ((m = re.exec(html))) {
    if (!m[1].includes(marker)) continue;
    const fields = {};
    for (const tag of m[1].match(/<input[^>]*>/g) ?? []) {
      const name = tag.match(/name="([^"]+)"/)?.[1];
      if (name) fields[name] = tag.match(/value="([^"]*)"/)?.[1] ?? "";
    }
    return fields;
  }
  return null;
}

const choiceNames = (html) =>
  [...html.matchAll(/class="choice"[\s\S]*?class="cn">([^<]+)</g)].map((m) => m[1]);

const traceOf = (html) =>
  (html.match(/class="pv-trace"[^>]*>([\s\S]*?)<\/p>/) ?? [])[1]
    ?.replace(/<[^>]+>/g, "")
    .trim() ?? "";

/** 目的地（清水寺）を選ぶところまで進めて、提示された二択を返す */
async function walkToChoices(query) {
  const v = visitor();
  const q = query ? `?${query}` : "";
  const landing = await v.get(`/s/dev-start-kyoto${q}`);
  const fields = formFields(landing, "清水寺");
  if (!fields) return { names: [], trace: "", note: "目的地フォームが見つからない" };
  await v.action(`/s/dev-start-kyoto${q}`, fields);
  const html = await v.get(`/s/dev-start-kyoto${q}`);
  return { names: choiceNames(html), trace: traceOf(html), note: "" };
}

console.log(`base = ${BASE}\n--- 1. PivoLink が行き先を振り分けているか ---`);

const hourNow = Number(
  new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    hour12: false,
  }).format(new Date()),
);

// ★A/Bテストが発火するのは「営業時間内」だけ（時間帯ルールが先に勝つ）。
//   建仁寺(10-17時)で見ていたら深夜に落ちた。終日開いている安井金比羅宮で見る。
const seen = new Set();
for (let i = 0; i < 12; i++) {
  const res = await fetch(`${PIVOLINK}/r/mawarimichi-yasui`, { redirect: "manual" });
  const loc = res.headers.get("location") ?? "";
  seen.add(loc.includes("?") ? loc.slice(loc.indexOf("?") + 1) : "(パラメータなし)");
}
check("同じQRから複数の行き先が返る（ab_test・終日営業で確認）", seen.size >= 2, [...seen].sort().join(" / "));

const kenninji =
  (await fetch(`${PIVOLINK}/r/mawarimichi-kenninji`, { redirect: "manual" })).headers.get("location") ?? "";
const kenninjiOpen = hourNow >= 10 && hourNow < 17;
check(
  `建仁寺QR（10-17時）: いま${hourNow}時 → ${kenninjiOpen ? "営業中なのでA/B" : "閉店中なので閉店案内"}`,
  kenninjiOpen ? kenninji.includes("pick=") : kenninji.includes("closed=1"),
  kenninji.replace(/^https?:\/\/[^/]+/, ""),
);

console.log(`\n--- 2. 営業時間外のスポットを閉店案内へ振り替えるか ---`);
const hour = hourNow;
const izakayaOpen = hour >= 17 && hour < 23;
const izakayaLoc =
  (await fetch(`${PIVOLINK}/r/mawarimichi-miyakoroji`, { redirect: "manual" })).headers.get(
    "location",
  ) ?? "";
check(
  `居酒屋QR（17-23時）: いま${hour}時 → ${izakayaOpen ? "営業中なので通常" : "閉店中なので閉店案内"}`,
  izakayaOpen ? !izakayaLoc.includes("closed=1") : izakayaLoc.includes("closed=1"),
  izakayaLoc.replace(/^https?:\/\/[^/]+/, ""),
);

console.log(`\n--- 3. PivoLink の枝で、二択が実際に変わるか ---`);
const routes = new Map();
for (const pick of ["a", "b", "c"]) {
  const r = await walkToChoices(`band=day&pick=${pick}`);
  routes.set(pick, r.names.join(" ／ "));
  console.log(`   pick=${pick}  →  ${r.names.join(" ／ ") || `(取得できず: ${r.note})`}`);
  if (pick === "a") check("  判断の開示が画面に出る", r.trace.includes("PivoLink"), r.trace);
}
check(
  "枝ごとに二択が2件そろう",
  [...routes.values()].every((v) => v.split(" ／ ").length === 2),
);
check(
  "PivoLink の枝が変わると二択も変わる（＝PivoLinkがルーティングしている）",
  new Set(routes.values()).size >= 2,
  `${new Set(routes.values()).size} 通り`,
);

console.log(`\n--- 4. PivoLink を経由しない直リンクでも壊れないか ---`);
const bare = await walkToChoices("");
check("二択は出る（自前の時刻判定にフォールバック）", bare.names.length === 2, bare.names.join(" ／ "));
check("開示は出ない（PivoLink を経由していないため）", bare.trace === "");

console.log(`
--- 5. スポンサーCM（PivoLinkのクッションページ）が挟まるか ---`);
{
  const v = visitor();
  const landing = await v.get(`/s/dev-start-kyoto`);
  await v.action(`/s/dev-start-kyoto`, formFields(landing, "清水寺"));

  // スタンプを順に押して、何個目でCMへ回されるかを見る
  const tokens = ["dev-rokuhara", "dev-rokudo", "dev-kenninji", "dev-yasui"];
  const cmAt = [];
  for (const [i, tk] of tokens.entries()) {
    const spot = await v.get(`/s/${tk}`);
    const fields = formFields(spot, "スタンプを押す");
    if (!fields) { console.log(`   ${i + 1}個目: スタンプCTAが無い`); continue; }
    const res = await v.action(`/s/${tk}`, fields);
    const loc = res.headers.get("location") ?? "";
    const isCm = loc.includes("/r/mawarimichi-cm");
    console.log(`   ${i + 1}個目 → ${isCm ? "CMへ回された" : "そのまま"}  ${loc.replace(/^https?:\/\/[^/]+/, "")}`);
    if (isCm) cmAt.push(i + 1);
  }
  check("CMが挟まる", cmAt.length > 0, cmAt.length ? `${cmAt.join(",")}個目` : "一度も挟まらない");
  check("1個目には出さない（最初の報酬を広告で汚さない）", !cmAt.includes(1));
  check("頻度上限どおり（3個ごと）", cmAt.every((n) => n % 3 === 0));

  // CM入口 → クッションページ（＝広告）に着くか
  const cm = await fetch("https://redirect.tsuratsura.com/r/mawarimichi-cm", { redirect: "manual" });
  const sponsor = cm.headers.get("location") ?? "";
  const cushion = await fetch(sponsor, { redirect: "manual" });
  check(
    "スポンサー枠がクッションページ（広告）を出す",
    (cushion.headers.get("location") ?? "").includes("/cushion?dest="),
    sponsor.replace(/^https?:\/\/[^/]+/, ""),
  );
}

console.log(`
--- 6. 期間ルールの受け皿が生きているか ---`);
for (const path of ["/notyet", "/finished"]) {
  const res = await fetch(`${BASE}${path}`);
  check(`${path} が表示できる`, res.status === 200, `HTTP ${res.status}`);
}

console.log(
  failures.length
    ? `\n❌ ${failures.length}件failed:\n  ${failures.join("\n  ")}`
    : "\n✅ 全項目パス",
);
process.exit(failures.length ? 1 : 0);
