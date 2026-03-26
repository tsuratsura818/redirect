import type { Metadata } from 'next'
import Link from 'next/link'
import Logo from '@/components/Logo'

export const metadata: Metadata = {
  title: '業種別活用ガイド — Pivolink',
  description: '飲食店・不動産・EC・イベント…業種別のQRコード・NFCタグ活用事例。Pivolinkで印刷済みQRコードのリンク先を自由に変更。',
}

const industries = [
  {
    href: '/lp/restaurant',
    icon: '🍽️',
    title: '飲食店',
    desc: 'テーブルQRの季節メニュー自動切替、レビュー誘導A/Bテスト、多店舗一括管理',
    color: 'from-orange-500 to-red-600',
    saving: '年間約55,000円削減',
  },
  {
    href: '/lp/realestate',
    icon: '🏠',
    title: '不動産',
    desc: '成約済み物件チラシの再活用、看板QRの更新、エリア別チラシ効果測定',
    color: 'from-teal-500 to-emerald-700',
    saving: '年間約385,000円削減',
  },
  {
    href: '/lp/ec',
    icon: '📦',
    title: 'EC・通販',
    desc: '同梱QRのA/Bテスト、パッケージQRのサイト移行追従、季節キャンペーン自動切替',
    color: 'from-violet-500 to-purple-700',
    saving: '年間約530,000円削減',
  },
  {
    href: '/lp/event',
    icon: '🎪',
    title: 'イベント・展示会',
    desc: 'QRで開催前→当日→終了後を繋ぐ、ポスター再利用、告知経路別効果測定',
    color: 'from-pink-500 to-rose-600',
    saving: '年間約260,000円削減',
  },
]

export default function LPIndexPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            無料で始める
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            あなたの業種で、QRコードはこう使える。
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Pivolinkの活用方法は業種によって異なります。<br />
            具体的なシナリオ・コスト削減効果を業種別にご紹介します。
          </p>
        </div>
      </section>

      {/* 業種カード */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 gap-6">
            {industries.map(ind => (
              <Link
                key={ind.href}
                href={ind.href}
                className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className={`bg-gradient-to-r ${ind.color} p-5 flex items-center gap-4`}>
                  <span className="text-4xl">{ind.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold text-white">{ind.title}</h2>
                    <span className="text-xs text-white/70 bg-white/20 px-2 py-0.5 rounded-full">{ind.saving}</span>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-600 mb-3">{ind.desc}</p>
                  <span className="text-sm text-blue-600 font-medium group-hover:underline">
                    詳しく見る →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 共通CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">まずは無料で試してみませんか？</h2>
          <p className="text-muted text-sm mb-6">
            Freeプラン: QRコード3件まで無料 / カード登録不要 / 1分で開始
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              無料アカウントを作成
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors border border-gray-300"
            >
              お問い合わせ
            </Link>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="py-8 bg-gray-900 text-gray-400 text-xs text-center">
        <div className="max-w-4xl mx-auto px-4">
          <Logo size="sm" />
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <Link href="/" className="hover:text-white transition-colors">トップ</Link>
            {industries.map(ind => (
              <Link key={ind.href} href={ind.href} className="hover:text-white transition-colors">{ind.title}向け</Link>
            ))}
            <Link href="/terms" className="hover:text-white transition-colors">利用規約</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">プライバシー</Link>
          </div>
          <p className="mt-4">&copy; 2026 Pivolink by TSURATSURA Inc.</p>
        </div>
      </footer>
    </div>
  )
}
