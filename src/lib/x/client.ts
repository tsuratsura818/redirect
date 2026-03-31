import crypto from 'crypto'

// X API v2 OAuth 1.0a 認証付き投稿クライアント

interface XPostResult {
  success: boolean
  postId?: string
  error?: string
}

interface OAuthParams {
  oauth_consumer_key: string
  oauth_nonce: string
  oauth_signature_method: string
  oauth_timestamp: string
  oauth_token: string
  oauth_version: string
  oauth_signature?: string
}

function generateNonce(): string {
  return crypto.randomBytes(16).toString('hex')
}

function generateSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&')

  const baseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams),
  ].join('&')

  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`

  return crypto
    .createHmac('sha1', signingKey)
    .update(baseString)
    .digest('base64')
}

function buildAuthHeader(params: OAuthParams): string {
  const entries = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
    .join(', ')
  return `OAuth ${entries}`
}

export async function postToX(text: string): Promise<XPostResult> {
  const apiKey = process.env.X_API_KEY
  const apiSecret = process.env.X_API_SECRET
  const accessToken = process.env.X_ACCESS_TOKEN
  const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET

  if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
    return { success: false, error: 'X API credentials not configured' }
  }

  const url = 'https://api.twitter.com/2/tweets'
  const method = 'POST'
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const nonce = generateNonce()

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: apiKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: accessToken,
    oauth_version: '1.0',
  }

  const signature = generateSignature(method, url, oauthParams, apiSecret, accessTokenSecret)

  const authHeader = buildAuthHeader({
    ...oauthParams,
    oauth_signature: signature,
  } as OAuthParams)

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '{}')
      console.error('[X API Error]', response.status, errorText)
      let errorData: Record<string, string> = {}
      try { errorData = JSON.parse(errorText) } catch { /* */ }
      const errorMsg = errorData?.detail || errorData?.title || `HTTP ${response.status}: ${errorText.substring(0, 200)}`
      return { success: false, error: errorMsg }
    }

    const data = await response.json()
    return { success: true, postId: data.data?.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}

// 文字数チェック（X: 280文字、日本語は全角1文字=2文字換算ではなくTwitterは独自ルール）
// X APIでは実際にはURLは23文字固定等の特殊ルールあり。簡易チェックとして280文字制限
export function validatePostLength(text: string): { valid: boolean; length: number } {
  // 簡易: X APIのweighted length計算（日本語等は重み2）
  let length = 0
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0
    // CJK文字やその他の全角文字は重み2
    if (
      (code >= 0x1100 && code <= 0x11FF) || // ハングル
      (code >= 0x2E80 && code <= 0x9FFF) || // CJK
      (code >= 0xAC00 && code <= 0xD7AF) || // ハングル
      (code >= 0xF900 && code <= 0xFAFF) || // CJK互換
      (code >= 0xFE30 && code <= 0xFE4F) || // CJK互換形
      (code >= 0xFF00 && code <= 0xFFEF) || // 全角
      (code >= 0x20000 && code <= 0x2FA1F)  // CJK拡張
    ) {
      length += 2
    } else {
      length += 1
    }
  }
  return { valid: length <= 280, length }
}
