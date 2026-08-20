import { NextRequest, NextResponse } from 'next/server'
import { validateCouponCode } from '@/lib/affiliate'
import { requireUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser()
    if (auth.error) return auth.error
    const { userId } = auth

    const { code } = await request.json() as { code: string }
    if (!code?.trim()) {
      return NextResponse.json({ error: 'クーポンコードを入力してください' }, { status: 400 })
    }

    const result = await validateCouponCode(code.trim(), userId)

    if (!result.valid) {
      return NextResponse.json({ valid: false, error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      valid: true,
      discount_percent: result.coupon!.discount_percent,
      coupon_id: result.coupon!.id,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
