'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import translations, { type Locale, defaultLocale } from './translations'

const COOKIE_KEY = 'pivolink-lang'

interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: typeof translations.ja
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: defaultLocale,
  setLocale: () => {},
  t: translations[defaultLocale],
})

function getInitialLocale(): Locale {
  if (typeof document === 'undefined') return defaultLocale
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_KEY}=([^;]+)`))
  const value = match?.[1]
  if (value === 'ja' || value === 'en' || value === 'zh') return value
  return defaultLocale
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)

  useEffect(() => {
    setLocaleState(getInitialLocale())
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    document.cookie = `${COOKIE_KEY}=${newLocale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`
    document.documentElement.lang = newLocale === 'zh' ? 'zh-CN' : newLocale
  }, [])

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
