/**
 * 管理画面の通し確認（受け入れ基準 §5-5「重みを変更→次の抽選に即時反映」）。
 *
 *   node scripts/e2e-admin.mjs [baseUrl] [password]
 */

const BASE = process.argv[2] ?? "http://localhost:3939";
const PASSWORD = process.argv[3] ?? process.env.ADMIN_PASSWORD ?? "mawarimichi-local";

let cookie = "";
const failures = [];

function check(label, cond, detail = "") {
  console.log(`${cond ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!cond) failures.push(label);
}

function captureCookie(res) {
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const pair = c.split(";")[0];
    const name = pair.split("=")[0];
    cookie = [
      ...cookie.split("; ").filter(Boolean).filter((x) => !x.startsWith(`${name}=`)),
      pair,
    ].join("; ");
  }
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: cookie ? { cookie } : {},
    redirect: "manual",
  });
  captureCookie(res);
  return { res, body: res.status < 300 ? await res.text() : "" };
}

async function action(path, fields) {
  const body = new FormData();
  for (const [k, v] of Object.entries(fields)) body.append(k, v);
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { origin: BASE, ...(cookie ? { cookie } : {}) },
    body,
    redirect: "manual",
  });
  captureCookie(res);
  return res;
}

function formInputs(html, marker) {
  for (const m of html.matchAll(/<form[^>]*>([\s\S]*?)<\/form>/g)) {
    if (!m[1].includes(marker)) continue;
    const fields = {};
    for (const tag of m[1].match(/<input[^>]*>|<select[^>]*>[\s\S]*?<\/select>/g) ?? []) {
      const name = tag.match(/name="([^"]+)"/)?.[1];
      if (!name) continue;
      if (tag.startsWith("<select")) {
        fields[name] = tag.match(/<option[^>]*selected[^>]*value="([^"]*)"/)?.[1]
          ?? tag.match(/<option[^>]*value="([^"]*)"/)?.[1]
          ?? "";
      } else if (tag.includes('type="checkbox"')) {
        if (tag.includes("checked")) fields[name] = "on";
      } else {
        fields[name] = tag.match(/value="([^"]*)"/)?.[1] ?? "";
      }
    }
    return fields;
  }
  return null;
}

async function main() {
  console.log(`base = ${BASE}\n--- 1. 認証 ---`);

  const denied = await get("/admin");
  check("未ログインは /admin/login へ弾かれる", denied.res.status === 307, denied.res.headers.get("location") ?? "");

  const loginPage = await get("/admin/login");
  const loginFields = formInputs(loginPage.body, "ログイン");
  await action("/admin/login", { ...loginFields, password: PASSWORD });
  check("管理cookieが発行される", cookie.includes("mw_admin="));

  const dash = await get("/admin");
  check("ダッシュボードが開く", dash.res.status === 200 && dash.body.includes("スポット — 重み調整"));

  console.log("\n--- 2. 重み変更 → 次の抽選に即時反映 ---");
  const preview = async () => {
    const r = await get("/api/route-choices?goal=kiyomizu&samples=600");
    return JSON.parse(r.body).appearanceRate;
  };

  const before = await preview();
  const target = "bukkoji"; // 目的地から最も遠く、通常はほぼ出ないスポット
  console.log(`  変更前 ${target}: ${before[target] ?? 0}%`);

  const spotFields = formInputs(dash.body, "spotId");
  const spotRow = dash.body.match(
    new RegExp(`${target}[\\s\\S]*?name="spotId" value="([^"]+)"`),
  );
  check("スポットIDを取得", Boolean(spotRow));

  const actionId = Object.keys(spotFields).find((k) => k.startsWith("$ACTION_ID_"));
  await action("/admin", {
    [actionId]: "",
    spotId: spotRow[1],
    capacityWeight: "8",
    congestionLevel: "0",
    active: "on",
  });

  const after = await preview();
  console.log(`  変更後 ${target}: ${after[target] ?? 0}%`);
  check("キャパ重みを上げると出現率が上がる", (after[target] ?? 0) > (before[target] ?? 0));

  // 後片付け（元に戻す）
  await action("/admin", {
    [actionId]: "",
    spotId: spotRow[1],
    capacityWeight: "1",
    congestionLevel: "1",
    active: "on",
  });
  const restored = await preview();
  check("元に戻せる", (restored[target] ?? 0) < (after[target] ?? 0), `${restored[target] ?? 0}%`);

  console.log("\n--- 3. QR発行 ---");
  const qrPage = await get("/admin/qr");
  check("QR一覧が開く", qrPage.body.includes("印刷入稿前にURLスキームを確定"));
  const png = await fetch(`${BASE}/admin/qr/dev-rokuhara`, { headers: { cookie } });
  const bytes = Buffer.from(await png.arrayBuffer());
  check(
    "QRのPNGが生成される",
    png.headers.get("content-type") === "image/png" &&
      bytes.length > 1000 &&
      bytes.subarray(0, 8).toString("hex") === "89504e470d0a1a0a", // PNGシグネチャ
    `${bytes.length} bytes`,
  );

  const unknown = await fetch(`${BASE}/admin/qr/not-a-real-token`, { headers: { cookie } });
  check("存在しないトークンは404（任意QR生成器にしない）", unknown.status === 404);

  console.log("\n--- 4. 未認証からのAPI遮断 ---");
  const noAuth = await fetch(`${BASE}/api/route-choices?goal=kiyomizu`, { redirect: "manual" });
  check("未認証はプレビューAPIを叩けない", noAuth.status === 401);

  console.log(failures.length ? `\n❌ ${failures.length}件 失敗: ${failures.join(", ")}` : "\n✅ 全項目パス");
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
