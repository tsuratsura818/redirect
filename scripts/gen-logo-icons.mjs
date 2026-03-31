// 新ロゴからアプリアイコン + Feature Graphic生成
import puppeteer from 'puppeteer'
import path from 'path'

const OUT = 'public/app-icons'

// アプリアイコン: シンボル（矢印マーク）を中央配置、ダーク背景
function iconHTML(size) {
  const s = size
  return `<!DOCTYPE html>
<html><head><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:${s}px; height:${s}px; overflow:hidden; }
  .bg {
    width:${s}px; height:${s}px;
    background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%);
    display:flex; align-items:center; justify-content:center;
    position:relative;
  }
  .glow {
    position:absolute;
    width:${Math.round(s*0.6)}px; height:${Math.round(s*0.6)}px;
    border-radius:50%;
    background: radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%);
    top:50%; left:50%; transform:translate(-50%,-50%);
  }
  .logo-wrap {
    position:relative; z-index:1;
    width:${Math.round(s*0.7)}px;
  }
  .logo-wrap img {
    width:100%; height:auto;
    filter: brightness(0) invert(1);
  }
  /* シンボル部分だけ切り出し（左半分） */
  .symbol-only {
    width:${Math.round(s*0.55)}px;
    height:${Math.round(s*0.55)}px;
    overflow:hidden;
    position:relative; z-index:1;
  }
  .symbol-only img {
    position:absolute;
    width:${Math.round(s*1.4)}px;
    height:auto;
    top:50%;
    left:${Math.round(s*-0.05)}px;
    transform:translateY(-55%);
  }
</style></head>
<body>
<div class="bg">
  <div class="glow"></div>
  <div class="symbol-only">
    <img src="file:///C:/Users/nishikawa/Desktop/Claude Work/AllProject/redirect/public/app-icons/pivo_logo.png" />
  </div>
</div>
</body></html>`
}

// Feature Graphic (1024x500): ロゴ全体 + キャッチコピー
function featureHTML() {
  return `<!DOCTYPE html>
<html><head><style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;800&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width:1024px; height:500px;
    background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);
    display:flex; align-items:center; overflow:hidden; position:relative;
    font-family:'Noto Sans JP',sans-serif;
  }
  .bg-glow1 { position:absolute; top:-60px; left:150px; width:400px; height:400px; border-radius:50%; background:radial-gradient(circle,rgba(16,185,129,0.1) 0%,transparent 70%); }
  .bg-glow2 { position:absolute; bottom:-80px; right:80px; width:300px; height:300px; border-radius:50%; background:radial-gradient(circle,rgba(16,185,129,0.08) 0%,transparent 70%); }
  .container { display:flex; align-items:center; gap:50px; padding:0 60px; z-index:1; width:100%; }
  .logo-area { flex:0 0 420px; }
  .logo-area img { width:100%; height:auto; }
  .text-area { flex:1; color:white; }
  .catch { font-size:32px; font-weight:800; line-height:1.4; margin-bottom:12px; }
  .catch .green { color:#10b981; }
  .sub { font-size:15px; color:rgba(255,255,255,0.6); line-height:1.6; margin-bottom:16px; }
  .badges { display:flex; gap:10px; }
  .badge { padding:8px 16px; border-radius:20px; font-size:12px; font-weight:700; }
  .badge.primary { background:linear-gradient(135deg,#10b981,#34d399); color:#0f172a; }
  .badge.outline { border:1.5px solid rgba(16,185,129,0.4); color:#10b981; }
</style></head>
<body>
  <div class="bg-glow1"></div>
  <div class="bg-glow2"></div>
  <div class="container">
    <div class="logo-area">
      <img src="file:///C:/Users/nishikawa/Desktop/Claude Work/AllProject/redirect/public/app-icons/pivo_logo.png" />
    </div>
    <div class="text-area">
      <div class="catch">QRの飛び先、<br><span class="green">いつでも変更。</span></div>
      <div class="sub">印刷済みQRコード・NFCタグの<br>リダイレクト先をワンタップで切替</div>
      <div class="badges">
        <span class="badge primary">無料ではじめる</span>
        <span class="badge outline">NFC対応</span>
      </div>
    </div>
  </div>
</body></html>`
}

async function main() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--allow-file-access-from-files'] })

  const items = [
    { name: 'icon-1024.png', w: 1024, h: 1024, html: iconHTML(1024) },
    { name: 'icon-512.png', w: 512, h: 512, html: iconHTML(512) },
    { name: 'icon-192.png', w: 192, h: 192, html: iconHTML(192) },
    { name: 'feature-graphic.png', w: 1024, h: 500, html: featureHTML() },
  ]

  for (const { name, w, h, html } of items) {
    console.log(`${name} (${w}x${h})...`)
    const page = await browser.newPage()
    await page.setViewport({ width: w, height: h })
    await page.setContent(html, { waitUntil: 'networkidle0' })
    await new Promise(r => setTimeout(r, 800))
    await page.screenshot({ path: path.join(OUT, name), type: 'png' })
    await page.close()
  }

  await browser.close()
  console.log('Done!')
}

main().catch(console.error)
