import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// アフィリエイト申請
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { motivation, communityName, communityUrl } = await request.json() as {
      motivation?: string
      communityName?: string
      communityUrl?: string
    }

    const admin = createAdminClient()

    // 既存の申請チェック
    const { data: existing } = await admin
      .from('affiliate_applications')
      .select('id, status')
      .eq('user_id', user.id)
      .single()

    // 既に承認済みまたは審査中の場合はエラー
    if (existing) {
      if (existing.status === 'approved') {
        return NextResponse.json({ error: '既にアフィリエイトとして承認されています' }, { status: 400 })
      }
      if (existing.status === 'pending') {
        return NextResponse.json({ error: '既に申請中です。審査をお待ちください' }, { status: 400 })
      }
      // rejected の場合は再申請を許可（既存レコードを更新）
      const { error: updateError } = await admin
        .from('affiliate_applications')
        .update({
          status: 'pending',
          motivation: motivation || null,
          community_name: communityName || null,
          community_url: communityUrl || null,
          applied_at: new Date().toISOString(),
          reviewed_at: null,
          reviewed_by: null,
          rejection_reason: null,
        })
        .eq('id', existing.id)

      if (updateError) throw updateError

      return NextResponse.json({ success: true, message: '再申請を受け付けました' })
    }

    // 新規申請
    const { error: insertError } = await admin
      .from('affiliate_applications')
      .insert({
        user_id: user.id,
        status: 'pending',
        motivation: motivation || null,
        community_name: communityName || null,
        community_url: communityUrl || null,
      })

    if (insertError) throw insertError

    return NextResponse.json({ success: true, message: '申請を受け付けました' })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
