import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'

const BUCKET = 'assets'
const OGP_PATH = 'ogp/main'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

// 現在のOGP画像URL取得
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await requireAdmin(user.id)

    const admin = createAdminClient()
    const { data } = admin.storage.from(BUCKET).getPublicUrl(OGP_PATH)
    const url = data.publicUrl

    // 実際にファイルが存在するか確認
    const check = await fetch(url, { method: 'HEAD' })
    return NextResponse.json({
      hasCustom: check.ok,
      url: check.ok ? url : null,
      dynamicUrl: `${SUPABASE_URL.replace('https://', 'https://').replace('.supabase.co', '')}/opengraph-image`,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// OGP画像アップロード
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await requireAdmin(user.id)

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'ファイルがありません' }, { status: 400 })

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      return NextResponse.json({ error: 'PNG または JPG のみ対応しています' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const admin = createAdminClient()
    const { error } = await admin.storage
      .from(BUCKET)
      .upload(OGP_PATH, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (error) throw error

    const { data } = admin.storage.from(BUCKET).getPublicUrl(OGP_PATH)
    return NextResponse.json({ success: true, url: data.publicUrl })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// OGP画像削除（動的生成に戻す）
export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await requireAdmin(user.id)

    const admin = createAdminClient()
    await admin.storage.from(BUCKET).remove([OGP_PATH])
    return NextResponse.json({ success: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
