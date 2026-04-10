import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { CASE_STUDIES } from '@/lib/cases'
import Logo from '@/components/Logo'

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

  const fullImageUrl = `https://redirect.tsuratsura.com${cs.image}`

  return {
    title: cs.seoTitle,
    description: cs.metaDescription,
    alternates: {
      canonical: `https://redirect.tsuratsura.com/cases/${cs.slug}`,
    },
    openGraph: {
      title: cs.seoTitle,
      description: cs.metaDescription,
      url: `https://redirect.tsuratsura.com/cases/${cs.slug}`,
      siteName: 'Pivolink',
      type: 'article',
      publishedTime: cs.publishedAt,
      images: [{ url: fullImageUrl, width: 800, height: 480, alt: cs.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: cs.title,
      description: cs.metaDescription,
      images: [fullImageUrl],
    },
  }
}

function getReadingTime(cs: typeof CASE_STUDIES[0]): number {
  const text = [
    cs.detail.industryContext,
    cs.detail.background,
    ...cs.detail.challenges.map((c) => c.title + c.body),
    ...cs.detail.howPivolink.map((h) => h.title + h.body),
    ...cs.detail.results.map((r) => r.title + r.body),
    ...cs.detail.tips.map((t) => t.title + t.body),
    ...cs.detail.faq.map((f) => f.q + f.a),
    cs.detail.quote,
  ].join('')
  return Math.max(3, Math.ceil(text.length / 400))
}

/** 長文を2〜3文ごとに段落分割して表示 */
function Paragraphs({ text, className }: { text: string; className?: string }) {
  const sentences = text.split(/(?<=。)/)
  const paragraphs: string[] = []
  let current = ''
  for (const s of sentences) {
    current += s
    const count = (current.match(/。/g) || []).length
    if (count >= 2 || current.length > 120) {
      paragraphs.push(current.trim())
      current = ''
    }
  }
  if (current.trim()) paragraphs.push(current.trim())

  return (
    <div className={`space-y-4 ${className ?? ''}`}>
      {paragraphs.map((p, i) => (
        <p key={i} className="text-foreground/75 leading-[1.9] text-[15px]">{p}</p>
      ))}
    </div>
  )
}

export default async function CaseDetailPage({ params }: Props) {
  const { slug } = await params
  const cs = CASE_STUDIES.find((c) => c.slug === slug)

  if (!cs) notFound()

  const currentIndex = CASE_STUDIES.findIndex((c) => c.slug === slug)
  const prev = currentIndex > 0 ? CASE_STUDIES[currentIndex - 1] : null
  const next = currentIndex < CASE_STUDIES.length - 1 ? CASE_STUDIES[currentIndex + 1] : null
  const readingTime = getReadingTime(cs)

  const relatedCases = CASE_STUDIES
    .filter((c) => c.feature === cs.feature && c.slug !== cs.slug)
    .slice(0, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: cs.title,
    description: cs.metaDescription,
    image: `https://redirect.tsuratsura.com${cs.image}`,
    datePublished: cs.publishedAt,
    author: { '@type': 'Organization', name: 'Pivolink by TSURATSURA' },
    publisher: {
      '@type': 'Organization',
      name: 'Pivolink',
      logo: { '@type': 'ImageObject', url: 'https://redirect.tsuratsura.com/pivofavicon.png' },
    },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Pivolink', item: 'https://redirect.tsuratsura.com' },
      { '@type': 'ListItem', position: 2, name: '活用事例', item: 'https://redirect.tsuratsura.com/cases' },
      { '@type': 'ListItem', position: 3, name: cs.title, item: `https://redirect.tsuratsura.com/cases/${cs.slug}` },
    ],
  }

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* ヘッダー */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <Link
            href="/cases"
            className="text-sm text-foreground/60 hover:text-foreground transition-colors"
          >
            ← 活用事例一覧
          </Link>
        </div>
      </header>

      {/* パンくずリスト */}
      <nav className="max-w-5xl mx-auto px-6 py-3" aria-label="パンくずリスト">
        <ol className="flex items-center gap-1.5 text-xs text-foreground/50">
          <li><Link href="/" className="hover:text-foreground transition-colors">Pivolink</Link></li>
          <li>/</li>
          <li><Link href="/cases" className="hover:text-foreground transition-colors">活用事例</Link></li>
          <li>/</li>
          <li className="text-foreground/70 font-medium truncate max-w-[200px]">{cs.industry}</li>
        </ol>
      </nav>

      {/* ヒーロー */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <Image
          src={cs.image}
          alt={`${cs.industry}の活用事例：${cs.title}`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-5xl mx-auto">
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
            <div className="flex items-center gap-4 mt-3 text-white/60 text-xs">
              <span>公開: {new Date(cs.publishedAt).toLocaleDateString('ja-JP')}</span>
              <span>読了目安: 約{readingTime}分</span>
            </div>
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <article className="max-w-5xl mx-auto px-6 py-12 md:py-16">
        {/* Before / After サマリー */}
        <div className="grid md:grid-cols-2 gap-6 mb-14">
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

        {/* 業界コンテキスト */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
            <span className="w-1 h-6 bg-slate-400 rounded-full" />
            {cs.industry}の現状
          </h2>
          <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden mb-6">
            <Image src={cs.sectionImages[0]} alt={`${cs.industry}の現状`} fill className="object-cover" />
          </div>
          <Paragraphs text={cs.detail.industryContext} />
        </section>

        {/* 背景 */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full" />
            こんな場面で活用が考えられます
          </h2>
          <Paragraphs text={cs.detail.background} />
        </section>

        {/* 課題 */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
            <span className="w-1 h-6 bg-red-500 rounded-full" />
            {cs.industry}でよくあるQR・NFCの課題
          </h2>
          <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden mb-6">
            <Image src={cs.sectionImages[1]} alt={`${cs.industry}の課題`} fill className="object-cover" />
          </div>
          <ul className="space-y-6">
            {cs.detail.challenges.map((c, i) => (
              <li key={i} className="rounded-xl border border-red-100 bg-red-50/30 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="font-semibold text-foreground">{c.title}</p>
                </div>
                <Paragraphs text={c.body} />
              </li>
            ))}
          </ul>
        </section>

        {/* Pivolinkでの解決方法 */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full" />
            Pivolinkの「{cs.feature}」機能での解決方法
          </h2>
          <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden mb-6">
            <Image src={cs.sectionImages[2]} alt={`Pivolinkでの解決方法`} fill className="object-cover" />
          </div>
          <ul className="space-y-6">
            {cs.detail.howPivolink.map((h, i) => (
              <li key={i} className="rounded-xl border border-primary/10 bg-primary/[0.02] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">
                    {i + 1}
                  </span>
                  <p className="font-semibold text-foreground">{h.title}</p>
                </div>
                <Paragraphs text={h.body} />
              </li>
            ))}
          </ul>
        </section>

        {/* 中間CTA */}
        <section className="rounded-xl border border-primary/20 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 p-6 mb-14 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <p className="font-bold text-foreground text-sm">同じ課題をお持ちですか？</p>
            <p className="text-foreground/60 text-xs mt-1">Pivolinkなら無料で始められます。カード登録不要。</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link
              href="/login?tab=signup"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:shadow-lg transition-all whitespace-nowrap"
            >
              無料で始める
            </Link>
            <Link
              href="/#pricing"
              className="border border-border text-foreground/70 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all whitespace-nowrap"
            >
              料金プラン
            </Link>
          </div>
        </section>

        {/* 期待できる成果 */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
            <span className="w-1 h-6 bg-emerald-500 rounded-full" />
            期待できる成果
          </h2>
          <ul className="space-y-6">
            {cs.detail.results.map((r, i) => (
              <li key={i} className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="font-semibold text-foreground">{r.title}</p>
                </div>
                <Paragraphs text={r.body} />
              </li>
            ))}
          </ul>
        </section>

        {/* 実践Tips */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
            <span className="w-1 h-6 bg-amber-500 rounded-full" />
            {cs.industry}での実践Tips
          </h2>
          <ul className="space-y-6">
            {cs.detail.tips.map((t, i) => (
              <li key={i} className="rounded-xl border border-amber-100 bg-amber-50/30 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-700 text-sm font-bold shrink-0">
                    {i + 1}
                  </span>
                  <p className="font-semibold text-foreground">{t.title}</p>
                </div>
                <Paragraphs text={t.body} />
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
            <span className="w-1 h-6 bg-violet-500 rounded-full" />
            よくある質問
          </h2>
          <div className="space-y-5">
            {cs.detail.faq.map((f, i) => (
              <div key={i} className="rounded-xl border border-border p-5">
                <p className="font-semibold text-foreground mb-3 flex items-start gap-2">
                  <span className="text-primary font-bold shrink-0 text-lg leading-tight">Q.</span>
                  {f.q}
                </p>
                <div className="pl-7 border-l-2 border-primary/10">
                  <Paragraphs text={f.a} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 引用 */}
        <section className="mb-14">
          <blockquote className="border-l-4 border-primary bg-slate-50 rounded-r-xl p-6">
            <p className="text-foreground/80 leading-[1.9] italic text-[15px]">
              &ldquo;{cs.detail.quote}&rdquo;
            </p>
            <footer className="mt-3 text-sm text-foreground/50">
              — {cs.industry}ご担当者様（想定される声）
            </footer>
          </blockquote>
        </section>

        {/* 最下部CTA */}
        <section className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-8 text-center mb-14">
          <h3 className="text-xl font-bold text-foreground mb-2">
            あなたの{cs.industry}でもPivolinkを活用しませんか？
          </h3>
          <p className="text-foreground/60 text-sm mb-6">
            Freeプラン: 3リンクまで永久無料 / カード登録不要 / 1分で開始
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login?tab=signup"
              className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-300/30 transition-all"
            >
              無料で始める
            </Link>
            <Link
              href="/#pricing"
              className="inline-block border-2 border-emerald-300 text-emerald-700 px-8 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-all"
            >
              料金プランを見る
            </Link>
          </div>
        </section>

        {/* 関連事例 */}
        {relatedCases.length > 0 && (
          <section className="mb-14">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full" />
              「{cs.feature}」を活用した他の事例
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCases.map((rc) => (
                <Link
                  key={rc.slug}
                  href={`/cases/${rc.slug}`}
                  className="group rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative h-44 overflow-hidden">
                    <Image src={rc.image} alt={rc.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{rc.icon}</span>
                      <span className="text-xs font-semibold text-foreground/55">{rc.industry}</span>
                    </div>
                    <p className="font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {rc.title}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-primary group-hover:underline">
                      詳しく見る →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

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
