import puppeteer from 'puppeteer'
import { mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const URL = 'https://redirect.tsuratsura.com/ph-assets'
const OUT_DIR = path.resolve('ph-assets-export')

const CARDS = [
  { id: 1, label: 'thumbnail-hero' },
  { id: 2, label: 'dashboard' },
  { id: 3, label: 'qr-generator' },
  { id: 4, label: 'analytics' },
  { id: 5, label: 'features' },
]

async function main() {
  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true })

  console.log('ブラウザを起動中...')
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()

  // 1270×760 で表示
  await page.setViewport({ width: 1270, height: 760, deviceScaleFactor: 2 })

  console.log(`${URL} を読み込み中...`)
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 })

  // フォントのレンダリング待ち
  await new Promise(r => setTimeout(r, 2000))

  for (const card of CARDS) {
    const selector = `[data-card="${card.id}"]`
    const el = await page.$(selector)
    if (!el) {
      console.warn(`Card ${card.id} が見つかりませんでした`)
      continue
    }

    const outPath = path.join(OUT_DIR, `${card.id}-${card.label}.png`)
    await el.screenshot({ path: outPath })
    console.log(`✅ ${card.id}-${card.label}.png を保存しました`)
  }

  await browser.close()
  console.log(`\n完了！ ${OUT_DIR} に ${CARDS.length} 枚の画像を保存しました。`)
}

main().catch(err => {
  console.error('エラー:', err.message)
  process.exit(1)
})
