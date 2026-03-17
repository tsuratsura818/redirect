import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// 初回セットアップ: 最初のユーザーを管理者にする
// user_profilesにadminが1人もいない場合のみ動作
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()

    // 既にadminが存在するか確認
    const { data: existingAdmin } = await admin
      .from('user_profiles')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single()

    if (existingAdmin) {
      return NextResponse.json({ error: '管理者は既に設定されています' }, { status: 400 })
    }

    // プロフィールが存在しない場合は作成
    const { data: profile } = await admin
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      await admin.from('user_profiles').insert({
        id: user.id,
        role: 'admin',
        display_name: user.email?.split('@')[0] || 'Admin',
      })
    } else {
      await admin
        .from('user_profiles')
        .update({ role: 'admin' })
        .eq('id', user.id)
    }

    return NextResponse.json({ success: true, message: '管理者に設定しました' })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
