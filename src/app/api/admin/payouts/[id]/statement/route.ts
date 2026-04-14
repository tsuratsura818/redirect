import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function formatYenAmount(amount: number): string {
  return `\u00A5${amount.toLocaleString()}`
}

async function generateInvoiceNumber(
  admin: ReturnType<typeof createAdminClient>,
  payoutId: string,
  periodStart: string
): Promise<string> {
  const d = new Date(periodStart)
  const yyyymm = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`

  // 同月の既存invoice_numberの最大連番を取得
  const prefix = `PAY-${yyyymm}-`
  const { data: existing } = await admin
    .from('affiliate_payouts')
    .select('invoice_number')
    .like('invoice_number', `${prefix}%`)
    .order('invoice_number', { ascending: false })
    .limit(1)

  let seq = 1
  if (existing && existing.length > 0 && existing[0].invoice_number) {
    const lastSeq = parseInt(existing[0].invoice_number.replace(prefix, ''), 10)
    if (!isNaN(lastSeq)) seq = lastSeq + 1
  }

  const invoiceNumber = `${prefix}${String(seq).padStart(3, '0')}`

  // payoutレコードに保存
  await admin
    .from('affiliate_payouts')
    .update({ invoice_number: invoiceNumber })
    .eq('id', payoutId)

  return invoiceNumber
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// 支払明細書HTML生成
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })

    await requireAdmin(user.id)

    const admin = createAdminClient()

    // 報酬データ取得
    const { data: payout, error } = await admin
      .from('affiliate_payouts')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !payout) {
      return new NextResponse('報酬データが見つかりません', { status: 404 })
    }

    // アフィリエイトユーザーのメール取得
    const { data: { user: affiliateUser } } = await admin.auth.admin.getUserById(payout.affiliate_user_id)
    const affiliateEmail = affiliateUser?.email || '不明'

    // 口座情報取得
    const { data: bankAccount } = await admin
      .from('affiliate_bank_accounts')
      .select('*')
      .eq('user_id', payout.affiliate_user_id)
      .single()

    // invoice_number生成（未設定の場合）
    let invoiceNumber = payout.invoice_number as string | null
    if (!invoiceNumber) {
      invoiceNumber = await generateInvoiceNumber(admin, id, payout.period_start)
    }

    // 口座情報スナップショット保存（未保存の場合）
    if (bankAccount && !payout.bank_snapshot) {
      await admin
        .from('affiliate_payouts')
        .update({
          bank_snapshot: {
            bank_name: bankAccount.bank_name,
            branch_name: bankAccount.branch_name,
            account_type: bankAccount.account_type,
            account_number: bankAccount.account_number,
            account_holder: bankAccount.account_holder,
          },
        })
        .eq('id', id)
    }

    // スナップショットがあればそちらを優先
    const bankInfo = (payout.bank_snapshot as Record<string, string> | null) || bankAccount

    const today = new Date()
    const issueDate = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`
    const periodStartFormatted = formatDate(payout.period_start)
    const periodEndFormatted = formatDate(payout.period_end)
    const amount = payout.amount as number
    const activeReferrals = payout.active_referrals as number

    const bankSection = bankInfo
      ? buildBankInfoSection(bankInfo)
      : buildEmptyBankSection()

    const html = buildStatementHtml({
      invoiceNumber,
      affiliateEmail,
      issueDate,
      periodStartFormatted,
      periodEndFormatted,
      amount,
      activeReferrals,
      bankSection,
    })

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    if (message === 'Forbidden') return new NextResponse('Forbidden', { status: 403 })
    return new NextResponse(message, { status: 500 })
  }
}

function buildBankInfoSection(bankInfo: Record<string, string>): string {
  return `<div class="bank-section">
      <div class="bank-title">振込先情報</div>
      <div class="bank-grid">
        <span class="bank-label">金融機関</span>
        <span>${escapeHtml(bankInfo.bank_name)}</span>
        <span class="bank-label">支店名</span>
        <span>${escapeHtml(bankInfo.branch_name)}</span>
        <span class="bank-label">口座種別</span>
        <span>${escapeHtml(bankInfo.account_type)}</span>
        <span class="bank-label">口座番号</span>
        <span>${escapeHtml(bankInfo.account_number)}</span>
        <span class="bank-label">口座名義</span>
        <span>${escapeHtml(bankInfo.account_holder)}</span>
      </div>
    </div>`
}

function buildEmptyBankSection(): string {
  return `<div class="bank-section">
      <div class="bank-title">振込先情報</div>
      <p style="color: #999;">口座情報が未登録です</p>
    </div>`
}

interface StatementParams {
  invoiceNumber: string
  affiliateEmail: string
  issueDate: string
  periodStartFormatted: string
  periodEndFormatted: string
  amount: number
  activeReferrals: number
  bankSection: string
}

function buildStatementHtml(p: StatementParams): string {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>支払明細書 ${escapeHtml(p.invoiceNumber)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif;
      font-size: 14px;
      color: #333;
      background: #f5f5f5;
      line-height: 1.6;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 20px auto;
      padding: 20mm 20mm 30mm;
      background: #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .print-btn-container {
      text-align: center;
      margin: 20px auto;
      max-width: 210mm;
    }
    .print-btn {
      padding: 12px 32px;
      font-size: 16px;
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    .print-btn:hover { background: #1d4ed8; }
    .title {
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 8px;
      letter-spacing: 8px;
      border-bottom: 3px double #333;
      padding-bottom: 12px;
    }
    .meta {
      display: flex;
      justify-content: space-between;
      margin: 24px 0 32px;
    }
    .meta-left, .meta-right { width: 48%; }
    .meta-right { text-align: right; }
    .label { font-size: 12px; color: #666; margin-bottom: 2px; }
    .payee-section { margin-bottom: 24px; }
    .payee-name {
      font-size: 18px;
      font-weight: bold;
      border-bottom: 1px solid #333;
      padding-bottom: 4px;
      display: inline-block;
      margin-bottom: 4px;
    }
    .payee-suffix { font-size: 16px; margin-left: 8px; }
    .payer-name { font-size: 16px; font-weight: bold; }
    .payer-address { font-size: 13px; color: #555; }
    .amount-box {
      border: 2px solid #333;
      padding: 16px 24px;
      margin: 24px 0;
      text-align: center;
    }
    .amount-label { font-size: 14px; margin-bottom: 4px; }
    .amount-value { font-size: 28px; font-weight: bold; letter-spacing: 2px; }
    table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    th, td { border: 1px solid #ccc; padding: 10px 12px; text-align: left; }
    th { background: #f0f0f0; font-weight: bold; font-size: 13px; }
    td { font-size: 14px; }
    .text-right { text-align: right; }
    .total-row td { font-weight: bold; background: #fafafa; }
    .bank-section {
      margin: 32px 0;
      padding: 16px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .bank-title {
      font-weight: bold;
      font-size: 15px;
      margin-bottom: 12px;
      padding-bottom: 4px;
      border-bottom: 1px solid #eee;
    }
    .bank-grid {
      display: grid;
      grid-template-columns: 100px 1fr;
      gap: 6px 16px;
      font-size: 14px;
    }
    .bank-label { color: #666; font-size: 13px; }
    .footer {
      margin-top: 48px;
      text-align: center;
      font-size: 12px;
      color: #888;
      border-top: 1px solid #eee;
      padding-top: 16px;
    }
    .invoice-info { font-size: 13px; color: #555; }
    @media print {
      body { background: #fff; }
      .page {
        margin: 0;
        box-shadow: none;
        width: 100%;
        min-height: auto;
        padding: 15mm;
      }
      .print-btn-container { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="print-btn-container">
    <button class="print-btn" onclick="window.print()">印刷 / PDF保存</button>
  </div>
  <div class="page">
    <h1 class="title">支払明細書</h1>

    <div class="meta">
      <div class="meta-left">
        <div class="payee-section">
          <div class="label">支払先</div>
          <div class="payee-name">${escapeHtml(p.affiliateEmail)}<span class="payee-suffix">様</span></div>
        </div>
      </div>
      <div class="meta-right">
        <div class="invoice-info">
          <div>No. ${escapeHtml(p.invoiceNumber)}</div>
          <div>発行日: ${p.issueDate}</div>
        </div>
        <div style="margin-top: 16px;">
          <div class="label">支払元</div>
          <div class="payer-name">合同会社TSURATSURA</div>
          <div class="payer-address">〒503-0015<br>岐阜県大垣市林町5-51-3</div>
        </div>
      </div>
    </div>

    <div class="amount-box">
      <div class="amount-label">お支払金額</div>
      <div class="amount-value">${formatYenAmount(p.amount)}</div>
    </div>

    <table>
      <thead>
        <tr>
          <th>摘要</th>
          <th>対象期間</th>
          <th class="text-right">数量</th>
          <th class="text-right">単価</th>
          <th class="text-right">金額</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Pivolinkアフィリエイト報酬</td>
          <td>${p.periodStartFormatted} 〜 ${p.periodEndFormatted}</td>
          <td class="text-right">${p.activeReferrals}人</td>
          <td class="text-right">${formatYenAmount(100)}/人/月</td>
          <td class="text-right">${formatYenAmount(p.amount)}</td>
        </tr>
        <tr class="total-row">
          <td colspan="4" class="text-right">合計金額</td>
          <td class="text-right">${formatYenAmount(p.amount)}</td>
        </tr>
      </tbody>
    </table>

    ${p.bankSection}

    <div class="footer">
      本書は報酬の支払を証明する書類です
    </div>
  </div>
</body>
</html>`
}
