import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'

// QR一覧の並び順を保存する。body: { orderedIds: string[] }（先頭が一番上）
export async function PATCH(request: NextRequest) {
  const auth = await requireUser()
  if (auth.error) return auth.error
  const { supabase, userId } = auth

  const body = await request.json()
  const orderedIds: unknown = body.orderedIds
  if (!Array.isArray(orderedIds) || orderedIds.some(id => typeof id !== 'string')) {
    return NextResponse.json({ error: '不正なリクエストです' }, { status: 400 })
  }

  // 各QRの sort_order を配列のインデックスに更新（自分のQRのみ）
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from('qr_codes')
        .update({ sort_order: index })
        .eq('id', id as string)
        .eq('user_id', userId)
    )
  )

  return NextResponse.json({ success: true })
}
