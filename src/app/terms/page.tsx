import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '利用規約 | Pivolink',
  description: 'Pivolink（ピボリンク）の利用規約です。',
}

const sections = [
  {
    title: '第1条（適用）',
    content: `この利用規約（以下「本規約」）は、Pivolink運営（以下「当社」）が提供するQRコード・NFCタグリダイレクト管理サービス「Pivolink」（以下「本サービス」）の利用に関する条件を定めるものです。ユーザーは本規約に同意の上、本サービスを利用するものとします。`,
  },
  {
    title: '第2条（定義）',
    content: `本規約において使用する用語の定義は以下の通りです。
・「ユーザー」とは、本サービスに登録し利用する個人または法人を指します。
・「リダイレクトURL」とは、QRコードまたはNFCタグからアクセスされた際の転送先URLを指します。
・「コンテンツ」とは、ユーザーが本サービスを通じて設定・登録した情報を指します。`,
  },
  {
    title: '第3条（アカウント登録）',
    content: `1. ユーザーは正確かつ最新の情報を提供し、アカウント登録を行うものとします。
2. ユーザーは自身のアカウント情報を適切に管理する責任を負います。
3. アカウントの不正利用により生じた損害について、当社は一切の責任を負いません。`,
  },
  {
    title: '第4条（禁止事項）',
    content: `ユーザーは以下の行為を行ってはなりません。
・法令または公序良俗に違反する行為
・犯罪行為に関連する行為
・フィッシング、マルウェア配布等のリダイレクト先への誘導
・当社または第三者の知的財産権を侵害する行為
・サービスのインフラに過度の負荷をかける行為
・不正アクセスまたはそれを試みる行為
・他のユーザーの利用を妨害する行為
・その他、当社が不適切と判断する行為`,
  },
  {
    title: '第5条（サービスの提供・変更・停止）',
    content: `1. 当社は、本サービスの内容を予告なく変更・追加・廃止することがあります。
2. 以下の場合、事前の通知なくサービスを一時停止することがあります。
  ・システムの保守・更新を行う場合
  ・天災、停電等の不可抗力が発生した場合
  ・その他、運営上やむを得ない場合
3. サービスの変更・停止により生じた損害について、当社は一切の責任を負いません。`,
  },
  {
    title: '第6条（有料プラン）',
    content: `1. 有料プランの料金は、本サービスの料金ページに定める通りとします。
2. 有料プランの支払いはクレジットカードによる月額自動課金とします。
3. 支払済みの料金は、法令に定める場合を除き、返金いたしません。
4. 当社は料金を変更する場合、事前にユーザーに通知します。`,
  },
  {
    title: '第7条（知的財産権）',
    content: `1. 本サービスに関する知的財産権は当社に帰属します。
2. ユーザーが本サービスを通じて設定したコンテンツの権利はユーザーに帰属します。
3. 当社はサービス提供の目的に限り、ユーザーのコンテンツを利用できるものとします。`,
  },
  {
    title: '第8条（免責事項）',
    content: `1. 当社は、本サービスの完全性・正確性・有用性等について保証しません。
2. リダイレクト先のコンテンツについて、当社は一切の責任を負いません。
3. ユーザー間またはユーザーと第三者間のトラブルについて、当社は関与しません。
4. 本サービスはベータ版として提供される場合があり、予期しない不具合が生じる可能性があります。`,
  },
  {
    title: '第9条（利用規約の変更）',
    content: `1. 当社は本規約を随時変更できるものとします。
2. 変更後の規約は、本サービス上に掲示した時点で効力を生じます。
3. 変更後も本サービスの利用を継続した場合、変更後の規約に同意したものとみなします。`,
  },
  {
    title: '第10条（準拠法・管轄）',
    content: `本規約の解釈は日本法に準拠するものとし、本サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。`,
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/" className="text-sm text-primary hover:underline">&larr; トップに戻る</Link>
        <h1 className="text-2xl font-bold text-foreground mt-4 mb-2">利用規約</h1>
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
          <Link href="/privacy" className="hover:text-foreground transition-colors">プライバシーポリシー</Link>
          <Link href="/tokusho" className="hover:text-foreground transition-colors">特定商取引法</Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">お問い合わせ</Link>
        </div>
      </div>
    </div>
  )
}
