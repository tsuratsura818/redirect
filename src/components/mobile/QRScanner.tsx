'use client'

import { useQRScanner } from '@/hooks/useQRScanner'
import { useRouter } from 'next/navigation'

export default function QRScanner() {
  const router = useRouter()
  const {
    isScanning,
    videoRef,
    canvasRef,
    detectedSlug,
    detectedUrl,
    error,
    startScan,
    stopScan,
    reset,
  } = useQRScanner()

  const handleNavigate = () => {
    if (detectedSlug) {
      router.push(`/dashboard/qr/${detectedSlug}`)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-lg font-bold">QRコードスキャナー</h2>

      <div role="status" aria-live="polite" className="sr-only">
        {isScanning && 'スキャン中...'}
        {detectedSlug && 'Pivolinkリンクを検出しました'}
        {error && error}
      </div>

      {error && (
        <div className="w-full p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* カメラプレビュー */}
      <div className="relative w-full max-w-sm aspect-square bg-black rounded-xl overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />

        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* スキャンフレーム */}
            <div className="w-2/3 h-2/3 border-2 border-white/80 rounded-xl">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-3 border-l-3 border-blue-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-3 border-r-3 border-blue-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-3 border-l-3 border-blue-400 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-3 border-r-3 border-blue-400 rounded-br-lg" />
            </div>
          </div>
        )}

        {!isScanning && !detectedSlug && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60">
            <p className="text-white text-sm">カメラを起動してスキャン</p>
          </div>
        )}
      </div>

      {/* 検出結果 */}
      {detectedSlug && (
        <div className="w-full max-w-sm p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm font-medium text-green-800 mb-2">
            Pivolinkリンクを検出しました
          </p>
          <p className="text-xs text-green-600 mb-3 break-all">{detectedUrl}</p>
          <button
            onClick={handleNavigate}
            className="w-full py-2 px-4 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            リンク設定を開く
          </button>
        </div>
      )}

      {detectedUrl && !detectedSlug && (
        <div className="w-full max-w-sm p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-sm font-medium text-yellow-800 mb-1">
            Pivolink以外のQRコードです
          </p>
          <p className="text-xs text-yellow-600 break-all">{detectedUrl}</p>
        </div>
      )}

      {/* 操作ボタン */}
      <div className="flex gap-3 w-full max-w-sm">
        {!isScanning ? (
          <button
            onClick={() => {
              reset()
              startScan()
            }}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            {detectedSlug || detectedUrl ? '再スキャン' : 'スキャン開始'}
          </button>
        ) : (
          <button
            onClick={stopScan}
            className="flex-1 py-3 px-4 bg-gray-600 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            停止
          </button>
        )}
      </div>
    </div>
  )
}
