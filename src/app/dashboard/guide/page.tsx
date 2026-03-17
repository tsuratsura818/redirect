import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '使い方ガイド | Pivolink',
}

const sections = [
  {
    id: 'getting-started',
    title: 'はじめに',
    icon: '1',
    content: [
      {
        subtitle: 'Pivolinkとは？',
        text: 'Pivolinkは、QRコードやNFCタグのリダイレクト先を管理画面から自由に変更できるサービスです。一度印刷したQRコードや設置したNFCタグを、再印刷・再設置なしで遷移先を切り替えられます。',
      },
      {
        subtitle: '基本的な使い方',
        text: '1. リダイレクトURLを作成する\n2. QRコードをダウンロード、またはNFCタグにURLを書き込む\n3. 遷移先を変更したくなったら、管理画面からURLを更新するだけ',
      },
    ],
  },
  {
    id: 'create-redirect',
    title: 'リダイレクトの作成',
    icon: '2',
    content: [
      {
        subtitle: '新規作成の手順',
        text: '1. サイドバーの「QR / NFC 管理」→ 右上の「新規作成」をクリック\n2. 名前を入力（管理用の名前、ユーザーには見えません）\n3. デフォルトURLを入力（最初の遷移先）\n4. 「作成」をクリック',
      },
      {
        subtitle: 'QRコードのダウンロード',
        text: '作成後の詳細画面で「PNG」または「SVG」ボタンからダウンロードできます。PNGは印刷物やSNS向け、SVGはデザインツールでの編集に適しています。',
      },
      {
        subtitle: 'NFCタグへの書き込み',
        text: '詳細画面に表示される「リダイレクトURL」をNFCタグに書き込んでください。市販のNTAG213/215/216対応タグとNFCライターアプリ（iOS: NFC Tools、Android: NFC TagWriter）で書き込めます。',
      },
    ],
  },
  {
    id: 'manage-url',
    title: 'URLの変更・管理',
    icon: '3',
    content: [
      {
        subtitle: '遷移先URLの変更',
        text: '「QR / NFC 管理」→ 対象を選択 →「概要」タブでデフォルトURLを書き換えて「変更を保存」。変更は即座に反映されます。QRコードやNFCタグの再作成は不要です。',
      },
      {
        subtitle: '有効期限の設定',
        text: '概要タブの「有効期限」に日付を設定すると、期限切れ後は「期限切れ時URL」またはデフォルトのエラーページにリダイレクトされます。期間限定キャンペーンに便利です。',
      },
      {
        subtitle: '変更履歴',
        text: '「変更履歴」タブで、いつ・どの項目が変更されたかを確認できます。誰がいつ変更したかの完全なログが残ります。',
      },
    ],
  },
  {
    id: 'rules',
    title: 'ルール機能（Proプラン以上）',
    icon: '4',
    content: [
      {
        subtitle: 'スケジュール切替',
        text: '指定した日時にリダイレクト先を自動で切り替えます。例：キャンペーンページを期間中だけ表示し、終了後は通常ページに戻す。',
      },
      {
        subtitle: 'デバイス別振分',
        text: 'iOS / Android / デスクトップで異なるURLに振り分けます。例：iOSユーザーはApp Store、AndroidユーザーはGoogle Playへ誘導。',
      },
      {
        subtitle: 'A/Bテスト',
        text: 'トラフィックを任意の比率で分割し、2つのURLの効果を比較できます。例：新デザインのLPと旧デザインの比較。',
      },
      {
        subtitle: 'ルールの優先度',
        text: '複数のルールを設定した場合、優先度の数値が大きいルールから評価されます。マッチするルールがなければデフォルトURLにリダイレクトされます。',
      },
    ],
  },
  {
    id: 'cushion',
    title: 'クッションページ（Proプラン以上）',
    icon: '5',
    content: [
      {
        subtitle: 'クッションページとは',
        text: 'リダイレクト前にワンクッション挟むページです。お知らせ、クーポンコード、注意事項などを表示してからリダイレクトできます。',
      },
      {
        subtitle: '設定方法',
        text: '詳細画面の「クッションページ」タブで、有効/無効の切替、タイトル・メッセージ・ボタンテキスト・配色・表示秒数をカスタマイズできます。右側にリアルタイムプレビューが表示されます。',
      },
    ],
  },
  {
    id: 'analytics',
    title: 'アクセス解析',
    icon: '6',
    content: [
      {
        subtitle: '確認できる情報',
        text: '「アナリティクス」タブで以下の情報を確認できます：\n・日別アクセス数グラフ\n・デバイス別（iOS/Android/PC）の比率\n・OS・ブラウザの内訳\n・総アクセス数',
      },
      {
        subtitle: 'データの活用',
        text: 'どの時間帯にアクセスが多いか、モバイルとPCの比率はどうかなどを分析し、遷移先やキャンペーンの最適化に活用できます。',
      },
    ],
  },
  {
    id: 'use-cases',
    title: '活用例',
    icon: '7',
    content: [
      {
        subtitle: '飲食店のメニュー',
        text: 'テーブルのQRコードから季節メニューやキャンペーンページに誘導。メニュー変更時もQRコードの再印刷不要。',
      },
      {
        subtitle: '名刺・パンフレット',
        text: '名刺のQRコードを最新のポートフォリオやSNSに常にリンク。転職やサイトリニューアル時もそのまま使える。',
      },
      {
        subtitle: 'イベント・展示会',
        text: '事前は告知ページ → 当日はライブ配信URL → 終了後はアーカイブページへ自動切替。スケジュール機能で全自動化。',
      },
      {
        subtitle: '商品パッケージ',
        text: '商品に貼付したNFCタグの遷移先を、プロモーション内容に応じて柔軟に変更。',
      },
    ],
  },
]

export default function GuidePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">使い方ガイド</h1>
        <p className="text-muted text-sm mt-1">Pivolinkの機能と使い方をステップごとに解説します</p>
      </div>

      {/* 目次 */}
      <nav className="bg-card rounded-xl border border-border p-4 sm:p-5 mb-8">
        <h2 className="font-bold text-foreground text-sm mb-3">目次</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {sections.map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground/70 hover:bg-gray-50 hover:text-foreground transition-colors"
            >
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                {s.icon}
              </span>
              {s.title}
            </a>
          ))}
        </div>
      </nav>

      {/* セクション */}
      <div className="space-y-8">
        {sections.map(s => (
          <section key={s.id} id={s.id} className="bg-card rounded-xl border border-border p-4 sm:p-6 scroll-mt-20">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-8 h-8 rounded-full gradient-bg text-white text-sm font-bold flex items-center justify-center shrink-0">
                {s.icon}
              </span>
              <h2 className="text-lg font-bold text-foreground">{s.title}</h2>
            </div>
            <div className="space-y-5">
              {s.content.map((c, i) => (
                <div key={i}>
                  <h3 className="font-medium text-foreground text-sm mb-1.5">{c.subtitle}</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed whitespace-pre-line">{c.text}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
