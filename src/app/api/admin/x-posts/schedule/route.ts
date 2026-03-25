import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { autoSchedulePosts } from '@/lib/x/scheduler'

// 自動スケジューリング（draftをscheduledに一括変換）
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await requireAdmin(user.id)

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
