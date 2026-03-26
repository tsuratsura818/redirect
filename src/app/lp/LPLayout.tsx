'use client'

import Link from 'next/link'
import Logo from '@/components/Logo'
import ScrollReveal from '@/components/ScrollReveal'
import { DashboardMockup, FlowDiagram, BeforeIllust, AfterIllust, TrustBadges } from './LPIllustrations'

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
  industry: string
  tagline: string
  headline: string
  subheadline: string
  heroColor: string
  accentColor: string  // 'blue' | 'orange' | 'teal' | 'violet' | 'pink'
  painTitle: string
  painPoints: string[]
  steps: Step[]
  scenarios: { title: string; desc: string; icon: string }[]
  features: Feature[]
  roi: ROI[]
  roiSummary: string
  ctaText: string
}

// アイコンマッピング（絵文字→SVG）
function FeatureIcon({ icon, className = 'w-10 h-10' }: { icon: string; className?: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    '⏰': <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth={1.5} /><path strokeLinecap="round" strokeWidth={2} d="M12 6v6l4 2" /></svg>,
    '🔲': <svg className={className} viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="8" height="8" rx="1" /><rect x="14" y="2" width="8" height="8" rx="1" /><rect x="2" y="14" width="8" height="8" rx="1" /><rect x="14" y="14" width="4" height="4" rx="0.5" /><rect x="20" y="14" width="2" height="2" rx="0.3" /><rect x="14" y="20" width="2" height="2" rx="0.3" /><rect x="18" y="18" width="4" height="4" rx="0.5" /></svg>,
    '📊': <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={1.5} d="M3 3v18h18" /><rect x="7" y="10" width="3" height="8" rx="0.5" fill="currentColor" opacity="0.3" /><rect x="13" y="6" width="3" height="12" rx="0.5" fill="currentColor" opacity="0.5" /><rect x="19" y="3" width="3" height="15" rx="0.5" fill="currentColor" opacity="0.7" /></svg>,
    '⚡': <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    '🖥️': <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="2" y="3" width="20" height="14" rx="2" strokeWidth={1.5} /><path strokeLinecap="round" strokeWidth={1.5} d="M8 21h8M12 17v4" /></svg>,
    '🎫': <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>,
    '📋': <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    '📅': <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={1.5} /><path strokeWidth={1.5} d="M16 2v4M8 2v4M3 10h18" /></svg>,
    '🔄': <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  }
  return iconMap[icon] ?? <span className="text-2xl">{icon}</span>
}

export default function LPLayout({
  industry,
  tagline,
  headline,
  subheadline,
  heroColor,
  accentColor,
  painTitle,
  painPoints,
  steps,
  scenarios,
  features,
  roi,
  roiSummary,
  ctaText,
}: LPLayoutProps) {
  // accentColorに基づくユーティリティ
  const accent = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', ring: 'ring-blue-400', iconBg: 'bg-blue-100', btnBg: 'bg-blue-600 hover:bg-blue-700' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', ring: 'ring-orange-400', iconBg: 'bg-orange-100', btnBg: 'bg-orange-600 hover:bg-orange-700' },
    teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-600', ring: 'ring-teal-400', iconBg: 'bg-teal-100', btnBg: 'bg-teal-600 hover:bg-teal-700' },
    violet: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-600', ring: 'ring-violet-400', iconBg: 'bg-violet-100', btnBg: 'bg-violet-600 hover:bg-violet-700' },
    pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-600', ring: 'ring-pink-400', iconBg: 'bg-pink-100', btnBg: 'bg-pink-600 hover:bg-pink-700' },
  }[accentColor] ?? { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', ring: 'ring-blue-400', iconBg: 'bg-blue-100', btnBg: 'bg-blue-600 hover:bg-blue-700' }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ===== ヘッダー ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="shrink-0">
            <Logo size="sm" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/lp" className="text-xs text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
              他の業種を見る
            </Link>
            <Link
              href="/login"
              className={`px-5 py-2.5 text-sm font-semibold text-white rounded-full ${accent.btnBg} transition-colors shadow-sm`}
            >
              無料で始める
            </Link>
          </div>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className={`relative pt-28 pb-20 sm:pt-32 sm:pb-24 ${heroColor} overflow-hidden`}>
        {/* 背景装飾 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-black/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-[1fr,auto] gap-10 lg:gap-16 items-center">
            {/* テキスト */}
            <div className="text-center lg:text-left">
              <ScrollReveal>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/15 text-white rounded-full mb-5 backdrop-blur-sm border border-white/10">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  {tagline}
                </span>
              </ScrollReveal>
              <ScrollReveal delay={80}>
                <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-[1.2] mb-5 tracking-tight whitespace-pre-line">
                  {headline}
                </h1>
              </ScrollReveal>
              <ScrollReveal delay={160}>
                <p className="text-base sm:text-lg text-white/75 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                  {subheadline}
                </p>
              </ScrollReveal>
              <ScrollReveal delay={240}>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-50 transition-all shadow-xl shadow-black/10 text-base"
                  >
                    無料で試す
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-7 py-3.5 bg-white/10 text-white font-semibold rounded-full hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-sm"
                  >
                    お問い合わせ
                  </Link>
                </div>
                <p className="text-[11px] text-white/50 mt-3 text-center lg:text-left">
                  クレジットカード不要 / 3リンクまで永久無料
                </p>
              </ScrollReveal>
            </div>
            {/* モックアップ */}
            <ScrollReveal delay={300} animation="scale-in">
              <div className="hidden lg:block w-[340px]">
                <DashboardMockup />
              </div>
            </ScrollReveal>
          </div>
          {/* フロー図 */}
          <ScrollReveal delay={400}>
            <div className="mt-12 pt-8 border-t border-white/10">
              <FlowDiagram />
            </div>
          </ScrollReveal>
          {/* 信頼バッジ */}
          <ScrollReveal delay={500}>
            <TrustBadges className="mt-8" />
          </ScrollReveal>
        </div>
      </section>

      {/* ===== 課題提起 ===== */}
      <section className="py-20 sm:py-24 bg-gray-50/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className={`inline-block text-xs font-semibold ${accent.text} ${accent.bg} px-3 py-1 rounded-full mb-3`}>
                PROBLEM
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{painTitle}</h2>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {painPoints.map((pain, i) => (
              <ScrollReveal key={i} delay={i * 60}>
                <div className="flex items-start gap-3 bg-white p-4 sm:p-5 rounded-xl border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{pain}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Before / After ===== */}
      <section className="py-20 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className={`inline-block text-xs font-semibold ${accent.text} ${accent.bg} px-3 py-1 rounded-full mb-3`}>
                SOLUTION
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Pivolinkで、こう変わる</h2>
            </div>
          </ScrollReveal>
          <div className="space-y-5">
            {steps.map((step, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="grid md:grid-cols-[1fr,64px,1fr] items-stretch">
                    {/* Before */}
                    <div className="p-5 sm:p-6 bg-red-50/60 relative">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold uppercase rounded tracking-wider">Before</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <BeforeIllust className="w-20 h-14 shrink-0 hidden sm:block" />
                        <p className="text-sm text-gray-700 leading-relaxed">{step.before}</p>
                      </div>
                    </div>
                    {/* 矢印 */}
                    <div className="flex items-center justify-center bg-gradient-to-r md:bg-gradient-to-b from-red-50/60 to-green-50/60 py-3 md:py-0">
                      <div className={`w-10 h-10 ${accent.btnBg} rounded-full flex items-center justify-center shadow-lg`}>
                        <svg className="w-5 h-5 text-white rotate-90 md:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                    {/* After */}
                    <div className="p-5 sm:p-6 bg-green-50/60">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded tracking-wider">After</span>
                        <span className="text-[10px] text-green-600 font-medium">Pivolink</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <AfterIllust className="w-20 h-14 shrink-0 hidden sm:block" />
                        <p className="text-sm text-gray-700 leading-relaxed">{step.after}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 活用シナリオ ===== */}
      <section className={`py-20 sm:py-24 ${accent.bg}/30`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className={`inline-block text-xs font-semibold ${accent.text} ${accent.bg} px-3 py-1 rounded-full mb-3`}>
                USE CASES
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">具体的な活用シナリオ</h2>
              <p className="text-sm text-gray-500 mt-2">「うちでもこう使える」がすぐイメージできます</p>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {scenarios.map((s, i) => (
              <ScrollReveal key={i} delay={i * 60}>
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all h-full group">
                  <div className={`w-12 h-12 ${accent.iconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <span className="text-2xl">{s.icon}</span>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base mb-2 leading-snug">{s.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 機能ハイライト ===== */}
      <section className="py-20 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className={`inline-block text-xs font-semibold ${accent.text} ${accent.bg} px-3 py-1 rounded-full mb-3`}>
                FEATURES
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{industry}で活きる機能</h2>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {features.map((f, i) => (
              <ScrollReveal key={i} delay={i * 50}>
                <div className="flex items-start gap-4 p-5 rounded-xl bg-gray-50/80 border border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-md transition-all group">
                  <div className={`w-11 h-11 ${accent.iconBg} rounded-xl flex items-center justify-center shrink-0 ${accent.text} group-hover:scale-110 transition-transform`}>
                    <FeatureIcon icon={f.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-1">{f.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ROI ===== */}
      <section className={`py-20 sm:py-24 ${accent.bg}/40`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className={`inline-block text-xs font-semibold ${accent.text} ${accent.bg} px-3 py-1 rounded-full mb-3`}>
                ROI
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">コスト効果シミュレーション</h2>
            </div>
          </ScrollReveal>
          {/* モバイル: カード形式 / デスクトップ: テーブル */}
          <div className="hidden sm:block">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className={`grid grid-cols-4 gap-0 text-xs font-bold text-center text-white ${accent.btnBg.split(' ')[0]}`}>
                <div className="p-4 text-left">項目</div>
                <div className="p-4">導入前</div>
                <div className="p-4">導入後</div>
                <div className="p-4">削減効果</div>
              </div>
              {roi.map((r, i) => (
                <div key={i} className={`grid grid-cols-4 gap-0 text-sm text-center border-t border-gray-100 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                  <div className="p-4 font-semibold text-left text-gray-700">{r.label}</div>
                  <div className="p-4 text-red-500 font-medium">{r.before}</div>
                  <div className="p-4 text-green-600 font-medium">{r.after}</div>
                  <div className={`p-4 font-bold ${accent.text}`}>{r.saving}</div>
                </div>
              ))}
            </div>
          </div>
          {/* モバイル用カード */}
          <div className="sm:hidden space-y-3">
            {roi.map((r, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="font-semibold text-sm mb-3">{r.label}</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-red-50 rounded-lg p-2.5">
                    <span className="block text-red-400 font-medium mb-0.5">Before</span>
                    <span className="text-red-600 font-semibold">{r.before}</span>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2.5">
                    <span className="block text-green-500 font-medium mb-0.5">After</span>
                    <span className="text-green-600 font-semibold">{r.after}</span>
                  </div>
                </div>
                {r.saving !== '—' && (
                  <div className={`mt-2 text-center text-xs font-bold ${accent.text} ${accent.bg} rounded-lg py-1.5`}>
                    {r.saving}
                  </div>
                )}
              </div>
            ))}
          </div>
          <ScrollReveal delay={150}>
            <div className="mt-6 text-center">
              <div className={`inline-flex items-center gap-2 px-6 py-3 ${accent.btnBg.split(' ')[0]} text-white font-bold rounded-full text-sm shadow-lg`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {roiSummary}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== 導入ステップ ===== */}
      <section className="py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="text-center mb-14">
              <span className={`inline-block text-xs font-semibold ${accent.text} ${accent.bg} px-3 py-1 rounded-full mb-3`}>
                HOW IT WORKS
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">始め方は3ステップ</h2>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-3 gap-8 relative">
            {/* 接続線（デスクトップのみ） */}
            <div className="hidden sm:block absolute top-10 left-[20%] right-[20%] h-0.5 bg-gray-200" />
            {[
              { num: 1, title: 'アカウント作成', desc: 'メールだけで登録完了。カード不要。1分で開始。', icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
              { num: 2, title: 'リンク発行 & QR印刷', desc: 'スラッグ設定 → QR自動生成 → PNG/SVGでそのまま入稿。', icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg> },
              { num: 3, title: '管理画面でURL変更', desc: 'いつでも何度でも、リンク先をワンクリックで切り替え。', icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> },
            ].map((s, i) => (
              <ScrollReveal key={i} delay={i * 120}>
                <div className="text-center relative">
                  <div className={`w-20 h-20 ${accent.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4 ${accent.text} shadow-sm relative z-10 bg-white border ${accent.border}`}>
                    {s.icon}
                  </div>
                  <div className={`absolute -top-1 -right-1 sm:right-auto sm:left-[calc(50%+20px)] w-7 h-7 ${accent.btnBg.split(' ')[0]} rounded-full flex items-center justify-center text-white text-xs font-bold shadow z-20`}>
                    {s.num}
                  </div>
                  <h3 className="font-bold text-base mb-1">{s.title}</h3>
                  <p className="text-xs text-gray-500">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className={`relative py-20 sm:py-24 ${heroColor} overflow-hidden`}>
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-black/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-5 leading-tight tracking-tight">
              {ctaText}
            </h2>
            <p className="text-white/70 mb-8 text-sm sm:text-base">
              Freeプラン: 3リンクまで永久無料 / カード登録不要 / 1分で開始
            </p>
          </ScrollReveal>
          <ScrollReveal delay={120}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-50 transition-all shadow-xl shadow-black/10 text-base sm:text-lg"
              >
                無料アカウントを作成
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white font-semibold rounded-full hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-sm"
              >
                お問い合わせ
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== フッター ===== */}
      <footer className="py-10 bg-gray-950 text-gray-500 text-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo size="sm" />
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
              <Link href="/" className="hover:text-white transition-colors">トップ</Link>
              <Link href="/lp" className="hover:text-white transition-colors">業種別活用</Link>
              <Link href="/terms" className="hover:text-white transition-colors">利用規約</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">プライバシー</Link>
              <Link href="/contact" className="hover:text-white transition-colors">お問い合わせ</Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-800 text-center text-gray-600">
            &copy; 2026 Pivolink by TSURATSURA Inc.
          </div>
        </div>
      </footer>
    </div>
  )
}
