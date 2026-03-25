import { NextRequest, NextResponse } from 'next/server'
import { processScheduledPosts } from '@/lib/x/scheduler'

// Vercel Cron / 外部からの自動投稿トリガー
export async function GET(request: NextRequest) {
  try {
    // CRON_SECRET による認証
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await processScheduledPosts()

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
