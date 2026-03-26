'use client'

import { useState, useEffect } from 'react'
import { Capacitor } from '@capacitor/core'

interface PlatformInfo {
  isNative: boolean
  platform: 'web' | 'ios' | 'android'
  isWeb: boolean
  isIOS: boolean
  isAndroid: boolean
}

export function usePlatform(): PlatformInfo {
  const [info, setInfo] = useState<PlatformInfo>({
    isNative: false,
    platform: 'web',
    isWeb: true,
    isIOS: false,
    isAndroid: false,
  })

  useEffect(() => {
    const isNative = Capacitor.isNativePlatform()
    const platform = Capacitor.getPlatform() as 'web' | 'ios' | 'android'
    setInfo({
      isNative,
      platform,
      isWeb: !isNative,
      isIOS: platform === 'ios',
      isAndroid: platform === 'android',
    })
  }, [])

  return info
}
