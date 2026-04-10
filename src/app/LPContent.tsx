'use client'

import { useState } from 'react'
import Link from 'next/link'
import ScrollReveal from '@/components/ScrollReveal'
import Logo from '@/components/Logo'
import CaseStudyCard from '@/components/CaseStudyCard'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useLanguage } from '@/i18n/LanguageProvider'
import { IS_BETA } from '@/lib/plans'
import type { BillingCycle } from '@/lib/plans'
import Image from 'next/image'
import { CASE_STUDIES } from '@/lib/cases'

const caseImages = [
  { src: '/cases/restaurant.jpg', alt: 'レストラン' },
  { src: '/cases/retail.jpg', alt: 'アパレルショップ' },
  { src: '/cases/realestate.jpg', alt: '不動産' },
  { src: '/cases/event.jpg', alt: 'イベント会場' },
  { src: '/cases/salon.jpg', alt: '美容サロン' },
  { src: '/cases/tourism.jpg', alt: '観光地' },
  { src: '/cases/manufacturing.jpg', alt: '製造業' },
  { src: '/cases/ec.jpg', alt: 'ECショップ' },
  { src: '/cases/gym.jpg', alt: 'フィットネスジム' },
  { src: '/cases/publisher.jpg', alt: '出版・書店' },
  { src: '/cases/education.jpg', alt: '教育' },
  { src: '/cases/hotel.jpg', alt: 'ホテル・宿泊' },
]

const caseIcons = ['🍽️', '👕', '🏠', '🎪', '💇', '🗾', '🏭', '📦', '🏋️', '📚', '🎓', '🏨']

const caseFeatureColors = [
  'bg-blue-100 text-blue-700',
  'bg-indigo-100 text-indigo-700',
  'bg-indigo-100 text-indigo-700',
  'bg-blue-100 text-blue-700',
  'bg-indigo-100 text-indigo-700',
  'bg-purple-100 text-purple-700',
  'bg-red-100 text-red-700',
  'bg-orange-100 text-orange-700',
  'bg-blue-100 text-blue-700',
  'bg-indigo-100 text-indigo-700',
  'bg-indigo-100 text-indigo-700',
  'bg-blue-100 text-blue-700',
]

const featureIcons = ['🔲', '📱', '📈', '📋', '⏰', '🖥️', '⚡', '🎫', '📅']

export default function LPContent() {
  const { t } = useLanguage()
  const lp = t.lp
  const features = t.features
  const plans = t.plans
  const faqItems = t.faq
  const cases = t.cases
  const common = t.common
  const [billing, setBilling] = useState<BillingCycle>('monthly')
  const isAnnual = billing === 'annual'

  const featureList = [
    features.qrGen,
    features.nfcMgmt,
    features.analytics,
    features.history,
    features.schedule,
    features.device,
    features.abTest,
    features.cushion,
    features.expiry,
  ]

  const planList = [
    {
      name: 'Free',
      price: '¥0',
      originalPrice: null as string | null,
      monthlyEquiv: null as string | null,
      desc: plans.freeDesc,
      features: plans.freeFeatures,
      cta: plans.freeCta,
      popular: false,
      isFree: true,
    },
    {
      name: 'Pro',
      price: isAnnual
        ? (IS_BETA ? '¥7,800' : '¥9,800')
        : (IS_BETA ? '¥780' : '¥980'),
      originalPrice: isAnnual
        ? (IS_BETA ? '¥9,800' : null)
        : (IS_BETA ? '¥980' : null),
      monthlyEquiv: isAnnual ? (IS_BETA ? '¥650' : '¥817') : null,
      desc: plans.proDesc,
      features: plans.proFeatures,
      cta: plans.proCta,
      popular: true,
      isFree: false,
    },
    {
      name: 'Business',
      price: isAnnual
        ? (IS_BETA ? '¥39,800' : '¥49,800')
        : (IS_BETA ? '¥3,980' : '¥4,980'),
      originalPrice: isAnnual
        ? (IS_BETA ? '¥49,800' : null)
        : (IS_BETA ? '¥4,980' : null),
      monthlyEquiv: isAnnual ? (IS_BETA ? '¥3,316' : '¥4,150') : null,
      desc: plans.bizDesc,
      features: plans.bizFeatures,
      cta: plans.bizCta,
      popular: false,
      isFree: false,
    },
  ]

  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <Link href="#features" className="text-foreground/75 hover:text-foreground transition-colors font-medium text-sm hidden md:block">
              {common.features}
            </Link>
            <Link href="#pricing" className="text-foreground/75 hover:text-foreground transition-colors font-medium text-sm hidden md:block">
              {common.pricing}
            </Link>
            <Link href="#faq" className="text-foreground/75 hover:text-foreground transition-colors font-medium text-sm hidden md:block">
              {common.faq}
            </Link>
            <Link href="/login" className="text-foreground/75 hover:text-foreground transition-colors font-medium text-sm whitespace-nowrap hidden sm:block">
              {common.login}
            </Link>
            <Link
              href="/login?tab=signup"
              className="gradient-bg text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl hover:shadow-lg hover:shadow-emerald-300/30 transition-all font-semibold text-xs sm:text-sm whitespace-nowrap shrink-0"
            >
              {common.free}
            </Link>
            <div className="sm:hidden"><LanguageSwitcher compact /></div>
            <div className="hidden sm:block"><LanguageSwitcher /></div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto px-6 text-center relative">
          <div className="animate-fade-in-up inline-block bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 px-5 py-1.5 rounded-full text-sm font-semibold mb-8 border border-emerald-200/50">
            {lp.tagline}
          </div>
          <h1 className="animate-fade-in-up delay-100 text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.15] mb-8 tracking-tight">
            {lp.heroTitle1}<br />
            <span className="gradient-text">{lp.heroTitle2}</span>{lp.heroTitle3}<br />
            {lp.heroTitle4}
          </h1>
          <p className="animate-fade-in-up delay-200 text-base md:text-lg text-foreground/75 max-w-2xl mx-auto mb-12 leading-relaxed whitespace-pre-line">
            {lp.heroDesc}
          </p>
          <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login?tab=signup"
              className="gradient-bg text-white px-9 py-4 rounded-xl text-lg font-bold hover:shadow-xl hover:shadow-emerald-300/40 hover:-translate-y-0.5 transition-all"
            >
              {lp.ctaFree}
            </Link>
            <Link
              href="#features"
              className="border-2 border-foreground/15 text-foreground px-9 py-4 rounded-xl text-lg font-bold hover:bg-white hover:border-foreground/25 hover:-translate-y-0.5 transition-all"
            >
              {lp.ctaFeatures}
            </Link>
          </div>
        </div>
      </section>

      {/* QR & NFC 両対応バナー */}
      <section className="max-w-6xl mx-auto px-6 -mt-10 relative z-10 pb-8">
        <div className="grid md:grid-cols-2 gap-6">
          <ScrollReveal animation="slide-in-left" className="h-full">
            <div className="bg-card rounded-2xl p-8 border border-border shadow-lg shadow-black/5 card-hover flex items-start gap-5 h-full">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center shrink-0 text-primary animate-float">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">{lp.qrTitle}</h3>
                <p className="text-foreground/75 leading-relaxed text-pretty">{lp.qrDesc}</p>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="slide-in-right" delay={150} className="h-full">
            <div className="bg-card rounded-2xl p-8 border border-border shadow-lg shadow-black/5 card-hover flex items-start gap-5 h-full">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-cyan-200 rounded-xl flex items-center justify-center shrink-0 text-accent animate-float" style={{ animationDelay: '1.5s' }}>
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">{lp.nfcTitle}</h3>
                <p className="text-foreground/75 leading-relaxed text-pretty">{lp.nfcDesc}</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 仕組み */}
      <section className="bg-white py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-foreground mb-4 tracking-tight">{lp.stepsTitle}</h2>
            <p className="text-center text-foreground/75 mb-14 text-base">{lp.stepsDesc}</p>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: lp.step1Title, desc: lp.step1Desc },
              { step: '2', title: lp.step2Title, desc: lp.step2Desc },
              { step: '3', title: lp.step3Title, desc: lp.step3Desc },
            ].map((item, i) => (
              <ScrollReveal key={item.step} animation="scale-in" delay={i * 150} className="h-full">
                <div className="bg-gradient-to-b from-slate-50 to-white rounded-2xl p-8 border border-border card-hover text-center h-full flex flex-col">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-primary">
                    {i === 0 && <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
                    {i === 1 && <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>}
                    {i === 2 && <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
                  </div>
                  <div className="inline-block text-xs font-bold text-white gradient-bg px-3 py-1 rounded-full mb-3">STEP {item.step}</div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-foreground/75 leading-relaxed text-pretty">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 活用事例 */}
      <section id="cases" className="bg-gradient-to-b from-slate-50 to-white py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-foreground mb-4 tracking-tight">{lp.casesTitle}</h2>
            <p className="text-center text-foreground/75 mb-14 text-base">{lp.casesDesc}</p>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            {cases.map((c, i) => (
              <ScrollReveal key={i} animation="fade-in-up" delay={(i % 3) * 120}>
                <CaseStudyCard
                  icon={caseIcons[i]}
                  industry={c.industry}
                  title={c.title}
                  problem={c.problem}
                  solution={c.solution}
                  feature={c.feature}
                  featureColor={caseFeatureColors[i]}
                  slug={CASE_STUDIES[i]?.slug}
                  illustration={
                    <Image
                      src={caseImages[i].src}
                      alt={caseImages[i].alt}
                      width={800}
                      height={480}
                      className="w-full h-full object-cover"
                    />
                  }
                />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 機能一覧 */}
      <section id="features" className="bg-white py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-foreground mb-4 tracking-tight">{lp.featuresTitle}</h2>
            <p className="text-center text-foreground/75 mb-14 text-base">{lp.featuresDesc}</p>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureList.map((f, i) => (
              <ScrollReveal key={i} animation="fade-in-up" delay={i * 80}>
                <div className="bg-gradient-to-b from-slate-50/50 to-white rounded-xl p-6 border border-border card-hover group">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 transition-colors duration-250 group-hover:bg-primary/20">
                    <span className="text-3xl leading-none">{featureIcons[i]}</span>
                  </div>
                  <h3 className="font-bold text-foreground text-base mb-2">{f.title}</h3>
                  <p className="text-foreground/75 leading-relaxed text-sm">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 料金プラン */}
      <section id="pricing" className="bg-gradient-to-b from-slate-50 to-white py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-foreground mb-4 tracking-tight">{lp.pricingTitle}</h2>
            <p className="text-center text-foreground/75 mb-6 text-base">{lp.pricingDesc}</p>

            {/* 月額 / 年額トグル */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center bg-slate-100 rounded-xl p-1 gap-1">
                <button
                  onClick={() => setBilling('monthly')}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    billing === 'monthly'
                      ? 'bg-white text-foreground shadow-sm'
                      : 'text-foreground/55 hover:text-foreground'
                  }`}
                >
                  {common.monthly}
                </button>
                <button
                  onClick={() => setBilling('annual')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    billing === 'annual'
                      ? 'bg-white text-foreground shadow-sm'
                      : 'text-foreground/55 hover:text-foreground'
                  }`}
                >
                  {common.annual}
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {common.twoMonthsFree}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-14">
              <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {lp.betaBanner}
              </div>
              <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 px-4 py-2 rounded-full text-sm font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                  <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
                </svg>
                JPYC（ステーブルコイン）決済対応
              </div>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {planList.map((plan, i) => (
              <ScrollReveal key={plan.name} animation="scale-in" delay={i * 150}>
                <div
                  className={`bg-card rounded-2xl p-8 relative card-hover ${
                    plan.popular
                      ? 'border-2 border-emerald-400 shadow-xl shadow-emerald-200/30 md:scale-105'
                      : 'border border-border'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 gradient-bg text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-lg">
                      {common.popular}
                    </div>
                  )}
                  {plan.originalPrice && !isAnnual && (
                    <div className="absolute -top-3.5 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      20%OFF
                    </div>
                  )}
                  {plan.originalPrice && isAnnual && (
                    <div className="absolute -top-3.5 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      {common.twoMonthsFree}
                    </div>
                  )}
                  <h3 className="text-xl font-extrabold text-foreground mb-1">{plan.name}</h3>
                  <p className="text-sm text-foreground/75 mb-5">{plan.desc}</p>
                  <div className="mb-1">
                    {plan.originalPrice && (
                      <span className="text-lg text-foreground/40 line-through mr-2">{plan.originalPrice}</span>
                    )}
                    <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                    <span className="text-foreground/55 text-sm">{isAnnual && !plan.isFree ? common.year : common.month}</span>
                  </div>
                  {plan.monthlyEquiv && (
                    <p className="text-xs text-emerald-600 font-medium mb-5">
                      {plan.monthlyEquiv}{common.perMonth}
                    </p>
                  )}
                  {!plan.monthlyEquiv && <div className="mb-5" />}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2.5 text-sm">
                        <svg className="w-5 h-5 text-success mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-foreground/80">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/login?tab=signup${isAnnual ? '&billing=annual' : ''}`}
                    className={`block w-full py-3.5 rounded-xl text-center font-bold transition-all text-sm ${
                      plan.popular
                        ? 'gradient-bg text-white hover:shadow-lg hover:shadow-emerald-300/30 hover:-translate-y-0.5'
                        : 'border-2 border-foreground/10 text-foreground hover:border-foreground/25 hover:bg-slate-50 hover:-translate-y-0.5'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                  {!plan.isFree && (
                    <p className="mt-2 text-center text-[11px] text-teal-600 font-medium">
                      JPYC決済も利用可能（前払い割引あり）
                    </p>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-foreground mb-4 tracking-tight">{lp.faqTitle}</h2>
            <p className="text-center text-foreground/75 mb-14 text-base">{lp.faqDesc}</p>
          </ScrollReveal>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <ScrollReveal key={i} animation="fade-in-up" delay={i * 60}>
                <details className="group bg-gradient-to-b from-slate-50/50 to-white rounded-xl border border-border card-hover">
                  <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none">
                    <span className="font-bold text-foreground pr-4">{item.q}</span>
                    <svg className="w-5 h-5 text-foreground/40 shrink-0 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-5 text-foreground/75 leading-relaxed">
                    {item.a}
                  </div>
                </details>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal animation="scale-in">
            <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 animate-gradient rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-5">{lp.ctaTitle}</h2>
                <p className="text-white/75 mb-10 max-w-xl mx-auto text-base leading-relaxed whitespace-pre-line">
                  {lp.ctaDesc}
                </p>
                <Link
                  href="/login?tab=signup"
                  className="inline-block bg-white text-emerald-600 px-9 py-4 rounded-xl text-lg font-bold hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  {lp.ctaButton}
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* フッター */}
      <footer className="border-t border-border bg-white py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-foreground/55">
              {lp.copyright}
            </div>
            <nav className="flex flex-wrap justify-center gap-4 text-sm text-foreground/55">
              <a href="/terms" className="hover:text-foreground transition-colors">{common.terms}</a>
              <a href="/privacy" className="hover:text-foreground transition-colors">{common.privacy}</a>
              <a href="/tokusho" className="hover:text-foreground transition-colors">{common.tokusho}</a>
              <a href="/contact" className="hover:text-foreground transition-colors">{common.contact}</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
