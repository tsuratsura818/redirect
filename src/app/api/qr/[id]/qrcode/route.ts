import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import QRCode from 'qrcode'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const { data: qrCode } = await supabase
    .from('qr_codes')
    .select('slug')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!qrCode) {
    return NextResponse.json({ error: '見つかりません' }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'png'
  const size = parseInt(searchParams.get('size') || '400', 10)
  const baseUrl = searchParams.get('baseUrl') || process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || ''
  const redirectUrl = `${baseUrl}/r/${qrCode.slug}`

  if (format === 'svg') {
    const svg = await QRCode.toString(redirectUrl, {
      type: 'svg',
      width: size,
      margin: 2,
    })
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `inline; filename="qr-${qrCode.slug}.svg"`,
      },
    })
  }

  const buffer = await QRCode.toBuffer(redirectUrl, {
    width: size,
    margin: 2,
    type: 'png',
  })

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `inline; filename="qr-${qrCode.slug}.png"`,
    },
  })
}
