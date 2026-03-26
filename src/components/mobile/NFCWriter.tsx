'use client'

import { useState, useCallback } from 'react'
import { useNFC } from '@/hooks/useNFC'
import { useAppReview } from '@/hooks/useAppReview'
import LinkSelector from './LinkSelector'
import NFCWriteStatus from './NFCWriteStatus'

interface SelectedLink {
  id: string
  slug: string
  label: string
  redirectUrl: string
}

const STEPS = ['select', 'write', 'result'] as const
type Step = typeof STEPS[number]
const STEP_LABELS: Record<Step, string> = { select: 'リンクを選択', write: 'タグにかざす', result: '完了' }

export default function NFCWriter() {
  const { isSupported, status, error, writeTag, reset } = useNFC()
  const { trackSuccess } = useAppReview()
  const [selectedLink, setSelectedLink] = useState<SelectedLink | null>(null)
  const [step, setStep] = useState<Step>('select')

  const handleSelect = useCallback((link: SelectedLink) => {
    setSelectedLink(link)
    setStep('write')
  }, [])

  const handleWrite = useCallback(async () => {
    if (!selectedLink) return
    const pivolinkUrl = `https://redirect.tsuratsura.com/r/${selectedLink.slug}`
    const success = await writeTag(pivolinkUrl)
    if (success) {
      setStep('result')
      trackSuccess()
    }
  }, [selectedLink, writeTag])

  const handleReset = useCallback(() => {
    reset()
    setSelectedLink(null)
    setStep('select')
  }, [reset])

  if (!isSupported) return null

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-lg font-bold">NFCタグ書き込み</h2>

      {/* ステップインジケーター */}
      <div className="flex items-center gap-2 mb-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s
                  ? 'bg-blue-600 text-white'
                  : i < STEPS.indexOf(step)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
              }`}
            >
              {i + 1}
            </div>
            {i < STEPS.length - 1 && <div className="w-8 h-0.5 bg-gray-200" />}
          </div>
        ))}
        <div className="ml-2 text-xs text-gray-500">
          {STEP_LABELS[step]}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Step 1: リンク選択 */}
      {step === 'select' && <LinkSelector onSelect={handleSelect} />}

      {/* Step 2: 書き込み */}
      {step === 'write' && selectedLink && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-full p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm font-medium text-blue-800">{selectedLink.label}</p>
            <p className="text-xs text-blue-600 mt-1">/{selectedLink.slug}</p>
          </div>

          {status === 'writing' ? (
            <div className="w-full max-w-sm aspect-square flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-blue-300">
              <div className="w-24 h-24 mb-4 text-blue-500 animate-pulse">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p className="text-sm text-blue-600 font-medium">書き込み中...</p>
              <p className="text-xs text-gray-400 mt-1">タグから離さないでください</p>
            </div>
          ) : (
            <>
              <div className="w-full max-w-sm aspect-square flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <div className="w-24 h-24 mb-4 text-gray-300">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">準備ができたら書き込みボタンを押してください</p>
              </div>

              <div className="flex gap-3 w-full max-w-sm">
                <button
                  onClick={() => {
                    reset()
                    setStep('select')
                  }}
                  className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-300 transition-colors"
                >
                  戻る
                </button>
                <button
                  onClick={handleWrite}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  書き込み開始
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 3: 結果 */}
      {step === 'result' && selectedLink && (
        <NFCWriteStatus
          success={status === 'success'}
          linkLabel={selectedLink.label}
          slug={selectedLink.slug}
          onReset={handleReset}
        />
      )}
    </div>
  )
}
