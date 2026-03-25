import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'
import { postToX } from '@/lib/x/client'

// 即時投稿
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await requireAdmin(user.id)

    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const admin = createAdminClient()

    // 投稿取得
    const { data: post, error: fetchErr } = await admin
      .from('x_scheduled_posts')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchErr || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (post.status === 'posted') {
      return NextResponse.json({ error: 'Already posted' }, { status: 400 })
    }

    // posting状態に更新
    await admin
      .from('x_scheduled_posts')
      .update({ status: 'posting' })
      .eq('id', id)

    // X APIに投稿
    const result = await postToX(post.content)

    if (result.success) {
      await admin
        .from('x_scheduled_posts')
        .update({
          status: 'posted',
          posted_at: new Date().toISOString(),
          x_post_id: result.postId,
          error_message: null,
        })
        .eq('id', id)

      return NextResponse.json({
        success: true,
        postId: result.postId,
        url: `https://x.com/i/status/${result.postId}`,
      })
    } else {
      await admin
        .from('x_scheduled_posts')
        .update({
          status: 'failed',
          error_message: result.error,
        })
        .eq('id', id)

      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 500 })
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
