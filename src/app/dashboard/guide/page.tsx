'use client'

import { useLanguage } from '@/i18n/LanguageProvider'

export default function GuidePage() {
  const { t } = useLanguage()
  const g = t.guide
  const sections = g.sections

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">{g.title}</h1>
        <p className="text-muted text-sm mt-1">{g.subtitle}</p>
      </div>

      {/* 目次 */}
      <nav className="bg-card rounded-xl border border-border p-4 sm:p-5 mb-8">
        <h2 className="font-bold text-foreground text-sm mb-3">{g.tableOfContents}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {sections.map((s, i) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground/70 hover:bg-gray-50 hover:text-foreground transition-colors"
            >
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              {s.title}
            </a>
          ))}
        </div>
      </nav>

      {/* セクション */}
      <div className="space-y-8">
        {sections.map((s, i) => (
          <section key={s.id} id={s.id} className="bg-card rounded-xl border border-border p-4 sm:p-6 scroll-mt-20">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-8 h-8 rounded-full gradient-bg text-white text-sm font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <h2 className="text-lg font-bold text-foreground">{s.title}</h2>
            </div>
            <div className="space-y-5">
              {s.content.map((c, ci) => (
                <div key={ci}>
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
