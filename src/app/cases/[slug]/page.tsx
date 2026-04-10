import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { CASE_STUDIES } from '@/lib/cases'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return CASE_STUDIES.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const cs = CASE_STUDIES.find((c) => c.slug === slug)
  if (!cs) return {}

  return {
    title: `${cs.title} | Pivolink 活用事例`,
    description: `${cs.industry}での活用事例：${cs.problem} → ${cs.solution}`,
    openGraph: {
      title: `${cs.title} | Pivolink`,
      description: cs.solution,
      images: [{ url: cs.image, width: 800, height: 480 }],
    },
  }
}

export default async function CaseDetailPage({ params }: Props) {
  const { slug } = await params
  const cs = CASE_STUDIES.find((c) => c.slug === slug)

  if (!cs) notFound()

  const currentIndex = CASE_STUDIES.findIndex((c) => c.slug === slug)
  const prev = currentIndex > 0 ? CASE_STUDIES[currentIndex - 1] : null
  const next = currentIndex < CASE_STUDIES.length - 1 ? CASE_STUDIES[currentIndex + 1] : null

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-foreground">
            Pivolink
          </Link>
          <Link
            href="/cases"
            className="text-sm text-foreground/60 hover:text-foreground transition-colors"
          >
            ← 活用事例一覧
          </Link>
        </div>
      </header>

      {/* ヒーロー */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <Image
          src={cs.image}
          alt={cs.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{cs.icon}</span>
              <span className="text-sm font-semibold text-white/80 uppercase tracking-wider">{cs.industry}</span>
              <span className={`ml-2 text-xs font-bold px-2.5 py-0.5 rounded-full ${cs.featureColor}`}>
                {cs.feature}
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight">
              {cs.title}
            </h1>
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <article className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        {/* Before / After サマリー */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">Before</span>
              <span className="text-sm font-semibold text-red-800">課題</span>
            </div>
            <p className="text-red-700 leading-relaxed">{cs.problem}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">After</span>
              <span className="text-sm font-semibold text-emerald-800">解決</span>
            </div>
            <p className="text-emerald-700 leading-relaxed">{cs.solution}</p>
          </div>
        </div>

        {/* 背景 */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full" />
            背景
          </h2>
          <p className="text-foreground/75 leading-relaxed">{cs.detail.background}</p>
        </section>

        {/* 課題 */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-red-500 rounded-full" />
            抱えていた課題
          </h2>
          <ul className="space-y-3">
            {cs.detail.challenges.map((c, i) => (
              <li key={i} className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-foreground/75 leading-relaxed">{c}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Pivolinkの導入 */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full" />
            Pivolinkでの解決方法
          </h2>
          <ul className="space-y-3">
            {cs.detail.howPivolink.map((h, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-foreground/75 leading-relaxed">{h}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 成果 */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-emerald-500 rounded-full" />
            導入の成果
          </h2>
          <ul className="space-y-3">
            {cs.detail.results.map((r, i) => (
              <li key={i} className="flex items-start gap-3">
                <svg className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-foreground/75 leading-relaxed font-medium">{r}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 引用 */}
        {cs.detail.quote && (
          <section className="mb-12">
            <blockquote className="border-l-4 border-primary bg-slate-50 rounded-r-xl p-6">
              <p className="text-foreground/80 leading-relaxed italic">
                &ldquo;{cs.detail.quote}&rdquo;
              </p>
              <footer className="mt-3 text-sm text-foreground/50">
                — {cs.industry}ご担当者様
              </footer>
            </blockquote>
          </section>
        )}

        {/* CTA */}
        <section className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-8 text-center mb-12">
          <h3 className="text-xl font-bold text-foreground mb-2">
            あなたの業界でもPivolinkを活用しませんか？
          </h3>
          <p className="text-foreground/60 text-sm mb-6">
            Freeプラン: 3リンクまで永久無料 / カード登録不要 / 1分で開始
          </p>
          <Link
            href="/login?tab=signup"
            className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-300/30 transition-all"
          >
            無料で始める
          </Link>
        </section>

        {/* 前後ナビ */}
        <nav className="flex items-stretch gap-4">
          {prev ? (
            <Link
              href={`/cases/${prev.slug}`}
              className="flex-1 rounded-xl border border-border p-4 hover:bg-slate-50 transition-colors group"
            >
              <span className="text-xs text-foreground/40">← 前の事例</span>
              <p className="text-sm font-semibold text-foreground mt-1 group-hover:text-primary transition-colors">
                {prev.title}
              </p>
            </Link>
          ) : <div className="flex-1" />}
          {next ? (
            <Link
              href={`/cases/${next.slug}`}
              className="flex-1 rounded-xl border border-border p-4 hover:bg-slate-50 transition-colors text-right group"
            >
              <span className="text-xs text-foreground/40">次の事例 →</span>
              <p className="text-sm font-semibold text-foreground mt-1 group-hover:text-primary transition-colors">
                {next.title}
              </p>
            </Link>
          ) : <div className="flex-1" />}
        </nav>
      </article>

      {/* フッター */}
      <footer className="border-t border-border py-8 text-center">
        <p className="text-sm text-foreground/40">
          &copy; {new Date().getFullYear()} Pivolink by TSURATSURA
        </p>
      </footer>
    </div>
  )
}
