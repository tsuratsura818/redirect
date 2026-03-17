import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'プライバシーポリシー | Pivolink',
  description: 'Pivolink（ピボリンク）のプライバシーポリシーです。',
}

const sections = [
  {
    title: '1. 収集する情報',
    content: `当社は本サービスの提供にあたり、以下の情報を収集します。

【アカウント情報】
・メールアドレス（ログイン・通知用）

【利用情報】
・作成したリダイレクトURL、ルール設定、クッションページ設定

【アクセス解析情報（QR/NFCスキャン時）】
・IPアドレス（地域判定のみに使用、保存しません）
・User-Agent（デバイス・OS・ブラウザの判定）
・アクセス日時
・リファラー

【技術情報】
・Cookie、ブラウザ種別、画面解像度`,
  },
  {
    title: '2. 情報の利用目的',
    content: `収集した情報は以下の目的で利用します。
・本サービスの提供・運営・改善
・アクセス解析機能の提供（デバイス別・地域別の統計表示）
・ユーザーサポート対応
・利用状況の分析、サービス改善
・不正利用の防止
・料金の請求（有料プラン利用時）`,
  },
  {
    title: '3. 第三者への情報提供',
    content: `当社は、以下の場合を除き、ユーザーの個人情報を第三者に提供しません。
・ユーザーの同意がある場合
・法令に基づく場合
・人の生命・身体・財産の保護に必要な場合
・サービス提供に必要な委託先への提供（次項参照）`,
  },
  {
    title: '4. 外部サービスの利用',
    content: `本サービスでは以下の外部サービスを利用しています。各サービスのプライバシーポリシーもご確認ください。

・Supabase（データベース・認証）: https://supabase.com/privacy
・Vercel（ホスティング）: https://vercel.com/legal/privacy-policy
・Stripe（決済処理）: https://stripe.com/jp/privacy
・Google（OAuth認証・利用時）: https://policies.google.com/privacy
・GitHub（OAuth認証・利用時）: https://docs.github.com/en/site-policy/privacy-policies`,
  },
  {
    title: '5. Cookieの使用',
    content: `本サービスでは、認証状態の維持およびサービスの提供に必要なCookieを使用します。ブラウザの設定によりCookieを無効にすることができますが、一部機能が利用できなくなる場合があります。`,
  },
  {
    title: '6. セキュリティ',
    content: `当社はユーザーの情報を適切に保護するため、以下の対策を講じています。
・通信の暗号化（HTTPS/TLS）
・データベースのアクセス制御
・認証情報の安全な管理
ただし、インターネット通信の完全な安全性を保証するものではありません。`,
  },
  {
    title: '7. 個人情報の開示・訂正・削除',
    content: `ユーザーは自身の個人情報について、開示・訂正・削除を請求できます。ダッシュボードから直接変更できる情報はご自身で更新してください。それ以外はお問い合わせフォームよりご連絡ください。アカウントを削除した場合、関連するデータは合理的な期間内に削除されます。`,
  },
  {
    title: '8. 未成年者の利用',
    content: `本サービスは原則として18歳以上を対象としています。18歳未満の方が利用する場合は、保護者の同意を得た上でご利用ください。`,
  },
  {
    title: '9. ポリシーの変更',
    content: `当社は、本プライバシーポリシーを随時変更することがあります。重要な変更がある場合は、本サービス上で通知します。変更後も本サービスの利用を継続した場合、変更後のポリシーに同意したものとみなします。`,
  },
  {
    title: '10. お問い合わせ',
    content: `個人情報の取り扱いに関するお問い合わせは、お問い合わせページよりご連絡ください。`,
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/" className="text-sm text-primary hover:underline">&larr; トップに戻る</Link>
        <h1 className="text-2xl font-bold text-foreground mt-4 mb-2">プライバシーポリシー</h1>
        <p className="text-sm text-muted mb-8">最終更新日: 2026年3月17日</p>

        <div className="space-y-8">
          {sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-base font-bold text-foreground mb-2">{s.title}</h2>
              <p className="text-sm text-foreground/75 leading-relaxed whitespace-pre-line">{s.content}</p>
            </section>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border flex gap-4 text-sm text-muted">
          <Link href="/terms" className="hover:text-foreground transition-colors">利用規約</Link>
          <Link href="/tokusho" className="hover:text-foreground transition-colors">特定商取引法</Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">お問い合わせ</Link>
        </div>
      </div>
    </div>
  )
}
