import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'
import { requireUser } from '@/lib/auth'

// ユーザーロール変更・BAN
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetId } = await params
    const auth = await requireUser()
    if (auth.error) return auth.error
    const { userId } = auth

    await requireAdmin(userId)

    // 自分自身の権限は変更不可
    if (targetId === userId) {
      return NextResponse.json({ error: '自分自身の権限は変更できません' }, { status: 400 })
    }

    const body = await request.json()
    const admin = createAdminClient()

    const updates: Record<string, unknown> = {}
    if (typeof body.role === 'string' && ['admin', 'user'].includes(body.role)) {
      updates.role = body.role
    }
    if (typeof body.is_banned === 'boolean') {
      updates.is_banned = body.is_banned
    }
    if (typeof body.display_name === 'string') {
      updates.display_name = body.display_name
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: '更新内容がありません' }, { status: 400 })
    }

    // プロフィールが存在しない場合は作成
    const { data: existing } = await admin
      .from('user_profiles')
      .select('id')
      .eq('id', targetId)
      .single()

    if (!existing) {
      const { error: insertError } = await admin
        .from('user_profiles')
        .insert({ id: targetId, ...updates })
      if (insertError) throw insertError
    } else {
      const { error: updateError } = await admin
        .from('user_profiles')
        .update(updates)
        .eq('id', targetId)
      if (updateError) throw updateError
    }

    // BANされたユーザーのセッションを無効化
    if (updates.is_banned === true) {
      await admin.auth.admin.updateUserById(targetId, {
        ban_duration: '876000h', // 約100年
      })
    } else if (updates.is_banned === false) {
      await admin.auth.admin.updateUserById(targetId, {
        ban_duration: 'none',
      })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ユーザー削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetId } = await params
    const auth = await requireUser()
    if (auth.error) return auth.error
    const { userId } = auth

    await requireAdmin(userId)

    if (targetId === userId) {
      return NextResponse.json({ error: '自分自身は削除できません' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { error } = await admin.auth.admin.deleteUser(targetId)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
