/**
 * 参加者フローの通し確認（受け入れ基準 §5-1,3,4,6）。
 * 起動済みのサーバーに対して、QR着地 → 目的地選択 → 5スポット → 到着 まで実際にHTTPで歩く。
 *
 *   node scripts/e2e-walkthrough.mjs [baseUrl]
 */

const BASE = process.argv[2] ?? "http://localhost:3939";

let cookie = "";
const failures = [];

function check(label, cond, detail = "") {
  const mark = cond ? "✅" : "❌";
  console.log(`${mark} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!cond) failures.push(label);
}

async function get(path, headers = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { ...(cookie ? { cookie } : {}), ...headers },
    redirect: "manual",
  });
  captureCookie(res);
  const body = res.status >= 300 && res.status < 400 ? "" : await res.text();
  return { res, body, location: res.headers.get("location") };
}

/**
 * Server Action の呼び出し。
 * ★ブラウザのフォームと同じ multipart/form-data で送らないと Server Action として扱われず、
 *   ただのページGETとして200が返る（urlencodedでハマった）。origin ヘッダも必須。
 */
async function post(path, fields, headers = {}) {
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) body.append(key, value);

  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { origin: BASE, ...(cookie ? { cookie } : {}), ...headers },
    body,
    redirect: "manual",
  });
  captureCookie(res);
  return { res, location: res.headers.get("location") };
}

function captureCookie(res) {
  const set = res.headers.getSetCookie?.() ?? [];
  for (const c of set) {
    const [pair] = c.split(";");
    const [name] = pair.split("=");
    const others = cookie
      .split("; ")
      .filter(Boolean)
      .filter((existing) => !existing.startsWith(`${name}=`));
    cookie = [...others, pair].join("; ");
  }
}

/** Server Action を叩く代わりに、HTMLからaction IDを拾ってPOSTする */
function findActionId(html, marker) {
  const formRe = /<form[^>]*action="([^"]*)"[^>]*>([\s\S]*?)<\/form>/g;
  let m;
  while ((m = formRe.exec(html))) {
    if (m[2].includes(marker)) return { action: m[1], inner: m[2] };
  }
  return null;
}

/**
 * Server Action フォームの隠しフィールドを集める。
 * NextはJS無効時のフォールバックとして name="$ACTION_ID_<id>" の隠しinputを埋める。
 */
function hiddenFields(inner) {
  const fields = {};
  for (const tag of inner.match(/<input[^>]*>/g) ?? []) {
    const name = tag.match(/name="([^"]+)"/)?.[1];
    if (!name) continue;
    fields[name] = tag.match(/value="([^"]*)"/)?.[1] ?? "";
  }
  return fields;
}

async function main() {
  console.log(`base = ${BASE}\n--- 1. スタートQR着地 ---`);

  const start = await get("/");
  check("ルートがスタートQRへリダイレクトする", start.res.status === 307, start.location ?? "");
  const startPath = start.location;

  const landing = await get(startPath, { "accept-language": "ja" });
  check("目的地選択が表示される", landing.body.includes("最後に行きたい場所は？"));
  check("3つの目的地が出る", (landing.body.match(/class="gn"/g) ?? []).length === 3);

  console.log("\n--- 2. 目的地を選ぶ（清水寺） ---");
  const goalForm = findActionId(landing.body, "清水寺");
  const fields = hiddenFields(goalForm.inner);
  check(
    "Server Action の隠しフィールドを取得",
    Object.keys(fields).some((k) => k.startsWith("$ACTION_ID_")),
  );

  const selected = await post(startPath, fields);
  check("目的地選択が受理される", selected.res.status === 303 || selected.res.status === 200);
  check("匿名セッションcookieが発行される", cookie.includes("mw_sid="));

  console.log("\n--- 3. 5スポットを巡る ---");
  let path = startPath;
  const route = [];
  // 清水寺の座標。道中の画面にこれが出たら「全行程ナビ」になってしまう（CLAUDE.md §9-1）
  const GOAL_COORD = "34.9949,135.785";
  let goalCoordLeaked = false;

  for (let step = 1; step <= 5; step++) {
    const page = await get(path, { "accept-language": "ja" });
    const choiceHrefs = [...page.body.matchAll(/class="choice" href="([^"]+)"/g)].map((m) => m[1]);
    check(`${step}回目: 二択が2件提示される`, choiceHrefs.length === 2, choiceHrefs.join(" / "));
    if (choiceHrefs.length === 0) break;

    // 片方を選ぶ → 向かう画面 → 現地QRを読む
    const headingPath = choiceHrefs[0].replace(/&amp;/g, "&");
    const heading = await get(headingPath, { "accept-language": "ja" });
    const navHref = heading.body.match(/href="(https:\/\/www\.google\.com\/maps[^"]+)"/)?.[1] ?? "";
    check(`${step}回目: 区間ナビのリンクがある`, navHref.length > 0);

    const scanHref = heading.body.match(/class="cta ghost" href="([^"]+)"/)?.[1];
    check(`${step}回目: 現地QRの導線がある`, Boolean(scanHref));
    path = scanHref;

    const spotPage = await get(path, { "accept-language": "ja" });
    const spotName = spotPage.body.match(/class="spot-name">([^<]+)</)?.[1] ?? "?";
    route.push(spotName);

    // 5個目を押す前（＝道中）に目的地座標が露出していないこと
    if (step < 5 && (heading.body.includes(GOAL_COORD) || spotPage.body.includes(GOAL_COORD))) {
      goalCoordLeaked = true;
    }

    const stampForm = findActionId(spotPage.body, "スタンプを押す");
    check(`${step}回目: スタンプCTAがある`, Boolean(stampForm));
    await post(path, hiddenFields(stampForm.inner));
  }

  console.log(`\n  ルート: ${route.join(" → ")}`);
  check("5スポット巡れた", route.length === 5);
  check("同じスポットを2回巡っていない", new Set(route).size === route.length);

  console.log("\n--- 4. 二重押印の防止 ---");
  const lastPage = await get(path, { "accept-language": "ja" });
  const bookBefore = Number(lastPage.body.match(/class="book-count">(\d+)</)?.[1] ?? "-1");
  const dupForm = findActionId(lastPage.body, "スタンプを押す");
  check("押印済みスポットに再押印CTAが出ない", dupForm === null, `book-count=${bookBefore}`);
  check("スタンプは5個で止まる", bookBefore === 5);

  console.log("\n--- 5. 到着 ---");
  const arriveForm = findActionId(lastPage.body, "へ向かう");
  check("目的地へのCTAがある", Boolean(arriveForm));
  const goalNav = lastPage.body.match(/href="(https:\/\/www\.google\.com\/maps[^"]+)"/g) ?? [];
  check("最終区間で目的地ナビが出る", goalNav.length > 0);

  await post(path, hiddenFields(arriveForm.inner));
  const arrival = await get("/arrival", { "accept-language": "ja" });
  check("到着画面が表示される", arrival.body.includes("たどり着きました"));

  // Reactはテキストノードの境界に <!-- --> を挟むので、それを許して拾う
  const rate = arrival.body.match(/class="sv big">(\d+)(?:<!-- -->)?%/)?.[1];
  check("まわりみち率が算出される", Number(rate) > 100, `${rate}%`);
  const code = arrival.body.match(/class="code">([^<]+)</)?.[1];
  check("クーポンが発行される", /^MAWARI-[A-Z0-9]{6}$/.test(code ?? ""), code ?? "");

  console.log("\n--- 6. スタンプ帳と言語切替 ---");
  const book = await get("/book");
  check("スタンプ帳が見える", book.body.includes("スタンプ帳"));
  check("押した5個のスタンプが並ぶ", (book.body.match(/MAWARIMICHI<\/text>/g) ?? []).length === 5);

  const langForm = findActionId(book.body, 'value="en"');
  await post("/book", hiddenFields(langForm.inner));
  const bookEn = await get("/book");
  check("EN に切り替わる", bookEn.body.includes("Stamp Book"), bookEn.body.includes("your road today") ? "sub also EN" : "");

  const arrivalEn = await get("/arrival");
  check("到着画面もENになる", arrivalEn.body.includes("You made it."));

  console.log("\n--- 7. 目的地座標の露出チェック（CLAUDE.md §9-1） ---");
  check("道中の画面に目的地座標が出ていない（最終区間のみ露出）", !goalCoordLeaked);

  console.log(
    failures.length ? `\n❌ ${failures.length}件 失敗: ${failures.join(", ")}` : "\n✅ 全項目パス",
  );
  process.exit(failures.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
