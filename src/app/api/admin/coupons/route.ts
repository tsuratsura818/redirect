import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'
import { stripe } from '@/lib/stripe'

// クーポン一覧取得
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await requireAdmin(user.id)

    const admin = createAdminClient()
    const { data: coupons, error } = await admin
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(coupons)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// クーポン作成
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await requireAdmin(user.id)

    const { code, discountPercent, affiliateUserId, maxUses, description } = await request.json() as {
      code: string
      discountPercent?: number
      affiliateUserId?: string
      maxUses?: number
      description?: string
    }

    if (!code?.trim()) {
      return NextResponse.json({ error: 'クーポンコードは必須です' }, { status: 400 })
    }

    const upperCode = code.trim().toUpperCase()
    const percent = discountPercent ?? 10

    // Stripeクーポン作成
    const stripeCoupon = await stripe.coupons.create({
      percent_off: percent,
      duration: 'forever',
      name: upperCode,
    })

    const admin = createAdminClient()
    const { data: coupon, error } = await admin
      .from('coupons')
      .insert({
        code: upperCode,
        stripe_coupon_id: stripeCoupon.id,
        discount_percent: percent,
        affiliate_user_id: affiliateUserId || null,
        max_uses: maxUses ?? null,
        description: description || null,
        is_active: true,
        current_uses: 0,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(coupon, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    if (message === 'Forbidden') return NextResponse.json({ error: message }, { status: 403 })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
