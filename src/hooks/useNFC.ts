'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePlatform } from './usePlatform'
import { isNFCSupported, startNFCScan, writeNFCTag, isPivolinkURL } from '@/lib/capacitor/nfc'

type NFCStatus = 'idle' | 'scanning' | 'writing' | 'success' | 'error'

interface UseNFCReturn {
  isSupported: boolean
  status: NFCStatus
  error: string | null
  detectedSlug: string | null
  startScan: () => Promise<void>
  stopScan: () => void
  writeTag: (redirectUrl: string) => Promise<boolean>
  reset: () => void
}

export function useNFC(): UseNFCReturn {
  const { isNative } = usePlatform()
  const [isSupported, setIsSupported] = useState(false)
  const [status, setStatus] = useState<NFCStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [detectedSlug, setDetectedSlug] = useState<string | null>(null)
  const [cleanup, setCleanup] = useState<(() => void) | null>(null)

  useEffect(() => {
    if (!isNative) return
    isNFCSupported().then(setIsSupported)
  }, [isNative])

  // コンポーネントアンマウント時にスキャン停止
  useEffect(() => {
    return () => {
      cleanup?.()
    }
  }, [cleanup])

  const startScan = useCallback(async () => {
    setStatus('scanning')
    setError(null)
    setDetectedSlug(null)

    const stop = await startNFCScan((tag) => {
      // タグのNDEFレコードからURLを取得
      for (const record of tag.records) {
        const slug = isPivolinkURL(record.payload)
        if (slug) {
          setDetectedSlug(slug)
          setStatus('success')
          return
        }
      }
      // Pivolink URLが見つからない場合
      setDetectedSlug(null)
      setStatus('idle')
    })

    if (!stop) {
      setStatus('error')
      setError('NFCスキャンを開始できませんでした')
      return
    }

    setCleanup(() => stop)
  }, [])

  const stopScan = useCallback(() => {
    cleanup?.()
    setCleanup(null)
    setStatus('idle')
  }, [cleanup])

  const writeTag = useCallback(async (redirectUrl: string): Promise<boolean> => {
    setStatus('writing')
    setError(null)

    const success = await writeNFCTag(redirectUrl)
    if (success) {
      setStatus('success')
    } else {
      setStatus('error')
      setError('NFCタグへの書き込みに失敗しました。タグをかざし直してください。')
    }
    return success
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setError(null)
    setDetectedSlug(null)
  }, [])

  return {
    isSupported,
    status,
    error,
    detectedSlug,
    startScan,
    stopScan,
    writeTag,
    reset,
  }
}
