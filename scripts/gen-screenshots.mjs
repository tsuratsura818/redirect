// Play Store用スクリーンショット生成
// スマホ用: 1080x1920 (9:16)
// タブレット用: 1920x1080 (16:9)
import puppeteer from 'puppeteer'
import path from 'path'

const OUT = 'public/app-icons'
const BASE = 'https://redirect.tsuratsura.com'

async function main() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })

  // スマホ用スクリーンショット (1080x1920)
  const phonePages = [
    { name: 'phone-1-top.png', url: '/', w: 1080, h: 1920 },
    { name: 'phone-2-login.png', url: '/login', w: 1080, h: 1920 },
    { name: 'phone-3-lp.png', url: '/lp', w: 1080, h: 1920 },
    { name: 'phone-4-demo.png', url: '/demo', w: 1080, h: 1920 },
  ]

  // タブレット用スクリーンショット (1920x1080)
  const tabletPages = [
    { name: 'tablet-1-top.png', url: '/', w: 1920, h: 1080 },
    { name: 'tablet-2-lp.png', url: '/lp', w: 1920, h: 1080 },
    { name: 'tablet-3-login.png', url: '/login', w: 1920, h: 1080 },
    { name: 'tablet-4-demo.png', url: '/demo', w: 1920, h: 1080 },
  ]

  for (const { name, url, w, h } of [...phonePages, ...tabletPages]) {
    console.log(`${name} (${w}x${h})...`)
    const page = await browser.newPage()
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 })
    try {
      await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle2', timeout: 15000 })
      await new Promise(r => setTimeout(r, 1000))
    } catch {
      console.log(`  WARN: ${url} timeout, capturing anyway`)
    }
    await page.screenshot({ path: path.join(OUT, name), type: 'png' })
    await page.close()
    console.log(`  OK`)
  }

  await browser.close()
  console.log('Done!')
}

main().catch(console.error)
