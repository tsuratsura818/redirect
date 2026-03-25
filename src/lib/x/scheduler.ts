import { createAdminClient } from '@/lib/supabase/admin'
import { postToX } from './client'

interface SchedulerResult {
  posted: number
  failed: number
  errors: string[]
}

// 次に投稿すべきポストを取得して投稿する
export async function processScheduledPosts(): Promise<SchedulerResult> {
  const supabase = createAdminClient()
  const result: SchedulerResult = { posted: 0, failed: 0, errors: [] }

  // 自動投稿が有効か確認
  const { data: setting } = await supabase
    .from('x_post_settings')
    .select('value')
    .eq('key', 'auto_post_enabled')
    .single()

  if (setting?.value !== 'true') {
    return result
  }

  // 現在時刻以前にスケジュールされた未投稿のポストを取得（最大3件）
  const now = new Date().toISOString()
  const { data: posts, error } = await supabase
    .from('x_scheduled_posts')
    .select('*')
    .eq('status', 'scheduled')
    .lte('scheduled_at', now)
    .order('scheduled_at', { ascending: true })
    .limit(3)

  if (error || !posts || posts.length === 0) {
    return result
  }

  for (const post of posts) {
    // ステータスを posting に更新（排他制御）
    const { error: updateErr } = await supabase
      .from('x_scheduled_posts')
      .update({ status: 'posting' })
      .eq('id', post.id)
      .eq('status', 'scheduled')

    if (updateErr) continue

    const xResult = await postToX(post.content)

    if (xResult.success) {
      await supabase
        .from('x_scheduled_posts')
        .update({
          status: 'posted',
          posted_at: new Date().toISOString(),
          x_post_id: xResult.postId,
          error_message: null,
        })
        .eq('id', post.id)
      result.posted++
    } else {
      await supabase
        .from('x_scheduled_posts')
        .update({
          status: 'failed',
          error_message: xResult.error,
        })
        .eq('id', post.id)
      result.failed++
      result.errors.push(`#${post.post_number}: ${xResult.error}`)
    }
  }

  return result
}

// 自動スケジューリング: draft状態のポストに投稿日時を割り当てる
export async function autoSchedulePosts(daysAhead: number = 7): Promise<number> {
  const supabase = createAdminClient()

  // 設定取得
  const { data: settings } = await supabase
    .from('x_post_settings')
    .select('key, value')

  const settingsMap = new Map(settings?.map(s => [s.key, s.value]) ?? [])
  const postsPerDay = parseInt(settingsMap.get('posts_per_day') ?? '2', 10)
  const postTimes = (settingsMap.get('post_times') ?? '08:00,12:00,19:00').split(',').map((t: string) => t.trim())
  const timesToUse = postTimes.slice(0, postsPerDay)

  // 未スケジュールのdraftポストを取得
  const { data: drafts } = await supabase
    .from('x_scheduled_posts')
    .select('id')
    .eq('status', 'draft')
    .order('sort_order', { ascending: true })
    .order('post_number', { ascending: true })
    .limit(postsPerDay * daysAhead)

  if (!drafts || drafts.length === 0) return 0

  // 既にスケジュール済みの最後の日時を取得
  const { data: lastScheduled } = await supabase
    .from('x_scheduled_posts')
    .select('scheduled_at')
    .eq('status', 'scheduled')
    .order('scheduled_at', { ascending: false })
    .limit(1)

  let startDate: Date
  if (lastScheduled && lastScheduled.length > 0) {
    startDate = new Date(lastScheduled[0].scheduled_at)
    startDate.setDate(startDate.getDate() + 1)
  } else {
    startDate = new Date()
    startDate.setDate(startDate.getDate() + 1)
  }

  let scheduled = 0
  let currentDate = new Date(startDate)
  let draftIndex = 0

  for (let day = 0; day < daysAhead && draftIndex < drafts.length; day++) {
    for (const time of timesToUse) {
      if (draftIndex >= drafts.length) break

      const [hours, minutes] = time.split(':').map(Number)
      const scheduledAt = new Date(currentDate)
      // JST → UTC変換（-9時間）
      scheduledAt.setHours(hours - 9, minutes, 0, 0)

      await supabase
        .from('x_scheduled_posts')
        .update({
          status: 'scheduled',
          scheduled_at: scheduledAt.toISOString(),
        })
        .eq('id', drafts[draftIndex].id)

      scheduled++
      draftIndex++
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return scheduled
}
