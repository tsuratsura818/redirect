'use client'

import { useNFC } from '@/hooks/useNFC'
import { useRouter } from 'next/navigation'

export default function NFCReader() {
  const router = useRouter()
  const { isSupported, status, error, detectedSlug, startScan, stopScan, reset } = useNFC()

  if (!isSupported) return null

  const handleNavigate = () => {
    if (detectedSlug) {
      router.push(`/dashboard/qr/${detectedSlug}`)
      reset()
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-lg font-bold">NFCタグ読み取り</h2>

      {error && (
        <div className="w-full p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* NFC アイコン & ステータス */}
      <div className="w-full max-w-sm aspect-square flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        {status === 'scanning' && (
          <>
            <div className="w-24 h-24 mb-4 text-blue-500 animate-pulse">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5l16.5-4.125M12 6.75c-2.708 0-5.363.224-7.948.655C2.999 7.58 2.25 8.507 2.25 9.574v9.176A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169A48.329 48.329 0 0012 6.75z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 font-medium">NFCタグにかざしてください...</p>
            <p className="text-xs text-gray-400 mt-1">端末の背面をタグに近づけます</p>
          </>
        )}

        {status === 'idle' && (
          <>
            <div className="w-24 h-24 mb-4 text-gray-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5l16.5-4.125M12 6.75c-2.708 0-5.363.224-7.948.655C2.999 7.58 2.25 8.507 2.25 9.574v9.176A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169A48.329 48.329 0 0012 6.75z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">ボタンを押してスキャン開始</p>
          </>
        )}

        {status === 'success' && detectedSlug && (
          <>
            <div className="w-24 h-24 mb-4 text-green-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-green-700 font-medium">Pivolinkタグを検出!</p>
            <p className="text-xs text-green-600 mt-1">slug: {detectedSlug}</p>
          </>
        )}

        {status === 'success' && !detectedSlug && (
          <>
            <div className="w-24 h-24 mb-4 text-yellow-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-sm text-yellow-700 font-medium">Pivolinkで管理されていないタグです</p>
            <p className="text-xs text-yellow-600 mt-1">書き込みページからPivolink URLを書き込めます</p>
          </>
        )}
      </div>

      {/* 検出時のアクション */}
      {status === 'success' && detectedSlug && (
        <button
          onClick={handleNavigate}
          className="w-full max-w-sm py-3 px-4 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
        >
          リンク設定を開く
        </button>
      )}

      {/* 操作ボタン */}
      <div className="flex gap-3 w-full max-w-sm">
        {status === 'scanning' ? (
          <button
            onClick={stopScan}
            className="flex-1 py-3 px-4 bg-gray-600 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            スキャン停止
          </button>
        ) : (
          <button
            onClick={() => {
              reset()
              startScan()
            }}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            {status === 'success' ? '再スキャン' : 'スキャン開始'}
          </button>
        )}
      </div>
    </div>
  )
}
