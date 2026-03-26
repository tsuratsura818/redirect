'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import jsQR from 'jsqr'
import { isPivolinkURL } from '@/lib/capacitor/nfc'

interface UseQRScannerReturn {
  isScanning: boolean
  videoRef: React.RefObject<HTMLVideoElement | null>
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  detectedSlug: string | null
  detectedUrl: string | null
  error: string | null
  startScan: () => Promise<void>
  stopScan: () => void
  reset: () => void
}

export function useQRScanner(): UseQRScannerReturn {
  const [isScanning, setIsScanning] = useState(false)
  const [detectedSlug, setDetectedSlug] = useState<string | null>(null)
  const [detectedUrl, setDetectedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)

  const stopScan = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }, [])

  // クリーンアップ
  useEffect(() => {
    return () => {
      stopScan()
    }
  }, [stopScan])

  const startScan = useCallback(async () => {
    setError(null)
    setDetectedSlug(null)
    setDetectedUrl(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setIsScanning(true)

      const scan = () => {
        if (!videoRef.current || !canvasRef.current) return

        const video = videoRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
          animationRef.current = requestAnimationFrame(scan)
          return
        }

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        })

        if (code?.data) {
          const slug = isPivolinkURL(code.data)
          if (slug) {
            setDetectedSlug(slug)
            setDetectedUrl(code.data)
            stopScan()
            return
          }
          // Pivolink以外のURL
          setDetectedUrl(code.data)
        }

        animationRef.current = requestAnimationFrame(scan)
      }

      animationRef.current = requestAnimationFrame(scan)
    } catch {
      setError('カメラへのアクセスが拒否されました')
      setIsScanning(false)
    }
  }, [stopScan])

  const reset = useCallback(() => {
    setDetectedSlug(null)
    setDetectedUrl(null)
    setError(null)
  }, [])

  return {
    isScanning,
    videoRef,
    canvasRef,
    detectedSlug,
    detectedUrl,
    error,
    startScan,
    stopScan,
    reset,
  }
}
