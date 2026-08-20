import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type ServerClient = Awaited<ReturnType<typeof createClient>>

/**
 * 認証必須のAPIルート用ヘルパー。
 * 使い方:
 *   const auth = await requireUser()
 *   if (auth.error) return auth.error
 *   const { supabase, userId } = auth
 */
export async function requireUser(): Promise<
  | { error: NextResponse; supabase: null; userId: null }
  | { error: null; supabase: ServerClient; userId: string }
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return {
      error: NextResponse.json({ error: '認証が必要です' }, { status: 401 }),
      supabase: null,
      userId: null,
    }
  }
  return { error: null, supabase, userId: user.id }
}

/**
 * QRコードのオーナー確認。
 * 所有していなければ 404 レスポンスを返す。所有していれば null。
 */
export async function requireQrOwner(
  supabase: ServerClient,
  qrCodeId: string,
  userId: string,
): Promise<NextResponse | null> {
  const { data } = await supabase
    .from('qr_codes')
    .select('id')
    .eq('id', qrCodeId)
    .eq('user_id', userId)
    .maybeSingle()
  if (!data) {
    return NextResponse.json({ error: '見つかりません' }, { status: 404 })
  }
  return null
}
