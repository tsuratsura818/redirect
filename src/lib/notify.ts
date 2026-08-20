import { SITE_URL } from '@/lib/site'

const NOTIFY_TO = 'nishikawa@tsuratsura.com'

/**
 * 差出人は Resend で検証済みのドメインでないと 403 で弾かれる。
 * 検証済みは apex の tsuratsura.com のみ。サブドメインは使えない。
 */
const NOTIFY_FROM = 'Pivolink <notifications@tsuratsura.com>'

export interface AdminNotice {
  /** メールの件名（【Pivolink】は自動で付く） */
  subject: string
  /** 見出し（絵文字込みでよい） */
  heading: string
  /** 明細行。ラベルと値の組 */
  rows: { label: string; value: string }[]
  /** 管理画面などへの導線。省略時はダッシュボードへ */
  linkPath?: string
  linkLabel?: string
}

/**
 * 管理者（西川さん）への通知メール。
 *
 * **必ず結果を返す。**呼び出し側で握り潰すと、届いていないことに誰も気付かない。
 * 実際 signup 通知は差出人ドメイン未検証のまま約3ヶ月無言で落ち続けていた。
 */
export async function notifyAdmin(notice: AdminNotice): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[notify] RESEND_API_KEY が未設定のため送信をスキップしました:', notice.subject)
    return { ok: false, error: 'RESEND_API_KEY missing' }
  }

  const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
  const linkPath = notice.linkPath ?? '/dashboard/admin'
  const linkLabel = notice.linkLabel ?? '管理画面を開く'

  const rowsHtml = notice.rows
    .map(
      (r, i) => `
          <tr>
            <td style="padding:12px 0;${i < notice.rows.length - 1 ? 'border-bottom:1px solid #e2e8f0;' : ''}font-size:13px;color:#64748b;width:120px;vertical-align:top;">${escapeHtml(r.label)}</td>
            <td style="padding:12px 0;${i < notice.rows.length - 1 ? 'border-bottom:1px solid #e2e8f0;' : ''}font-size:14px;font-weight:600;color:#0f172a;white-space:pre-wrap;">${escapeHtml(r.value)}</td>
          </tr>`
    )
    .join('')

  const html = `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:520px;margin:0 auto;background:#f8fafc;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:32px 32px 24px;">
        <div style="margin-bottom:20px;">
          <span style="font-size:18px;font-weight:800;letter-spacing:0.04em;color:#fff;">
            PIVO<span style="color:#10b981;">LINK</span>
          </span>
        </div>
        <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.01em;">${escapeHtml(notice.heading)}</h1>
        <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.5);">${now}</p>
      </div>
      <div style="padding:28px 32px;">
        <table style="width:100%;border-collapse:collapse;">${rowsHtml}
        </table>
        <div style="margin-top:24px;padding:16px 20px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;">
          <p style="margin:0;font-size:13px;color:#166534;line-height:1.6;">
            <a href="${SITE_URL}${linkPath}" style="color:#10b981;font-weight:700;">${escapeHtml(linkLabel)}</a>
          </p>
        </div>
      </div>
      <div style="padding:16px 32px;background:#f1f5f9;font-size:11px;color:#94a3b8;text-align:center;">
        Pivolink 自動通知
      </div>
    </div>
  `

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: NOTIFY_FROM,
        to: [NOTIFY_TO],
        subject: `【Pivolink】${notice.subject}`,
        html,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      console.error('[notify] Resend error:', error)
      return { ok: false, error }
    }
    return { ok: true }
  } catch (e) {
    const error = e instanceof Error ? e.message : 'unknown'
    console.error('[notify] fetch error:', error)
    return { ok: false, error }
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
