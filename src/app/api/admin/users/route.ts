import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'

// ユーザー一覧取得
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await requireAdmin(user.id)

    const admin = createAdminClient()

    // Supabase Auth からユーザー一覧取得
    const { data: { users }, error: authError } = await admin.auth.admin.listUsers({
      perPage: 1000,
    })
    if (authError) throw authError

    // プロフィール一括取得
    const { data: profiles } = await admin
      .from('user_profiles')
      .select('*')

    const profileMap = new Map((profiles || []).map(p => [p.id, p]))

    // QRコード数を一括取得
    const { data: qrCounts } = await admin
      .from('qr_codes')
      .select('user_id')

    const countMap = new Map<string, number>()
    for (const row of qrCounts || []) {
      countMap.set(row.user_id, (countMap.get(row.user_id) || 0) + 1)
    }

    const result = users.map(u => ({
      id: u.id,
      email: u.email || '',
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at || null,
      profile: profileMap.get(u.id) || null,
      qr_count: countMap.get(u.id) || 0,
    }))

    return NextResponse.json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
