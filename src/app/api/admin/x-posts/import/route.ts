import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'

interface ImportPost {
  content: string
  category: string
  post_number: number
  hashtags?: string[]
}

// 一括インポート
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await requireAdmin(user.id)

    const { posts } = await request.json() as { posts: ImportPost[] }

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json({ error: 'posts array is required' }, { status: 400 })
    }

    const admin = createAdminClient()

    const insertData = posts.map(p => ({
      content: p.content,
      category: p.category ?? 'general',
      post_number: p.post_number,
      hashtags: p.hashtags ?? [],
      status: 'draft' as const,
      sort_order: p.post_number,
    }))

    const { data, error } = await admin
      .from('x_scheduled_posts')
      .insert(insertData)
      .select('id')

    if (error) throw error

    return NextResponse.json({
      success: true,
      imported: data?.length ?? 0,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
