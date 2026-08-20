import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { autoSchedulePosts } from '@/lib/x/scheduler'
import { requireUser } from '@/lib/auth'

// 自動スケジューリング（draftをscheduledに一括変換）
export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser()
    if (auth.error) return auth.error
    await requireAdmin(auth.userId)

    const body = await request.json().catch(() => ({}))
    const days = body.days ?? 7

    const scheduled = await autoSchedulePosts(days)

    return NextResponse.json({
      success: true,
      scheduled,
      message: `${scheduled}件のポストをスケジュールしました`,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
