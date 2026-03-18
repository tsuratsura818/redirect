import puppeteer from 'puppeteer'
import { mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const BASE_URL = 'https://redirect.tsuratsura.com'
const OUT_DIR = path.resolve('launch-assets-export')

// data-card 属性値 → ファイル名のマッピング
const CARDS = [
  // Product Hunt (1270×760)
  { label: '① Hero / Thumbnail',   file: 'ph-01-hero',       platform: 'product-hunt' },
  { label: '② Pricing',            file: 'ph-02-pricing',    platform: 'product-hunt' },
  { label: '③ A/B Test & Schedule',file: 'ph-03-features',   platform: 'product-hunt' },
  // OGP / BetaList / IndieHackers (1200×630)
  { label: 'OGP / Social Card',    file: 'ogp-betalist',     platform: 'ogp-betalist' },
  // Twitter/X (1200×628)
  { label: 'Twitter Card',         file: 'twitter-card',     platform: 'twitter' },
  // AlternativeTo (512×512)
  { label: 'Square Logo',          file: 'logo-512',         platform: 'alternativeto' },
]

async function main() {
  // 出力ディレクトリ作成
  await mkdir(OUT_DIR, { recursive: true })
  for (const p of ['product-hunt', 'ogp-betalist', 'twitter', 'alternativeto']) {
    await mkdir(path.join(OUT_DIR, p), { recursive: true })
  }

  console.log('🚀 ブラウザを起動中...')
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  })

  const page = await browser.newPage()

  // 幅を最大に設定してレイアウト崩れを防ぐ
  await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 2 })

  // フォント読み込み
  await page.evaluateOnNewDocument(() => {
    document.fonts?.ready
  })

  const targetUrl = `${BASE_URL}/launch-assets`
  console.log(`📄 ${targetUrl} を読み込み中...`)
  await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 60000 })

  // フォント・アニメーション安定待ち
  await new Promise(r => setTimeout(r, 3000))

  let successCount = 0

  for (const card of CARDS) {
    // data-card 属性でセレクト（特殊文字エスケープ）
    const escaped = card.label.replace(/"/g, '\\"')
    const selector = `[data-card="${escaped}"]`

    const el = await page.$(selector)
    if (!el) {
      console.warn(`⚠️  "${card.label}" が見つかりません。スキップします。`)
      continue
    }

    const outPath = path.join(OUT_DIR, card.platform, `${card.file}.png`)
    await el.screenshot({ path: outPath })
    console.log(`✅ [${card.platform}] ${card.file}.png`)
    successCount++
  }

  await browser.close()

  console.log(`\n🎉 完了！ ${successCount}/${CARDS.length} 枚を ${OUT_DIR}/ に保存しました。`)
  console.log('\nフォルダ構成:')
  console.log('  launch-assets-export/')
  console.log('    product-hunt/   → ph-01-hero.png / ph-02-pricing.png / ph-03-features.png')
  console.log('    ogp-betalist/   → ogp-betalist.png')
  console.log('    twitter/        → twitter-card.png')
  console.log('    alternativeto/  → logo-512.png')
}

main().catch(err => {
  console.error('❌ エラー:', err.message)
  process.exit(1)
})
