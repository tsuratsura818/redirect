/**
 * 実地テスト・入稿用の QR を一括書き出しする。
 *
 *   npm run qr                       # PivoLink の /r/<slug> でQRを焼く（既定・推奨）
 *   npm run qr -- --direct           # まわりみちの直URLで焼く（検証用。永続しない）
 *   npm run qr -- --out qr-field     # 出力先を変える
 *
 * ★QRに焼くのは PivoLink の `redirect.tsuratsura.com/r/mawarimichi-<key>`。
 *   遷移先は PivoLink のダッシュボードからいつでも差し替えられるので、
 *   まわりみち側のURLが変わっても看板を刷り直さなくてよい（これが本企画の中核）。
 *   まわりみちの直URLを焼くと、URLが変わった瞬間に看板が死ぬ。
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

import QRCode from "qrcode";

import { seedCampaign, seedSpots } from "../src/data/seed";
import { tx } from "../src/lib/types";

const args = process.argv.slice(2);
const argOf = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const PIVOLINK = (argOf("pivolink") ?? "https://redirect.tsuratsura.com").replace(/\/$/, "");
const DIRECT = args.includes("--direct");

/** --direct のときだけ使う、まわりみち側の直URL */
function directBase(): string {
  const fromArg = argOf("base");
  if (fromArg) return fromArg.replace(/\/$/, "");

  const envPath = resolve(process.cwd(), ".env.local");
  if (existsSync(envPath)) {
    const line = readFileSync(envPath, "utf-8")
      .split(/\r?\n/)
      .find((l) => l.startsWith("NEXT_PUBLIC_APP_URL="));
    const v = line?.slice("NEXT_PUBLIC_APP_URL=".length).trim();
    if (v) return v.replace(/\/$/, "");
  }
  throw new Error("--direct には --base か .env.local の NEXT_PUBLIC_APP_URL が必要です");
}

const BASE = DIRECT ? directBase() : PIVOLINK;
/** PivoLink 側の slug（qr_codes.slug と一致させる） */
const pivoSlug = (key: string) => `mawarimichi-${key}`;
const OUT = resolve(process.cwd(), argOf("out") ?? "qr");
mkdirSync(OUT, { recursive: true });

interface Item {
  kind: string;
  slug: string;
  name: string;
  token: string;
  url: string;
  kanji: string;
}

const items: Item[] = [
  {
    kind: "スタート",
    slug: "start",
    name: tx(seedCampaign.start_label, "ja"),
    token: seedCampaign.start_qr_token,
    url: DIRECT ? `${BASE}/s/${seedCampaign.start_qr_token}` : `${BASE}/r/${pivoSlug("start")}`,
    kanji: "始",
  },
  ...seedSpots.map((s) => ({
    kind: "スポット",
    slug: s.slug,
    name: tx(s.name, "ja"),
    token: s.qr_token,
    url: DIRECT ? `${BASE}/s/${s.qr_token}` : `${BASE}/r/${pivoSlug(s.slug)}`,
    kanji: s.kanji ?? "",
  })),
];

const written: string[] = [];
for (const item of items) {
  const png = await QRCode.toBuffer(item.url, {
    type: "png",
    width: 1024,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#1B1814FF", light: "#FFFFFFFF" },
  });
  const file = `${item.slug}.png`;
  writeFileSync(resolve(OUT, file), png);
  written.push(file);
  console.log(`${file.padEnd(16)} ${item.name.padEnd(14)} ${item.url}`);
}

// 実地テストで持ち歩く用の一覧（A4縦・4列）
const dataUri = async (url: string) =>
  (await QRCode.toDataURL(url, { width: 420, margin: 1, errorCorrectionLevel: "M" }));

const cards = await Promise.all(
  items.map(async (i) => `    <figure>
      <img src="${await dataUri(i.url)}" width="150" height="150" alt="${i.name} のQRコード">
      <figcaption><b>${i.kanji} ${i.name}</b><span>${i.kind}</span><code>${i.url}</code></figcaption>
    </figure>`),
);

writeFileSync(
  resolve(OUT, "print-sheet.html"),
  `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>まわりみち QR一覧（実地テスト用）</title>
<style>
  @page { size: A4 portrait; margin: 12mm; }
  * { box-sizing: border-box; margin: 0; }
  body {
    font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif;
    color: #2A2620; padding: 12mm; font-feature-settings: "palt" 1;
  }
  h1 { font-size: 15pt; letter-spacing: .08em; }
  .meta { font-size: 8pt; color: #6B6355; margin: 4px 0 14px; line-height: 1.7; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10mm 6mm; }
  figure { text-align: center; break-inside: avoid; }
  figure img { inline-size: 100%; max-inline-size: 150px; block-size: auto; margin-inline: auto; }
  figcaption { margin-top: 4px; line-height: 1.5; }
  figcaption b { display: block; font-size: 10pt; }
  figcaption span { display: block; font-size: 7.5pt; color: #6B6355; }
  figcaption code { display: block; font-size: 6pt; color: #9A9284; word-break: break-all; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
  <h1>まわりみち — QR一覧（実地テスト用）</h1>
  <p class="meta">
    発行 ${new Date().toISOString().slice(0, 10)} ／ ${DIRECT ? `遷移先 <code>${BASE}/s/&lt;token&gt;</code>（直URL・検証限り）` : `<b>PivoLink 経由</b> <code>${BASE}/r/mawarimichi-&lt;key&gt;</code>`}<br>
    ${DIRECT ? "★直URLです。まわりみち側のURLが変わると使えなくなります。" : "★遷移先は PivoLink のダッシュボードからいつでも変更できます。<b>このQRは刷り直し不要です。</b>"}<br>
    ★スタートのQRから読み始めてください。スポットのQRは、目的地を選んだあとに読むと物語とスタンプが出ます。
  </p>
  <div class="grid">
${cards.join("\n")}
  </div>
</body>
</html>`,
);

console.log(`\n${written.length}件を ${OUT} に書き出しました（print-sheet.html 付き）`);
