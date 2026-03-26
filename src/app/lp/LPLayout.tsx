'use client'

import Link from 'next/link'
import Logo from '@/components/Logo'
import ScrollReveal from '@/components/ScrollReveal'

interface Step {
  icon: string
  before: string
  after: string
}

interface Feature {
  icon: string
  title: string
  desc: string
}

interface ROI {
  label: string
  before: string
  after: string
  saving: string
}

interface LPLayoutProps {
  // ヘッダー
  industry: string
  tagline: string
  headline: string
  subheadline: string
  heroColor: string // tailwind gradient class
  // ストーリー
  painTitle: string
  painPoints: string[]
  // Before / After
  steps: Step[]
  // 活用シナリオ
  scenarios: { title: string; desc: string; icon: string }[]
  // 機能ハイライト
  features: Feature[]
  // ROI
  roi: ROI[]
  roiSummary: string
  // CTA
  ctaText: string
}

export default function LPLayout({
  industry,
  tagline,
  headline,
  subheadline,
  heroColor,
  painTitle,
  painPoints,
  steps,
  scenarios,
  features,
  roi,
  roiSummary,
  ctaText,
}: LPLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted hidden sm:block">{industry}向け</span>
            <Link
              href="/login"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className={`pt-24 pb-16 ${heroColor}`}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ScrollReveal>
            <span className="inline-block px-3 py-1 text-xs font-medium bg-white/20 text-white rounded-full mb-4">
              {tagline}
            </span>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              {headline}
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              {subheadline}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={300}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/login"
                className="px-8 py-3 bg-white text-blue-700 font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
              >
                無料で試す（カード不要）
              </Link>
              <Link
                href="/#cases"
                className="px-8 py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors border border-white/30"
              >
                他の業種の事例も見る
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 課題提起 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-center mb-2">{painTitle}</h2>
            <p className="text-center text-muted text-sm mb-10">こんなお悩みはありませんか？</p>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 gap-4">
            {painPoints.map((pain, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="flex items-start gap-3 bg-white p-4 rounded-lg border border-red-100">
                  <span className="text-red-400 text-lg shrink-0 mt-0.5">&#10007;</span>
                  <p className="text-sm text-gray-700">{pain}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Before / After */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-center mb-2">Pivolinkで解決</h2>
            <p className="text-center text-muted text-sm mb-10">導入前と導入後でこれだけ変わります</p>
          </ScrollReveal>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="grid sm:grid-cols-[1fr,auto,1fr] items-center">
                    <div className="p-5 bg-red-50">
                      <div className="text-xs font-medium text-red-500 mb-1">Before</div>
                      <div className="flex items-start gap-2">
                        <span className="text-xl">{step.icon}</span>
                        <p className="text-sm text-gray-700">{step.before}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center py-2 sm:py-0 sm:px-4">
                      <svg className="w-6 h-6 text-blue-500 rotate-90 sm:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                    <div className="p-5 bg-green-50">
                      <div className="text-xs font-medium text-green-600 mb-1">After（Pivolink）</div>
                      <div className="flex items-start gap-2">
                        <span className="text-xl">{step.icon}</span>
                        <p className="text-sm text-gray-700">{step.after}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 具体的な活用シナリオ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-center mb-2">具体的な活用シナリオ</h2>
            <p className="text-center text-muted text-sm mb-10">「うちでもこう使える」がすぐイメージできます</p>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {scenarios.map((s, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="bg-white rounded-xl p-5 border border-gray-200 h-full">
                  <div className="text-3xl mb-3">{s.icon}</div>
                  <h3 className="font-bold text-sm mb-2">{s.title}</h3>
                  <p className="text-xs text-muted leading-relaxed">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 使う機能 */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-center mb-2">{industry}で活きる機能</h2>
            <p className="text-center text-muted text-sm mb-10">必要な機能が揃っています</p>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <ScrollReveal key={i} delay={i * 60}>
                <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                  <span className="text-2xl">{f.icon}</span>
                  <div>
                    <h3 className="font-bold text-sm">{f.title}</h3>
                    <p className="text-xs text-muted mt-1">{f.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ROI */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-center mb-2">コスト効果シミュレーション</h2>
            <p className="text-center text-muted text-sm mb-10">具体的な数字で見る導入効果</p>
          </ScrollReveal>
          <div className="bg-white rounded-xl border border-blue-200 overflow-hidden">
            <div className="grid grid-cols-4 gap-0 text-xs font-medium text-center bg-blue-600 text-white">
              <div className="p-3">項目</div>
              <div className="p-3">導入前</div>
              <div className="p-3">導入後</div>
              <div className="p-3">削減効果</div>
            </div>
            {roi.map((r, i) => (
              <div key={i} className={`grid grid-cols-4 gap-0 text-sm text-center ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <div className="p-3 font-medium text-left">{r.label}</div>
                <div className="p-3 text-red-600">{r.before}</div>
                <div className="p-3 text-green-600">{r.after}</div>
                <div className="p-3 font-bold text-blue-600">{r.saving}</div>
              </div>
            ))}
          </div>
          <ScrollReveal delay={200}>
            <div className="mt-4 text-center">
              <span className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg">
                {roiSummary}
              </span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 導入ステップ */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-center mb-10">導入は3ステップ</h2>
          </ScrollReveal>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { num: '1', title: 'アカウント作成', desc: 'メールアドレスだけで登録。カード不要。1分で完了。', icon: '📝' },
              { num: '2', title: 'リンク発行 & QR印刷', desc: 'スラッグを決めてリンク発行。QRコードは自動生成。そのまま印刷。', icon: '🔲' },
              { num: '3', title: '管理画面でURL変更', desc: 'キャンペーンや季節が変わったら、管理画面でリンク先を変えるだけ。', icon: '🖥️' },
            ].map((s, i) => (
              <ScrollReveal key={i} delay={i * 120}>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold text-blue-600">
                    {s.num}
                  </div>
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <h3 className="font-bold text-sm mb-1">{s.title}</h3>
                  <p className="text-xs text-muted">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={`py-16 ${heroColor}`}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{ctaText}</h2>
            <p className="text-white/80 mb-8">
              Freeプラン: 3リンクまで無料 / カード登録不要 / 今すぐ開始
            </p>
          </ScrollReveal>
          <ScrollReveal delay={150}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/login"
                className="px-8 py-3 bg-white text-blue-700 font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-lg text-lg"
              >
                無料アカウントを作成
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors border border-white/30"
              >
                お問い合わせ
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* フッター */}
      <footer className="py-8 bg-gray-900 text-gray-400 text-xs text-center">
        <div className="max-w-4xl mx-auto px-4">
          <Logo size="sm" />
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <Link href="/" className="hover:text-white transition-colors">トップ</Link>
            <Link href="/lp/restaurant" className="hover:text-white transition-colors">飲食店向け</Link>
            <Link href="/lp/realestate" className="hover:text-white transition-colors">不動産向け</Link>
            <Link href="/lp/ec" className="hover:text-white transition-colors">EC向け</Link>
            <Link href="/lp/event" className="hover:text-white transition-colors">イベント向け</Link>
            <Link href="/terms" className="hover:text-white transition-colors">利用規約</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">プライバシー</Link>
            <Link href="/contact" className="hover:text-white transition-colors">お問い合わせ</Link>
          </div>
          <p className="mt-4">&copy; 2026 Pivolink by TSURATSURA Inc.</p>
        </div>
      </footer>
    </div>
  )
}
