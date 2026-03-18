'use client'

import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '@/i18n/LanguageProvider'
import type { Locale } from '@/i18n/translations'

const options: { value: Locale; label: string; flag: string }[] = [
  { value: 'ja', label: '日本語', flag: '🇯🇵' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'zh', label: '中文', flag: '🇨🇳' },
]

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const current = options.find(o => o.value === locale) ?? options[0]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-lg border border-border bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-foreground/70 hover:text-foreground ${compact ? 'px-2 py-1.5' : 'px-3 py-2'}`}
        aria-label="Change language"
      >
        <span>{current.flag}</span>
        {!compact && <span>{current.label}</span>}
        <svg className="w-3.5 h-3.5 text-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl border border-border shadow-lg shadow-black/10 py-1 z-50">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setLocale(opt.value); setOpen(false) }}
              className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${locale === opt.value ? 'font-semibold text-primary' : 'text-foreground/70'}`}
            >
              <span>{opt.flag}</span>
              <span>{opt.label}</span>
              {locale === opt.value && (
                <svg className="w-4 h-4 text-primary ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
