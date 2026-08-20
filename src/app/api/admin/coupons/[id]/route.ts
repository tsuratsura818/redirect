import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'
import { requireUser } from '@/lib/auth'

// クーポン更新（有効/無効切り替え、上限変更）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await requireUser()
    if (auth.error) return auth.error
    await requireAdmin(auth.userId)

    const body = await request.json()
    const updates: Record<string, unknown> = {}

    if (typeof body.is_active === 'boolean') {
      updates.is_active = body.is_active
    }
    if (typeof body.max_uses === 'number' || body.max_uses === null) {
      updates.max_uses = body.max_uses
    }
    if (typeof body.description === 'string') {
      updates.description = body.description
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: '更新内容がありません' }, { status: 400 })
    }

    updates.updated_at = new Date().toISOString()

    const admin = createAdminClient()
    const { data: coupon, error } = await admin
      .from('coupons')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(coupon)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// クーポン無効化（ソフトデリート）
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await requireUser()
    if (auth.error) return auth.error
    await requireAdmin(auth.userId)

    const admin = createAdminClient()
    const { error } = await admin
      .from('coupons')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
