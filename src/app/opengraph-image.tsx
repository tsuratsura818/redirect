import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Pivolink'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const CUSTOM_IMAGE_URL = 'https://kqsjflnwuqgzzmdejgil.supabase.co/storage/v1/object/public/assets/ogp/main'

export default async function OGImage() {
  // カスタム画像があればそちらを返す
  try {
    const check = await fetch(CUSTOM_IMAGE_URL, { method: 'HEAD' })
    if (check.ok) {
      const img = await fetch(CUSTOM_IMAGE_URL)
      return new Response(img.body, {
        headers: { 'content-type': img.headers.get('content-type') || 'image/png' },
      })
    }
  } catch { /* fallback */ }

  // InterフォントをGoogle Fontsから取得（Latin限定なので安定）
  const cssRes = await fetch(
    'https://fonts.googleapis.com/css2?family=Inter:wght@800&display=swap',
    { headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36' } }
  )
  const css = await cssRes.text()
  const fontUrl = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/)?.[1]
  const fontData = fontUrl ? await fetch(fontUrl).then(r => r.arrayBuffer()) : null

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          fontFamily: fontData ? 'Inter' : 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* 縦バー（ロゴと同じ比率） */}
          <div style={{
            width: 14,
            height: 108,
            borderRadius: '7px',
            background: 'linear-gradient(to bottom, #43e97b, #38f9d7)',
            marginRight: '22px',
            display: 'flex',
          }} />

          {/* PIVO（ダークネイビー）+ LINK（グリーン） */}
          <span style={{
            fontSize: '108px',
            fontWeight: 800,
            letterSpacing: '0.04em',
            lineHeight: 1,
            color: '#0f172a',
            display: 'flex',
          }}>
            PIVO
          </span>
          <span style={{
            fontSize: '108px',
            fontWeight: 800,
            letterSpacing: '0.04em',
            lineHeight: 1,
            color: '#10b981',
            display: 'flex',
          }}>
            LINK
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      ...(fontData ? {
        fonts: [{ name: 'Inter', data: fontData, style: 'normal', weight: 800 }],
      } : {}),
    }
  )
}
