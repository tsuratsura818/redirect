import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isApprovedAffiliate } from '@/lib/affiliate'
import type { BankAccount } from '@/types/affiliate'

// 口座情報取得
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const approved = await isApprovedAffiliate(user.id)
    if (!approved) {
      return NextResponse.json({ error: 'アフィリエイトとして承認されていません' }, { status: 403 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('affiliate_bank_accounts')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return NextResponse.json(data as BankAccount | null)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// 口座情報登録・更新
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const approved = await isApprovedAffiliate(user.id)
    if (!approved) {
      return NextResponse.json({ error: 'アフィリエイトとして承認されていません' }, { status: 403 })
    }

    const { bankName, branchName, accountType, accountNumber, accountHolder } = await request.json() as {
      bankName: string
      branchName: string
      accountType: '普通' | '当座'
      accountNumber: string
      accountHolder: string
    }

    if (!bankName || !branchName || !accountType || !accountNumber || !accountHolder) {
      return NextResponse.json({ error: '全ての項目を入力してください' }, { status: 400 })
    }

    if (!['普通', '当座'].includes(accountType)) {
      return NextResponse.json({ error: '口座種別が無効です' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('affiliate_bank_accounts')
      .upsert(
        {
          user_id: user.id,
          bank_name: bankName,
          branch_name: branchName,
          account_type: accountType,
          account_number: accountNumber,
          account_holder: accountHolder,
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data as BankAccount)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
