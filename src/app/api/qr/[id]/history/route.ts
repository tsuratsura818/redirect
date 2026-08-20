import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireUser()
  if (auth.error) return auth.error
  const { supabase } = auth

  const { data } = await supabase
    .from('redirect_history')
    .select('*')
    .eq('qr_code_id', id)
    .order('created_at', { ascending: false })
    .limit(50)

  return NextResponse.json(data || [])
}
