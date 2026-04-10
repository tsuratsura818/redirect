import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { CASE_STUDIES } from '@/lib/cases'
import Logo from '@/components/Logo'

export const metadata: Metadata = {
  title: '活用事例 | Pivolink',
  description: 'Pivolinkの活用事例集。飲食・小売・不動産・イベント・美容・観光・製造・EC・ジム・出版・教育・ホテルなど、12業種での導入事例をご紹介。',
}

export default function CasesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <Link
            href="/login?tab=signup"
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
          >
            無料で始める
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white pt-16 pb-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
            活用事例
          </h1>
          <p className="text-foreground/60 text-base md:text-lg max-w-2xl mx-auto">
            QRコード・NFCタグの「変更できない」問題を、Pivolinkがどう解決したか。12業種の導入事例をご紹介します。
          </p>
        </div>
      </section>

      {/* 事例一覧 */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
          {CASE_STUDIES.map((cs) => (
            <Link
              key={cs.slug}
              href={`/cases/${cs.slug}`}
              className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={cs.image}
                  alt={cs.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{cs.icon}</span>
                  <span className="text-xs font-semibold text-foreground/55 uppercase tracking-wider">{cs.industry}</span>
                  <span className={`ml-auto text-xs font-bold px-2.5 py-0.5 rounded-full ${cs.featureColor}`}>
                    {cs.feature}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-foreground mb-3 leading-snug group-hover:text-primary transition-colors">
                  {cs.title}
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-bold text-xs mt-0.5 shrink-0">Before</span>
                    <p className="text-foreground/60 leading-relaxed line-clamp-2">{cs.problem}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold text-xs mt-0.5 shrink-0">After</span>
                    <p className="text-foreground/70 leading-relaxed font-medium line-clamp-2">{cs.solution}</p>
                  </div>
                </div>
                <p className="mt-4 text-xs font-semibold text-primary group-hover:underline">
                  詳しく見る →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-emerald-500 to-teal-500 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
            あなたの業界でもPivolinkを活用しませんか？
          </h2>
          <p className="text-white/70 mb-8">
            Freeプラン: 3リンクまで永久無料 / カード登録不要 / 1分で開始
          </p>
          <Link
            href="/login?tab=signup"
            className="inline-block bg-white text-emerald-600 px-8 py-3.5 rounded-xl font-bold hover:shadow-xl transition-all"
          >
            無料で始める
          </Link>
        </div>
      </section>

      {/* フッター */}
      <footer className="border-t border-border py-8 text-center">
        <p className="text-sm text-foreground/40">
          &copy; {new Date().getFullYear()} Pivolink by TSURATSURA
        </p>
      </footer>
    </div>
  )
}
