import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'
import { validatePostLength } from '@/lib/x/client'

// 投稿一覧取得
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await requireAdmin(user.id)

    const admin = createAdminClient()
    const { searchParams } = request.nextUrl
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const limit = parseInt(searchParams.get('limit') ?? '50', 10)
    const offset = (page - 1) * limit

    let query = admin
      .from('x_scheduled_posts')
      .select('*', { count: 'exact' })

    if (status) query = query.eq('status', status)
    if (category) query = query.eq('category', category)

    const { data, count, error } = await query
      .order('sort_order', { ascending: true })
      .order('post_number', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // 設定も取得
    const { data: settings } = await admin
      .from('x_post_settings')
      .select('key, value')

    const settingsMap: Record<string, string> = {}
    settings?.forEach(s => { settingsMap[s.key] = s.value })

    return NextResponse.json({ posts: data, total: count, settings: settingsMap })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// 投稿作成
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await requireAdmin(user.id)

    const body = await request.json()
    const { content, category, hashtags, scheduled_at } = body

    if (!content) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 })
    }

    const validation = validatePostLength(content)
    if (!validation.valid) {
      return NextResponse.json({
        error: `Post too long (${validation.length}/280)`,
      }, { status: 400 })
    }

    const admin = createAdminClient()

    // 次の post_number を取得
    const { data: maxPost } = await admin
      .from('x_scheduled_posts')
      .select('post_number')
      .order('post_number', { ascending: false })
      .limit(1)

    const nextNumber = (maxPost?.[0]?.post_number ?? 0) + 1

    const { data, error } = await admin
      .from('x_scheduled_posts')
      .insert({
        content,
        category: category ?? 'general',
        post_number: nextNumber,
        hashtags: hashtags ?? [],
        status: scheduled_at ? 'scheduled' : 'draft',
        scheduled_at: scheduled_at ?? null,
        sort_order: nextNumber,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
