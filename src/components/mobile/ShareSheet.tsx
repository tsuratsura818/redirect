'use client'

import { useState } from 'react'
import { shareContent, canShare } from '@/lib/capacitor/share'
import { saveQRImage } from '@/lib/capacitor/filesystem'
import { useEffect } from 'react'

interface ShareSheetProps {
  slug: string
  label: string
  qrBase64?: string
  onClose: () => void
}

export default function ShareSheet({ slug, label, qrBase64, onClose }: ShareSheetProps) {
  const [shareAvailable, setShareAvailable] = useState(false)

  useEffect(() => {
    canShare().then(setShareAvailable)
  }, [])

  const pivolinkUrl = `https://redirect.tsuratsura.com/r/${slug}`

  const handleShareLink = async () => {
    await shareContent({
      title: `Pivolink: ${label}`,
      text: `${label} のリンク`,
      url: pivolinkUrl,
      dialogTitle: 'リンクを共有',
    })
  }

  const handleSaveQR = async () => {
    if (!qrBase64) return
    const fileName = `pivolink-${slug}.png`
    await saveQRImage(qrBase64, fileName)
  }

  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pivolinkUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API非対応時は何もしない（ネイティブ共有を案内）
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-t-2xl p-6 pb-8 animate-slide-up">
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

        <h3 className="text-lg font-bold mb-1">{label}</h3>
        <p className="text-xs text-gray-500 mb-6">{pivolinkUrl}</p>

        <div className="space-y-3">
          {shareAvailable && (
            <button
              onClick={handleShareLink}
              className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <div className="text-left">
                <p className="text-sm font-medium">リンクを共有</p>
                <p className="text-xs text-gray-500">他のアプリに送る</p>
              </div>
            </button>
          )}

          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            <div className="text-left">
              <p className="text-sm font-medium">{copied ? 'コピーしました!' : 'URLをコピー'}</p>
              <p className="text-xs text-gray-500">クリップボードにコピー</p>
            </div>
          </button>

          {qrBase64 && (
            <button
              onClick={handleSaveQR}
              className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <div className="text-left">
                <p className="text-sm font-medium">QR画像を保存</p>
                <p className="text-xs text-gray-500">端末に保存</p>
              </div>
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-3 bg-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-300 transition-colors"
        >
          閉じる
        </button>
      </div>
    </div>
  )
}
