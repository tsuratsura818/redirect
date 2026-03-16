import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* ヘッダー */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <span className="text-xl font-bold text-foreground">QR Redirect</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-muted hover:text-foreground transition-colors font-medium">
              ログイン
            </Link>
            <Link
              href="/login?tab=signup"
              className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-medium mb-6">
          QRコードの遷移先を自由にコントロール
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
          印刷済みQRコードの<br />
          <span className="text-primary">リダイレクト先</span>を<br />
          いつでも変更
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto mb-10">
          チラシ・名刺・パッケージに印刷したQRコードの遷移先を、管理画面からワンクリックで変更。
          スケジュール配信やA/Bテストも簡単に。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login?tab=signup"
            className="bg-primary text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-blue-200"
          >
            無料アカウントを作成
          </Link>
          <Link
            href="#features"
            className="border-2 border-border text-foreground px-8 py-4 rounded-xl text-lg font-bold hover:bg-white transition-colors"
          >
            機能を見る
          </Link>
        </div>
      </section>

      {/* 仕組み */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-foreground mb-12">3ステップで簡単運用</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '1',
              title: 'QRコードを作成',
              desc: 'スラッグとリダイレクト先URLを登録するだけで、QRコードが自動生成されます。',
              icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              ),
            },
            {
              step: '2',
              title: 'QRコードを配布',
              desc: '生成されたQRコードをチラシ・名刺・パッケージに印刷して配布します。',
              icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              ),
            },
            {
              step: '3',
              title: 'いつでもURL変更',
              desc: 'キャンペーン変更？管理画面でリダイレクト先を変えるだけ。QR再印刷は不要です。',
              icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ),
            },
          ].map(item => (
            <div key={item.step} className="bg-card rounded-2xl p-8 shadow-sm border border-border text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                {item.icon}
              </div>
              <div className="text-sm font-bold text-primary mb-2">STEP {item.step}</div>
              <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
              <p className="text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 機能一覧 */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-foreground mb-4">充実の機能</h2>
        <p className="text-center text-muted mb-12">プロモーションに必要な機能がすべて揃っています</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'QRコード自動生成', desc: 'PNG/SVGでダウンロード。ロゴ埋め込みも可能。' },
            { title: 'アクセス解析', desc: 'スキャン数・デバイス・地域をリアルタイムで可視化。' },
            { title: '変更履歴', desc: 'いつ・誰が・どのURLに変更したか完全ログ。' },
            { title: 'スケジュール切替', desc: '日時指定でリダイレクト先を自動切替。' },
            { title: 'デバイス別振分', desc: 'iOS/Android/PCで異なるURLへ振り分け。' },
            { title: 'A/Bテスト', desc: 'トラフィックを分割して効果を比較。' },
            { title: 'クッションページ', desc: 'リダイレクト前にお知らせやクーポンを表示。' },
            { title: '有効期限設定', desc: '期限切れ時は指定ページにフォールバック。' },
            { title: '一括管理', desc: '複数QRコードをダッシュボードで統合管理。' },
          ].map(f => (
            <div key={f.title} className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* フッター */}
      <footer className="border-t border-border bg-white py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-muted">
          &copy; 2026 QR Redirect Manager. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
