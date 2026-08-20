'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * メール確認リンクは Supabase の Site URL（= トップページ）へ
 * `#access_token=...&refresh_token=...` 付きで戻ってくる。
 * トップページには Supabase クライアントが無くトークンが捨てられていたため、
 * ここで拾ってセッションを張り、ダッシュボードへ送る。
 */
export default function AuthHashHandler() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash
    if (!hash || hash.length < 2) return

    const params = new URLSearchParams(hash.slice(1))
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const errorCode = params.get('error') || params.get('error_code')

    if (errorCode) {
      // リンク期限切れ等。ハッシュを消してログイン画面へ
      // 第1引数に null を渡すと App Router が持つ履歴 state ごと消えて
      // 後続の router.push が無反応になる。現在の state を保ったまま置き換える
      window.history.replaceState(window.history.state, '', window.location.pathname)
      router.push('/login')
      return
    }

    if (!accessToken || !refreshToken) return

    const supabase = createClient()
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        // 第1引数に null を渡すと App Router が持つ履歴 state ごと消えて
      // 後続の router.push が無反応になる。現在の state を保ったまま置き換える
      window.history.replaceState(window.history.state, '', window.location.pathname)
        if (!error) {
          router.push('/dashboard')
          router.refresh()
        } else {
          router.push('/login')
        }
      })
  }, [router])

  return null
}
