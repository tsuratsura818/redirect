import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { SITE_URL, LEGACY_REDIRECT_ORIGIN } from '@/lib/site'

const SITE_HOST = new URL(SITE_URL).host
const LEGACY_HOST = new URL(LEGACY_REDIRECT_ORIGIN).host

/**
 * 旧ドメイン `redirect.tsuratsura.com` は廃止しない。
 * 発行済みQR / NFC が指す `/r/[slug]` は**旧ドメインのまま永久に受け続ける**。
 * それ以外のページだけを新ドメインへ 301 で寄せて、検索評価を一本化する。
 *
 * SITE_HOST が旧ドメインのままの間は条件が成立しないので、この関数は何もしない。
 * つまり `NEXT_PUBLIC_BASE_URL` を差し替えた瞬間に切替が有効になる。
 */
function legacyHostRedirect(request: NextRequest): NextResponse | null {
  const host = request.headers.get('host') ?? ''
  if (host !== LEGACY_HOST || host === SITE_HOST) return null

  const { pathname, search } = request.nextUrl
  // QRの実リダイレクトと内部APIは旧ドメインのまま通す
  if (pathname.startsWith('/r/') || pathname.startsWith('/api/')) return null

  return NextResponse.redirect(`${SITE_URL}${pathname}${search}`, 301)
}

export async function proxy(request: NextRequest) {
  const redirected = legacyHostRedirect(request)
  if (redirected) return redirected

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
