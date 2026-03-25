import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'
import { validatePostLength } from '@/lib/x/client'

type Params = { params: Promise<{ id: string }> }

// 投稿取得
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await requireAdmin(user.id)

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('x_scheduled_posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(data)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// 投稿更新
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await requireAdmin(user.id)

    const body = await request.json()
    const { content, category, hashtags, status, scheduled_at, sort_order } = body

    if (content) {
      const validation = validatePostLength(content)
      if (!validation.valid) {
        return NextResponse.json({
          error: `Post too long (${validation.length}/280)`,
        }, { status: 400 })
      }
    }

    const admin = createAdminClient()
    const updateData: Record<string, unknown> = {}
    if (content !== undefined) updateData.content = content
    if (category !== undefined) updateData.category = category
    if (hashtags !== undefined) updateData.hashtags = hashtags
    if (status !== undefined) updateData.status = status
    if (scheduled_at !== undefined) updateData.scheduled_at = scheduled_at
    if (sort_order !== undefined) updateData.sort_order = sort_order

    const { data, error } = await admin
      .from('x_scheduled_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// 投稿削除
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await requireAdmin(user.id)

    const admin = createAdminClient()
    const { error } = await admin
      .from('x_scheduled_posts')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
