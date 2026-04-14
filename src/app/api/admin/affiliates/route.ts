import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'

// アフィリエイト申請一覧取得
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await requireAdmin(user.id)

    const admin = createAdminClient()

    // 申請一覧取得
    const { data: applications, error } = await admin
      .from('affiliate_applications')
      .select('*')
      .order('applied_at', { ascending: false })

    if (error) throw error

    // ユーザーIDリスト
    const userIds = (applications || []).map((a) => a.user_id)

    // Auth情報からメールアドレス取得
    const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })
    const emailMap = new Map(users.map((u) => [u.id, u.email || '']))

    // プロフィール取得
    const { data: profiles } = await admin
      .from('user_profiles')
      .select('id, display_name')
      .in('id', userIds)

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]))

    // 振込先口座登録状況を取得
    const { data: bankAccounts } = await admin
      .from('affiliate_bank_accounts')
      .select('user_id')
      .in('user_id', userIds)

    const bankAccountSet = new Set((bankAccounts || []).map((b) => b.user_id))

    const result = (applications || []).map((app) => ({
      ...app,
      email: emailMap.get(app.user_id) || '',
      display_name: profileMap.get(app.user_id)?.display_name || null,
      has_bank_account: bankAccountSet.has(app.user_id),
    }))

    return NextResponse.json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
