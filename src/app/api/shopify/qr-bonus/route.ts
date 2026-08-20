import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SHOPIFY_API_VERSION = '2026-01'
// Shopify Flow のトリガー条件に使うタグ。Flow 側で「付与 → このタグを削除」を行う
const BONUS_TAG = 'qr-login-bonus'

/**
 * QRログインボーナス用 Shopify App Proxy バックエンド
 *
 * 経路: QR → Pivolink /r/{slug} → https://{shop}/apps/qr-bonus
 *      → Shopify App Proxy → このエンドポイント
 *
 * 1. App Proxy の署名を検証
 * 2. logged_in_customer_id でログイン顧客を特定（未ログインはログインへ誘導）
 * 3. qr_bonus_claims の UNIQUE 制約で「1日1回」を保証
 * 4. 顧客にタグ qr-login-bonus を付与 → Shopify Flow → どこポイ がポイント加算
 */
export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams

  // shop は App Proxy が必ず付与する myshopify ドメイン
  const shop = (params.get('shop') || '').trim().toLowerCase()
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop)) {
    return htmlResponse('エラー', 'リクエストが正しくありません。', 400)
  }

  // ストアごとの secret / token を環境変数から取得
  const storeKey = shop.replace(/[^a-z0-9]/gi, '_').toUpperCase()
  const appSecret = process.env[`SHOPIFY_APP_SECRET_${storeKey}`]
  const adminToken = process.env[`SHOPIFY_ADMIN_TOKEN_${storeKey}`]
  if (!appSecret || !adminToken) {
    return htmlResponse('設定エラー', 'このストアは未設定です。管理者にお問い合わせください。', 500)
  }

  // App Proxy 署名検証（これ以降 logged_in_customer_id は信頼できる）
  if (!verifyProxySignature(params, appSecret)) {
    return htmlResponse('エラー', '不正なアクセスです。', 403)
  }

  // ログイン判定。未ログインならログインページへ誘導し、戻ってきたら付与
  const customerId = (params.get('logged_in_customer_id') || '').replace(/\D/g, '')
  if (!customerId) {
    const pathPrefix = params.get('path_prefix') || '/apps/qr-bonus'
    return new NextResponse(null, {
      status: 302,
      // 相対パス → ブラウザが現在のストアドメインで解決する
      headers: { Location: `/account/login?return_url=${encodeURIComponent(pathPrefix)}` },
    })
  }

  const points = Number.parseInt(process.env.QRBONUS_POINTS || '50', 10) || 50
  const claimDate = jstToday()
  const supabase = createAdminClient()

  // 重複チェック＆予約。UNIQUE 制約違反 = 当日付与済み
  const { error: insertError } = await supabase.from('qr_bonus_claims').insert({
    shop_domain: shop,
    shopify_customer_id: Number(customerId),
    claim_date: claimDate,
    points,
  })
  if (insertError) {
    if (insertError.code === '23505') {
      return htmlResponse(
        '受取済み',
        'このログインボーナスは受け取り済みです。<br />おひとり様1回までのご利用となります。',
        200,
      )
    }
    return htmlResponse('エラー', 'しばらくしてからもう一度お試しください。', 500)
  }

  // 顧客にタグ付与 → Shopify Flow が検知 → どこポイがポイント加算
  const tagged = await addCustomerTag(shop, adminToken, customerId)
  if (!tagged) {
    // 付与に失敗したので予約行を削除し、再スキャンで再試行できるようにする
    await supabase
      .from('qr_bonus_claims')
      .delete()
      .eq('shop_domain', shop)
      .eq('shopify_customer_id', Number(customerId))
      .eq('claim_date', claimDate)
    return htmlResponse('エラー', 'ポイントの付与に失敗しました。もう一度お試しください。', 502)
  }

  return successResponse(points)
}

/**
 * Shopify App Proxy の署名検証
 * signature 以外の全クエリを key=value（複数値は ,連結）にし、キー昇順で区切り無し連結 →
 * アプリの API secret で HMAC-SHA256(hex) → signature と定数時間比較
 */
function verifyProxySignature(params: URLSearchParams, secret: string): boolean {
  const signature = params.get('signature')
  if (!signature) return false

  const grouped: Record<string, string[]> = {}
  for (const [key, value] of params.entries()) {
    if (key === 'signature') continue
    ;(grouped[key] ??= []).push(value)
  }
  const message = Object.keys(grouped)
    .sort()
    .map((key) => `${key}=${grouped[key].join(',')}`)
    .join('')

  const digest = crypto.createHmac('sha256', secret).update(message).digest('hex')
  const expected = Buffer.from(digest, 'utf8')
  const actual = Buffer.from(signature, 'utf8')
  if (expected.length !== actual.length) return false
  return crypto.timingSafeEqual(expected, actual)
}

interface TagsAddResponse {
  data?: { tagsAdd?: { userErrors?: { message: string }[] } }
}

/** Shopify Admin API (GraphQL) で顧客にタグを追加 */
async function addCustomerTag(
  shop: string,
  token: string,
  customerId: string,
): Promise<boolean> {
  const query = `mutation tagsAdd($id: ID!, $tags: [String!]!) {
    tagsAdd(id: $id, tags: $tags) { userErrors { message } }
  }`
  try {
    const res = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { id: `gid://shopify/Customer/${customerId}`, tags: [BONUS_TAG] },
      }),
    })
    if (!res.ok) return false
    const data = (await res.json()) as TagsAddResponse
    const errors = data.data?.tagsAdd?.userErrors ?? []
    return errors.length === 0
  } catch {
    return false
  }
}

/** JST基準の今日の日付 (YYYY-MM-DD)。Vercel は UTC 実行のため明示変換が必須 */
function jstToday(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function renderHtml(title: string, inner: string): string {
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
</head>
<body style="margin:0;font-family:system-ui,-apple-system,'Hiragino Sans','Noto Sans JP',sans-serif;background:#eef2ff;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px;">
<div style="background:#fff;border-radius:20px;box-shadow:0 12px 32px rgba(0,0,0,.12);padding:36px 28px;max-width:380px;width:100%;text-align:center;">
${inner}
</div>
</body>
</html>`
}

function htmlResponse(title: string, message: string, status: number): NextResponse {
  const inner = `<h1 style="font-size:20px;font-weight:700;color:#1f2937;margin:0 0 12px;">${title}</h1>
<p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 20px;">${message}</p>
<a href="/" style="display:inline-block;width:100%;box-sizing:border-box;padding:13px 0;background:#3b82f6;color:#fff;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;">ストアへ進む</a>`
  return new NextResponse(renderHtml(title, inner), {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

function successResponse(points: number): NextResponse {
  const inner = `<h1 style="font-size:20px;font-weight:700;color:#1f2937;margin:0 0 8px;">ログインボーナス</h1>
<div style="font-size:52px;font-weight:800;color:#3b82f6;margin:8px 0;">+${points}<span style="font-size:20px;font-weight:700;margin-left:4px;">ポイント</span></div>
<p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 4px;">ポイントを獲得しました！</p>
<p style="font-size:12px;color:#9ca3af;line-height:1.6;margin:0 0 20px;">反映まで少しお時間がかかる場合があります。</p>
<a href="/" style="display:inline-block;width:100%;box-sizing:border-box;padding:13px 0;background:#3b82f6;color:#fff;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;">お買い物へ</a>`
  return new NextResponse(renderHtml('ポイント獲得', inner), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
