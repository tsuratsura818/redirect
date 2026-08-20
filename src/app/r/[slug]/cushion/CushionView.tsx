'use client'

import { useEffect, useState } from 'react'
import type { CushionPage } from '@/types/database'

interface Props {
  dest: string
  cushion: CushionPage | null
}

export default function CushionView({ dest, cushion }: Props) {
  const seconds = cushion?.display_seconds ?? 5
  const autoRedirect = seconds > 0
  const [countdown, setCountdown] = useState(seconds)
  const [copied, setCopied] = useState(false)

  // 自動遷移（表示秒数が 0 の場合は手動のみ）
  useEffect(() => {
    if (!autoRedirect) return
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          window.location.href = dest
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [dest, autoRedirect])

  const bgColor = cushion?.background_color || '#eef2ff'
  const textColor = cushion?.text_color || '#1f2937'
  const accentColor = cushion?.accent_color || '#3b82f6'
  const title = cushion?.title || 'ページを移動します...'
  const message = cushion?.message
  const buttonText = cushion?.button_text || '続ける'
  const logoUrl = cushion?.logo_url
  const couponCode =
    cushion?.coupon_enabled && cushion.coupon_code ? cushion.coupon_code : null
  const couponNote = cushion?.coupon_note

  const handleCopy = async () => {
    if (!couponCode) return
    try {
      await navigator.clipboard.writeText(couponCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: bgColor }}
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="h-12 mx-auto mb-4 object-contain" />
        )}

        <h1 className="text-xl font-bold mb-2" style={{ color: textColor }}>
          {title}
        </h1>

        {message && (
          <p
            className="text-sm mb-4 whitespace-pre-line"
            style={{ color: textColor, opacity: 0.7 }}
          >
            {message}
          </p>
        )}

        {couponCode && (
          <div className="my-5">
            <div
              className="rounded-xl border-2 border-dashed p-4"
              style={{ borderColor: accentColor }}
            >
              <p
                className="text-xs mb-1"
                style={{ color: textColor, opacity: 0.6 }}
              >
                クーポンコード
              </p>
              <p
                className="text-2xl font-bold tracking-wider break-all"
                style={{ color: accentColor }}
              >
                {couponCode}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="mt-2 text-sm font-medium underline"
              style={{ color: accentColor }}
            >
              {copied ? 'コピーしました ✓' : 'コードをコピー'}
            </button>
            {couponNote && (
              <p
                className="mt-2 text-xs whitespace-pre-line"
                style={{ color: textColor, opacity: 0.5 }}
              >
                {couponNote}
              </p>
            )}
          </div>
        )}

        {autoRedirect && (
          <p
            className="text-sm mb-4"
            style={{ color: textColor, opacity: 0.5 }}
          >
            {countdown}秒後に自動的に移動します
          </p>
        )}

        <a
          href={dest}
          className="inline-block w-full py-3 px-6 text-white font-medium rounded-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: accentColor }}
        >
          {buttonText}
        </a>

        <p className="mt-4 text-xs text-gray-400 break-all">移動先: {dest}</p>
      </div>
    </div>
  )
}
