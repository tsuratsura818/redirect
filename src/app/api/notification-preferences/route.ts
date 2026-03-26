import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 通知設定の取得
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // デフォルト値（レコードがなければ）
    const prefs = data ?? {
      access_spike_alert: true,
      url_down_alert: true,
      monthly_report: true,
    }

    return NextResponse.json(prefs)
  } catch {
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

// 通知設定の更新
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const body = await request.json()
    const updates: Record<string, boolean> = {}

    if (typeof body.access_spike_alert === 'boolean') {
      updates.access_spike_alert = body.access_spike_alert
    }
    if (typeof body.url_down_alert === 'boolean') {
      updates.url_down_alert = body.url_down_alert
    }
    if (typeof body.monthly_report === 'boolean') {
      updates.monthly_report = body.monthly_report
    }

    const { error } = await supabase
      .from('notification_preferences')
      .upsert(
        { user_id: user.id, ...updates },
        { onConflict: 'user_id' }
      )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}
