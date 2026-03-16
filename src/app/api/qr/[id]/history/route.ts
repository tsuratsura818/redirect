import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  const { data } = await supabase
    .from('redirect_history')
    .select('*')
    .eq('qr_code_id', id)
    .order('created_at', { ascending: false })
    .limit(50)

  return NextResponse.json(data || [])
}
