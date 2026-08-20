import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'
import { requireUser } from '@/lib/auth'

// 設定更新
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireUser()
    if (auth.error) return auth.error
    await requireAdmin(auth.userId)

    const body = await request.json() as Record<string, string>
    const admin = createAdminClient()

    const validKeys = ['posts_per_day', 'post_times', 'timezone', 'auto_post_enabled']

    for (const [key, value] of Object.entries(body)) {
      if (!validKeys.includes(key)) continue

      await admin
        .from('x_post_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() })
    }

    // 更新後の設定を取得
    const { data: settings } = await admin
      .from('x_post_settings')
      .select('key, value')

    const settingsMap: Record<string, string> = {}
    settings?.forEach(s => { settingsMap[s.key] = s.value })

    return NextResponse.json(settingsMap)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
