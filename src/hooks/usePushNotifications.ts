'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePlatform } from './usePlatform'
import { registerPush, isPushSupported } from '@/lib/capacitor/push'
import { createClient } from '@/lib/supabase/client'

interface UsePushReturn {
  isSupported: boolean
  isRegistered: boolean
  token: string | null
  register: () => Promise<void>
}

export function usePushNotifications(): UsePushReturn {
  const { isNative } = usePlatform()
  const [isSupported, setIsSupported] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    if (!isNative) return
    isPushSupported().then(setIsSupported)
  }, [isNative])

  const saveToken = useCallback(async (tokenValue: string, platform: string) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('device_tokens').upsert(
      {
        user_id: user.id,
        token: tokenValue,
        platform,
        is_active: true,
      },
      { onConflict: 'user_id,token' }
    )
  }, [])

  const register = useCallback(async () => {
    if (!isSupported) return

    const cleanup = await registerPush({
      onRegistration: async (t) => {
        setToken(t.value)
        setIsRegistered(true)
        // Supabaseにトークンを保存
        const platform = (await import('@capacitor/core')).Capacitor.getPlatform()
        await saveToken(t.value, platform)
      },
      onRegistrationError: () => {
        setIsRegistered(false)
      },
    })

    if (!cleanup) {
      setIsRegistered(false)
    }
  }, [isSupported, saveToken])

  return { isSupported, isRegistered, token, register }
}
