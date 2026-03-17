import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記 | Pivolink',
  description: 'Pivolink（ピボリンク）の特定商取引法に基づく表記です。',
}

const rows = [
  { label: '販売業者', value: '【運営者名を記載】' },
  { label: '運営統括責任者', value: '【責任者名を記載】' },
  { label: '所在地', value: '【所在地を記載】' },
  { label: '電話番号', value: '【電話番号を記載】（お問い合わせはフォームよりお願いします）' },
  { label: 'メールアドレス', value: '【メールアドレスを記載】' },
  { label: 'サービスURL', value: 'https://redirect.tsuratsura.com' },
  { label: '販売価格', value: 'Free: ¥0 / Pro: ¥780（税込）/月（通常¥980、Beta期間20%OFF） / Business: ¥3,980（税込）/月（通常¥4,980、Beta期間20%OFF）' },
  { label: '支払方法', value: 'クレジットカード（Stripe経由）' },
  { label: '支払時期', value: '申込時に初回決済、以降毎月自動課金' },
  { label: 'サービス提供時期', value: '決済完了後、即時利用可能' },
  { label: 'キャンセル・解約', value: 'ダッシュボードのプラン管理画面よりいつでも解約可能。解約後は当月末までご利用いただけます。' },
  { label: '返金ポリシー', value: 'デジタルサービスの特性上、お支払い済みの料金の返金は原則いたしかねます。ただし、サービスの重大な不具合等により利用できなかった場合は個別に対応いたします。' },
  { label: '動作環境', value: 'モダンブラウザ（Chrome, Firefox, Safari, Edge 最新版）' },
]

export default function TokushoPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/" className="text-sm text-primary hover:underline">&larr; トップに戻る</Link>
        <h1 className="text-2xl font-bold text-foreground mt-4 mb-2">特定商取引法に基づく表記</h1>
        <p className="text-sm text-muted mb-8">最終更新日: 2026年3月17日</p>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {rows.map((r, i) => (
            <div
              key={i}
              className={`flex flex-col sm:flex-row text-sm ${i !== rows.length - 1 ? 'border-b border-border' : ''}`}
            >
              <div className="sm:w-44 shrink-0 px-4 sm:px-5 py-3 bg-gray-50 font-medium text-foreground">
                {r.label}
              </div>
              <div className="px-4 sm:px-5 py-3 text-foreground/75 leading-relaxed">
                {r.value}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted mt-4">
          ※【】内の項目は運営者情報を確定後に更新されます。
        </p>

        <div className="mt-12 pt-6 border-t border-border flex gap-4 text-sm text-muted">
          <Link href="/terms" className="hover:text-foreground transition-colors">利用規約</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">プライバシーポリシー</Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">お問い合わせ</Link>
        </div>
      </div>
    </div>
  )
}
